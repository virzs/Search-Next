/*
 * @Author: Vir
 * @Date: 2021-09-19 23:23:36
 * @Last Modified by: Vir
 * @Last Modified time: 2022-03-02 14:45:18
 */

import { editAccount } from '@/apis/auth';
import ItemHeader from '@/components/layout/menu-layout/itemHeader';
import { Dialog } from '@/components/md-custom/dialog';
import Form from '@/components/md-custom/form';
import { AuthData } from '@/data/account/interface';
import ItemCard from '@/pages/setting/components/itemCard';
import { PageProps } from '@/typings';
import { Button, TextField } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import AccountCard from './components/accountCard';
import { getAccount } from './utils/acount';

export interface UpdateAccountForm {
  username: string;
}

const Info: React.FC<PageProps> = () => {
  const [account, setAccount] = React.useState<AuthData>({} as AuthData);
  const [open, setOpen] = React.useState<boolean>(false);
  const [editData, setEditData] = React.useState(
    {} as {
      _id: string;
      username: string;
    },
  );

  const { Item } = Form;
  const form = Form.useForm<UpdateAccountForm>();
  const { handleSubmit, reset, setValue } = form;

  // dialog取消
  const handleCancel = () => {
    setOpen(false);
    setEditData({ _id: '', username: '' });
    setValue('username', '');
  };

  const updateAccount = ({ username }: UpdateAccountForm) => {
    const update = editAccount(editData._id, {
      username,
    });
    if (update) {
      handleCancel();
      setEditData({ _id: '', username: '' });
      setAccount(getAccount());
      toast.success('修改成功');
    }
  };

  React.useEffect(() => {
    setAccount(getAccount());
  }, []);

  return (
    <div>
      <AccountCard account={account} />
      <ItemHeader
        title="账户设置"
        desc="当前使用的账户，网站中所有数据将关联到此账户。当前版本所有存储均放置在本地，不会上传到服务器，但部分功能可能需要基于本地数据实现。该功能正处于早期版本，可能会出现报错，兼容性等问题，请谨慎使用。"
      />
      <ItemCard
        title="账户名称"
        desc="修改账户名称"
        action={
          <Button
            variant="outlined"
            onClick={() => {
              setOpen(true);
              setEditData({
                _id: account._id ? account._id : '',
                username: account.username,
              });
              setValue('username', account.username);
            }}
          >
            修改名称
          </Button>
        }
      />
      <Dialog
        title="修改账户名称"
        open={open}
        onCancel={handleCancel}
        onOk={() => {
          handleSubmit(updateAccount, (err) => {
            console.log(err);
          })();
        }}
      >
        <Form form={form} size="small">
          <Item
            name="username"
            label="账户名称"
            rules={{ required: { value: true, message: '请输入账户名称' } }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="请输入账户名称"
            />
          </Item>
        </Form>
      </Dialog>
    </div>
  );
};

export default Info;
