/*
 * @Author: Vir
 * @Date: 2021-05-01 01:23:50
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-20 09:32:13
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
  type?: confirmType | false;
  content?: string | React.ReactNode;
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
  const { open, title, content, type, ...rest } = props;

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
    <Dialog open={open} {...rest} title={title} {...rest}>
      {type !== false && getIconByType()}
      {content}
    </Dialog>
  );
};

export default DialogConfirm;
