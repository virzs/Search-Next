/*
 * @Author: Vir
 * @Date: 2021-09-21 16:04:34
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-21 16:17:50
 */

import { DialogTitle } from '@/components/md-custom/dialog';
import Form from '@/components/md-custom/form';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from '@material-ui/core';
import React from 'react';

export interface HandleAccountDialogProps {
  title?: string;
  open: boolean;
  value?: { [x: string]: any };
  onOk: (val: any) => void;
  onCancel: () => void;
}

const HandleAccountDialog: React.FC<HandleAccountDialogProps> = ({
  open,
  title,
  value,
  onOk,
  onCancel,
}) => {
  const { Item } = Form;
  const form = Form.useForm();
  const { handleSubmit, reset, setValue } = form;

  const handleCancel = () => {
    onCancel();
  };

  const handleOk = () => {
    handleSubmit(onOk, (err) => {
      console.log(err);
    })();
  };

  React.useEffect(() => {
    if (open && value) {
      setValue('username', value['username']);
    }
    if (!open) {
      setValue('username', '');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle onClose={onCancel}>
        {title ? title : '修改账户名称'}
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
        <Button disableElevation variant="outlined" onClick={handleCancel}>
          取消
        </Button>
        <Button
          disableElevation
          variant="contained"
          color="primary"
          type="submit"
          onClick={handleOk}
        >
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HandleAccountDialog;
