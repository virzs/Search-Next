/*
 * @Author: Vir
 * @Date: 2021-04-10 21:52:45
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-04 15:50:52
 */

import {
  Dialog,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@material-ui/core';
import React from 'react';
import { Controller, RegisterOptions, useForm } from 'react-hook-form';
import { DialogTitle } from '@/components/md-custom/dialog';

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
  const { handleSubmit, control, reset } = useForm<FormTypes>();

  // 表单模板
  const FormTemplate: React.FC<FormTemplatePropType> = ({
    id,
    items = [
      {
        name: 'name',
        label: '名称',
        placeholder: '请输入名称',
        rules: {
          required: {
            value: true,
            message: '请输入名称',
          },
        },
      },
      {
        name: 'url',
        label: '网址',
        placeholder: '请输入网址',
        rules: {
          required: {
            value: true,
            message: '请输入网址',
          },
          pattern: {
            value:
              /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
            message: '网址格式不正确',
          },
        },
      },
    ],
    submit,
  }) => {
    return (
      <form id={id} onSubmit={handleSubmit(submit)}>
        {items.map((i, index) => (
          <Controller
            key={index}
            control={control}
            name={i.name}
            rules={i.rules}
            render={({ field: { onChange, ref }, fieldState: { error } }) => (
              <TextField
                inputRef={ref}
                onChange={onChange}
                variant="outlined"
                fullWidth
                size="small"
                autoComplete="off"
                error={error ? true : false}
                style={{ margin: '8px 0' }}
                label={i.label}
                placeholder={i.placeholder}
                helperText={error ? error.message : null}
              ></TextField>
            )}
          />
        ))}
      </form>
    );
  };

  const addContent = () => {
    return <FormTemplate id="SiteForm" submit={handleDialogSubmit} />;
  };

  const editContent = () => {
    return <FormTemplate id="SiteForm" submit={handleDialogSubmit} />;
  };

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
    <Dialog className="top-site-dialog" open={open} onClose={handleCancel}>
      <DialogTitle onClose={onClose}>
        {type === 'add' && '添加网址'}
        {type === 'edit' && '编辑网址'}
      </DialogTitle>
      <DialogContent>
        {type === 'add' && addContent()}
        {type === 'edit' && editContent()}
      </DialogContent>
      <DialogActions className="pt-2 px-4 pb-4">
        <Button disableElevation variant="contained" onClick={handleCancel}>
          取消
        </Button>
        <Button
          form="SiteForm"
          disableElevation
          variant="contained"
          color="primary"
          type="submit"
        >
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SiteDialog;
