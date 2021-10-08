/*
 * @Author: Vir
 * @Date: 2021-04-10 21:33:12
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-03 21:01:12
 */
import React from 'react';
import SiteDialog, { FormTypes, SiteDialogType } from './dialog';
import SiteCard from './siteCard';
import DialogConfirm from '@/components/md-custom/dialog/dialogConfirm';
import { replaceUrlNotHaveHttpsOrHttpToHttps } from '@/utils/common';
import {
  addCount,
  addSite,
  delSite,
  editSite,
  findSite,
  repeal,
  Site,
} from '@/apis/site';
import { message } from 'antd';

const Sites: React.FC = (props) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [type, setType] = React.useState<SiteDialogType>('add');
  const [editValue, setEditValue] = React.useState({} as Site);
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);
  const [delId, setDelId] = React.useState<string>('');
  const [siteList, setSiteList] = React.useState<Site[]>([]);

  const getSiteList = () => {
    const result = findSite();
    setSiteList(result);
  };

  const itemClick = (val: Site) => {
    addCount(val._id);
    window.open(replaceUrlNotHaveHttpsOrHttpToHttps(val.url));
    getSiteList();
  };

  const onAdd = () => {
    setType('add');
    setOpen(true);
  };

  const onEdit = (value: Site) => {
    setType('edit');
    setEditValue(value);
    setOpen(true);
  };

  const onRemove = (id: string) => {
    setDelId(id);
    setConfirmOpen(true);
  };

  const remove = () => {
    const result = delSite(delId);
    if (result) {
      setConfirmOpen(false);
      getSiteList();
      message.success('删除成功');
      // TODO 删除后撤销功能
      // enqueueSnackbar('删除成功', {
      //   variant: 'info',
      //   action: () => (
      //     <Button
      //       style={{ color: '#fff' }}
      //       onClick={() => {
      //         const result = repeal();
      //         if (result) {
      //           enqueueSnackbar('撤销成功', { variant: 'success' });
      //           getSiteList();
      //         }
      //       }}
      //     >
      //       撤销
      //     </Button>
      //   ),
      // });
    } else {
      message.error('删除成功');
      // enqueueSnackbar('删除失败', { variant: 'warning' });
    }
  };

  const dialogClose = () => {
    setOpen(false);
    getSiteList();
    setEditValue({ _id: '', name: '', url: '', count: 0 });
  };

  const dialogSubmit = (val: FormTypes) => {
    if (type === 'add') {
      const result = addSite(val);
      if (result) {
        message.success('添加成功');
        // enqueueSnackbar('添加成功', { variant: 'success' });
        dialogClose();
      } else {
        message.error('添加失败');
        // enqueueSnackbar('保存失败', { variant: 'warning' });
      }
    }
    if (type === 'edit') {
      const result = editSite(editValue._id, val);
      if (result) {
        message.success('修改成功');
        // enqueueSnackbar('修改成功', { variant: 'success' });
        dialogClose();
      } else {
        message.error('修改失败');
        // enqueueSnackbar('保存失败', { variant: 'warning' });
      }
    }
  };

  React.useEffect(() => {
    getSiteList();
  }, []);

  return (
    <>
      <div className="flex justify-center items-center gap-2 h-full">
        {siteList.map((i) => (
          <SiteCard
            key={i._id}
            item={i}
            onClick={() => itemClick(i)}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
        <SiteCard type="add" onAdd={onAdd} />
      </div>
      <SiteDialog
        open={open}
        type={type}
        value={editValue}
        onSubmit={dialogSubmit}
        onClose={dialogClose}
      />
      <DialogConfirm
        title="删除"
        type="warning"
        content="是否删除此网址"
        open={confirmOpen}
        onOk={remove}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default Sites;
