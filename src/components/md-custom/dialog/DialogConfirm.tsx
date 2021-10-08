/*
 * @Author: Vir
 * @Date: 2021-05-01 01:23:50
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-07 21:12:48
 */

import {
  CheckCircleOutlined,
  InfoOutlined,
  HighlightOffOutlined,
  ReportProblemOutlined,
} from '@material-ui/icons';
import React from 'react';
import Dialog, { DialogProps } from './dialog';

export type confirmType = 'info' | 'success' | 'error' | 'warning';

export interface DialogConfirm extends DialogProps {
  type?: confirmType;
  content?: string;
}

const InfoContent = () => {
  return (
    <>
      <InfoOutlined className="text-blue-500 mr-1" />
    </>
  );
};

const SuccessContent = () => {
  return (
    <>
      <CheckCircleOutlined className="text-green-500 mr-1" />
    </>
  );
};

const ErrorContent = () => {
  return (
    <>
      <HighlightOffOutlined className="text-red-500 mr-1" />
    </>
  );
};

const WarningContent = () => {
  return (
    <>
      <ReportProblemOutlined className="text-yellow-500 mr-1" />
    </>
  );
};

const DialogConfirm: React.FC<DialogConfirm> = (props) => {
  const {
    open,
    title,
    content,
    type,
    okText,
    cancelText,
    onOk,
    onCancel,
    ...rest
  } = props;

  const getIconByType = () => {
    const typeMap = {
      info: InfoContent(),
      success: SuccessContent(),
      error: ErrorContent(),
      warning: WarningContent(),
    };
    return type ? typeMap[type] : InfoContent();
  };

  return (
    <Dialog open={open} onCancel={onCancel} onOk={onOk} title={title} {...rest}>
      {getIconByType()}
      {content}
    </Dialog>
  );
};

export default DialogConfirm;
