/*
 * @Author: Vir
 * @Date: 2021-04-10 21:52:45
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-18 17:42:36
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
import { useIntl } from 'react-intl';
import { DialogTitle } from '../material-ui-custom/dialog';
import './styles/dialog.less';

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
  const { formatMessage } = useIntl();
  const { handleSubmit, control, reset } = useForm<FormTypes>();

  // 表单模板
  const FormTemplate: React.FC<FormTemplatePropType> = ({
    id,
    items = [
      {
        name: 'name',
        label: formatMessage({ id: 'app.component.sitedialog.form.name' }),
        placeholder: formatMessage({
          id: 'app.component.sitedialog.placeholder.name',
        }),
        rules: {
          required: {
            value: true,
            message: formatMessage({
              id: 'app.component.sitedialog.placeholder.name',
            }),
          },
        },
      },
      {
        name: 'url',
        label: formatMessage({ id: 'app.component.sitedialog.form.url' }),
        placeholder: formatMessage({
          id: 'app.component.sitedialog.placeholder.url',
        }),
        rules: {
          required: {
            value: true,
            message: formatMessage({
              id: 'app.component.sitedialog.placeholder.url',
            }),
          },
          pattern: {
            value: /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
            message: formatMessage({
              id: 'app.component.sitedialog.error.url',
            }),
          },
        },
      },
    ],
    defaultValues,
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
            defaultValue={defaultValues?.[i.name]}
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
    return (
      <FormTemplate
        id="SiteForm"
        defaultValues={value}
        submit={handleDialogSubmit}
      />
    );
  };

  const delContent = () => {
    return <></>;
  };

  // dialog提交
  const handleDialogSubmit = (val: FormTypes) => {
    onSubmit(val);
  };
  // dialog取消
  const handleCancel = () => {
    reset();
    onClose();
  };

  React.useEffect(() => {}, [open]);

  return (
    <Dialog className="top-site-dialog" open={open} onClose={onClose}>
      <DialogTitle onClose={onClose}>
        {type === 'add' &&
          formatMessage({ id: 'app.component.sitedialog.title.add' })}
        {type === 'edit' &&
          formatMessage({ id: 'app.component.sitedialog.title.edit' })}
        {type === 'del' &&
          formatMessage({ id: 'app.component.sitedialog.title.del' })}
      </DialogTitle>
      <DialogContent>
        {type === 'add' && addContent()}
        {type === 'edit' && editContent()}
        {type === 'del' && delContent()}
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button disableElevation variant="contained" onClick={handleCancel}>
          {formatMessage({ id: 'app.global.dialog.cancel' })}
        </Button>
        <Button
          form="SiteForm"
          disableElevation
          variant="contained"
          color="primary"
          type="submit"
        >
          {formatMessage({ id: 'app.global.dialog.confirm' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SiteDialog;
