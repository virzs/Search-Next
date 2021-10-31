/*
 * @Author: Vir
 * @Date: 2021-09-20 23:42:17
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 15:28:15
 */

import {
  accountsCount,
  addAccount,
  delAccount,
  editAccount,
  findAccount,
  findAccountByName,
  findAccounts,
} from '@/apis/auth';
import ItemHeader from '@/components/layout/menu-layout/itemHeader';
import { Dialog } from '@/components/md-custom/dialog';
import { authDefaultData } from '@/data/account/default';
import { AuthData } from '@/data/account/interface';
import ItemAccordion, {
  AccordionDetailItem,
} from '@/pages/setting/components/itemAccordion';
import ItemCard from '@pages/setting/components/itemCard';
import { Button } from '@material-ui/core';
import { message } from 'antd';
import React from 'react';
import AccountCard from './components/accountCard';
import HandleAccountDialog from './components/handleAccountDialog';

const Others: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [account, setAccount] = React.useState({} as AuthData);
  const [others, setOthers] = React.useState<AuthData[]>([]);
  const [editData, setEditData] = React.useState(
    {} as {
      _id: string;
      username: string;
    },
  );

  // 获取除当前账户外的其他账户
  const getOtherAccounts = (id?: string | null) => {
    const others = findAccounts(id);
    setOthers([...others]);
  };

  // 初始化账户信息数据
  const initAuth = () => {
    const accountId = localStorage.getItem('account');
    if (accountId) {
      const data = findAccount(accountId);
      if (data) {
        setAccount(data);
        getOtherAccounts(accountId);
      }
    }
  };

  // 新增帐户
  const submit = ({ username }: { username: string }) => {
    const user = findAccountByName(username);
    if (user) {
      message.error('账户名称不能重复');
      return;
    }
    let data = {
      ...authDefaultData,
      username,
    };
    const inset = addAccount(data);
    if (inset) {
      message.success('添加成功');
      setOpen(false);
      const accountId = localStorage.getItem('account');
      getOtherAccounts(accountId);
    }
  };

  // 修改账户
  const edit = ({ username }: { username: string }) => {
    const update = editAccount(editData._id, {
      username,
    });
    if (update) {
      message.success('修改成功');
      setOpen(false);
      getOtherAccounts(account._id);
      setEditData({ _id: '', username: '' });
    }
  };

  // 切换账户
  const changeAccount = (id?: string) => {
    if (!id) {
      message.error('异常');
      return;
    }
    const data = findAccount(id);
    localStorage.setItem('account', id);
    setAccount(data);
    message.success('切换成功');
    getOtherAccounts(id);
  };

  // 删除账户
  const delAccountFunc = (id: string = '') => {
    const account = localStorage.getItem('account');

    if (account === id) {
      message.error('使用中的账户无法删除');
      return;
    }

    Dialog.confirm({
      title: '删除账户',
      type: 'warning',
      content: '删除当前账户将同时删除与该账户关联的所有数据',
      onOk: () => {
        const remove = delAccount(id);
        if (remove) {
          message.success('删除成功');
          getOtherAccounts(account);
        }
      },
    });
  };

  React.useEffect(() => {
    initAuth();
  }, []);

  return (
    <div>
      <ItemHeader title="当前账户" />
      <AccountCard account={account} />
      <ItemHeader title="其他账户" />
      <ItemCard
        title="添加其他账户"
        action={
          <Button
            variant="contained"
            disableElevation
            size="small"
            onClick={() => {
              const count = accountsCount();
              count >= 10
                ? message.error('最多可以创建10个账户')
                : setOpen(true);
            }}
          >
            添加账户
          </Button>
        }
      />
      <div className="flex flex-col gap-2 py-2">
        {others.map((i) => (
          <ItemAccordion key={i._id} title={i.username} disableDetailPadding>
            <AccordionDetailItem
              title="切换到此账户"
              action={
                <Button
                  variant="outlined"
                  disableElevation
                  size="small"
                  onClick={() => changeAccount(i._id)}
                >
                  切换
                </Button>
              }
            />
            <AccordionDetailItem
              title="修改账户"
              action={
                <Button
                  variant="outlined"
                  disableElevation
                  size="small"
                  color="warning"
                  onClick={() => {
                    setOpen(true);
                    setEditData({
                      _id: i._id || '',
                      username: i.username,
                    });
                  }}
                >
                  修改
                </Button>
              }
            />
            <AccordionDetailItem
              title="删除账户"
              action={
                <Button
                  variant="outlined"
                  disableElevation
                  color="error"
                  size="small"
                  onClick={() => delAccountFunc(i._id)}
                >
                  删除
                </Button>
              }
            />
          </ItemAccordion>
        ))}
      </div>
      <HandleAccountDialog
        title={editData._id ? '修改账户' : '新增账户'}
        value={editData}
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        onOk={editData._id ? edit : submit}
      />
    </div>
  );
};

export default Others;
