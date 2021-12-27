/*
 * @Author: Vir
 * @Date: 2021-04-10 21:52:45
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-10 16:02:20
 */

import { TextField } from '@mui/material';
import React from 'react';
import { RegisterOptions } from 'react-hook-form';
import Modal from '@/components/md-custom/dialog/dialog';
import Form from '@/components/md-custom/form';

// 网址 新增、编辑弹窗

export type SiteDialogType = 'add' | 'edit' | 'del';

interface SiteDialogPropTypes {
  open: boolean;
  type: SiteDialogType;
  value?: FormTypes;
  onClose: () => void;
  onSubmit: (val: FormTypes) => void;
}

export interface FormTypes {
  id?: string;
  name: string;
  url: string;
}

interface FormItemPropType {
  name: 'name' | 'url';
  label: string;
  placeholder: string;
  rules: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
}

interface FormTemplatePropType {
  id: string;
  items?: FormItemPropType[];
  defaultValues?: FormTypes;
  submit: (val: FormTypes) => void;
}

const SiteDialog: React.FC<SiteDialogPropTypes> = ({
  open,
  type,
  value,
  onClose,
  onSubmit,
}) => {
  const { Item } = Form;
  const form = Form.useForm();
  const { handleSubmit, reset } = form;

  // dialog提交
  const handleDialogSubmit = (val: FormTypes) => {
    if (type === 'del' && value) val = value;
    onSubmit(val);
  };
  // dialog取消
  const handleCancel = () => {
    onClose();
    reset();
  };

  React.useEffect(() => {
    reset(value);
  }, [value]);

  return (
    <Modal
      title={type === 'add' ? '添加网址' : '编辑网址'}
      open={open}
      onCancel={handleCancel}
      onOk={() => {
        handleSubmit(handleDialogSubmit, (err) => {
          console.log(err);
        })();
      }}
    >
      <Form form={form} size="small">
        <Item
          name="name"
          label="名称"
          rules={{ required: { value: true, message: '请输入名称' } }}
        >
          <TextField fullWidth variant="outlined" placeholder="请输入名称" />
        </Item>
        <Item
          name="url"
          label="网址"
          rules={{
            required: { value: true, message: '请输入网址' },
            pattern: {
              value:
                /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
              message: '网址格式不正确',
            },
          }}
        >
          <TextField fullWidth variant="outlined" placeholder="请输入网址" />
        </Item>
        <Item
          name="iconUrl"
          label="图标"
          rules={{
            pattern: {
              value:
                /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
              message: '图标网址格式不正确',
            },
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="请输入图标地址"
          />
        </Item>
      </Form>
    </Modal>
  );
};

export default SiteDialog;
