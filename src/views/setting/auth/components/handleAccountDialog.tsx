/*
 * @Author: Vir
 * @Date: 2021-09-21 16:04:34
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-07 21:42:55
 */

import Form from '@/components/md-custom/form';
import Modal from '@/components/md-custom/dialog/dialog';
import { TextField } from '@mui/material';
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
    <Modal
      title={title ? title : '修改账户名称'}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
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
    </Modal>
  );
};

export default HandleAccountDialog;
