/*
 * @Author: Vir
 * @Date: 2022-01-14 15:58:10
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-30 23:04:07
 */
import React from 'react';
import Modal from '@/components/md-custom/dialog/dialog';
import Form from '@/components/md-custom/form';
import ConfigForm, { FormItemPropType } from '../configForm';

export interface FormModalProps {
  open: boolean;
  title: string;
  value?: any;
  config: FormItemPropType[];
  onCancel: () => void;
  onOk: (value: any) => void;
}

const FormModal: React.FC<FormModalProps> = (props) => {
  const form = Form.useForm();
  const { title, open, onCancel, onOk, config, value } = props;
  const { handleSubmit, reset } = form;
  return (
    <Modal
      title={title}
      open={open}
      onCancel={() => {
        onCancel();
        reset();
      }}
      onOk={() => {
        handleSubmit(onOk, (err) => {
          console.log(err);
        })();
      }}
    >
      {open && <ConfigForm form={form} config={config} value={value} />}
    </Modal>
  );
};

export default FormModal;
