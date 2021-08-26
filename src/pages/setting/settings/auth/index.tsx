/*
 * @Author: Vir
 * @Date: 2021-08-14 23:24:26
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-24 17:50:14
 */

import ContentHeader from '@/components/global/menu-layout/contentHeader';
import BorderColorCard from '@/components/material-ui-custom/card/BorderColorCard';
import StorageDB from '@/utils/storage';
import {
  Avatar,
  Button,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from '@material-ui/core';
import React from 'react';
import { AuthDefaultData, authDefaultData } from '@/data/account/default';
import ContentItemTitle from '@/components/global/menu-layout/contentItemTitle';
import { Add, MoreHoriz } from '@material-ui/icons';
import Form from '@/components/material-ui-custom/form';
import { DialogTitle, Modal } from '@/components/material-ui-custom/dialog';
import { useIntl } from 'react-intl';
import { Alert } from '@material-ui/lab';
import { useSnackbar } from 'notistack';

const Auth: React.FC = () => {
  // 连接数据库
  const setting = new StorageDB({
    storage: localStorage,
    database: 'setting',
  });
  const auth = setting.get('auth');

  const [account, setAccount] = React.useState({} as AuthDefaultData);
  const [count, setCount] = React.useState<number>(0);
  const [open, setOpen] = React.useState<boolean>(false);
  const [others, setOthers] = React.useState<AuthDefaultData[]>([]);
  const [menuOpen, setMenuOpen] = React.useState<string>('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [editData, setEditData] = React.useState(
    {} as {
      _id: string;
      username: string;
    },
  );

  const form = Form.useForm();

  const { handleSubmit, reset, setValue } = form;
  const { enqueueSnackbar } = useSnackbar();
  const { formatMessage } = useIntl();
  const { Item } = Form;

  // 开启菜单
  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string = '',
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(id);
  };

  // 关闭菜单
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOpen('');
  };

  // 不存在账户信息时设置
  const noAccountSet = () => {
    const inset = auth.inset(authDefaultData);
    localStorage.setItem('account', inset._id);
    setAccount(authDefaultData);
    getOtherAccounts(inset._id);
  };

  const initAccountCount = () => {
    setCount(auth.count());
  };

  const getOtherAccounts = (id?: string) => {
    const others = auth.find({
      _id: {
        $ne: id || localStorage.getItem('account'),
      },
    });
    setOthers(others);
  };

  // 切换账户
  const changeAccount = (id?: string) => {
    if (!id) {
      enqueueSnackbar('异常', { variant: 'error' });
      return;
    }
    const data = auth.findOne(id);
    localStorage.setItem('account', id);
    setAccount(data);
    getOtherAccounts(id);
  };

  // 删除账户
  const delAccount = (id: string = '') => {
    const account = localStorage.getItem('account');

    if (account === id) {
      enqueueSnackbar('使用中的账户无法删除', { variant: 'error' });
      return;
    }
    handleMenuClose();

    Modal.confirm({
      title: '删除组件',
      content: '删除当前账户将同时删除与该账户关联的所有数据',
      onOk: () => {
        const remove = auth.remove(id);
        if (remove) {
          enqueueSnackbar('删除成功', { variant: 'success' });
          getOtherAccounts();
        }
      },
    });
  };

  // 初始化账户信息数据
  const initAuth = () => {
    const accountId = localStorage.getItem('account');
    if (accountId) {
      const data = auth.findOne(accountId);
      if (data) {
        setAccount(data);
        getOtherAccounts();
      } else {
        noAccountSet();
      }
    } else {
      noAccountSet();
    }
  };

  // dialog取消
  const handleCancel = () => {
    setOpen(false);
    setEditData({ _id: '', username: '' });
    reset();
  };

  // 添加本地账户
  const addAccount = ({ username }: { username: string }) => {
    // 新增
    if (!editData._id) {
      const user = auth.findOne({
        username: {
          $eq: username,
        },
      });
      if (user) {
        enqueueSnackbar('账户名称不能重复', { variant: 'warning' });
        return;
      }
      let data = {
        ...authDefaultData,
        username,
      };
      const inset = auth.inset(data);
      if (inset) {
        enqueueSnackbar('保存成功', { variant: 'success' });
        handleCancel();
        initAccountCount();
        getOtherAccounts();
      }
    } else {
      // 编辑
      const update = auth.update(editData._id, {
        username,
      });
      if (update) {
        enqueueSnackbar('修改成功', { variant: 'success' });
        handleCancel();
        initAccountCount();
        getOtherAccounts();
        setEditData({ _id: '', username: '' });
      }
    }
  };

  const AccountCard = (account: AuthDefaultData) => {
    return (
      <BorderColorCard style={{ marginBottom: '8px' }} key={account.username}>
        <CardHeader
          avatar={
            <Avatar>
              {account?.username?.split('')[0].toLocaleUpperCase()}
            </Avatar>
          }
          title={account.username}
          subheader={account.type == 'local' ? '本地账户' : '云账户'}
          action={
            <>
              <IconButton
                aria-label="settings"
                onClick={(e) =>
                  handleMenuClick(e, account._id ? account._id : '')
                }
              >
                <MoreHoriz />
              </IconButton>
              {localStorage.getItem('account') !== account._id && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => changeAccount(account._id)}
                >
                  切换
                </Button>
              )}
            </>
          }
        ></CardHeader>
        <Menu
          open={menuOpen === account._id}
          anchorEl={anchorEl}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              setOpen(true);
              setEditData({
                _id: account._id ? account._id : '',
                username: account.username,
              });
              setValue('username', account.username);
              handleMenuClose();
            }}
          >
            修改
          </MenuItem>
          {localStorage.getItem('account') !== account._id && (
            <MenuItem onClick={() => delAccount(account._id)}>删除</MenuItem>
          )}
        </Menu>
      </BorderColorCard>
    );
  };

  React.useEffect(() => {
    initAuth();
    initAccountCount();
  }, []);

  return (
    <div>
      <ContentHeader
        title="用户配置"
        action={
          <Button
            startIcon={<Add />}
            onClick={() => {
              const count = auth.count();
              count >= 10
                ? enqueueSnackbar('最多可以创建10个账户', {
                    variant: 'warning',
                  })
                : setOpen(true);
            }}
          >
            添加账户
          </Button>
        }
      />
      <Alert severity="warning">这是一个正在开发的功能，不保证可用性。</Alert>
      <ContentItemTitle
        title="当前账户"
        desc="当前使用的账户，网站中所有数据将关联到此账户。当前版本所有存储均放置在本地，不会上传到服务器，但部分功能可能需要基于本地数据实现。该功能正处于早期版本，可能会出现报错，兼容性等问题，请谨慎使用。"
      />
      {AccountCard(account)}
      {count > 1 && (
        <>
          <ContentItemTitle title="其他账户" />
          {others.map((i: AuthDefaultData) => AccountCard(i))}
        </>
      )}
      {/* 新增账户 */}
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle onClose={handleCancel}>
          {editData._id ? '修改' : '添加'}账户
        </DialogTitle>
        <DialogContent>
          <Form form={form} size="small">
            <Item
              name="username"
              label="账户名称"
              rules={{ required: { value: true, message: '请输入账户名称' } }}
            >
              <TextField variant="outlined" placeholder="请输入账户名称" />
            </Item>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button disableElevation variant="contained" onClick={handleCancel}>
            {formatMessage({ id: 'app.global.dialog.cancel' })}
          </Button>
          <Button
            disableElevation
            variant="contained"
            color="primary"
            type="submit"
            onClick={() => {
              handleSubmit(addAccount, (err) => {
                console.log(err);
              })();
            }}
          >
            {formatMessage({ id: 'app.global.dialog.confirm' })}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Auth;
