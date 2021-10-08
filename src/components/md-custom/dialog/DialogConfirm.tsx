/*
 * @Author: Vir
 * @Date: 2021-05-01 01:23:50
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-07 21:12:48
 */

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  CheckCircleOutlined,
  InfoOutlined,
  HighlightOffOutlined,
  ReportProblemOutlined,
} from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog, { DialogProps } from './dialog';

export type confirmType = 'info' | 'success' | 'error' | 'warning';

export interface DialogConfirm extends DialogProps {
  type?: confirmType;
  content?: string;
}

const InfoContent = () => {
  return (
    <>
      <InfoOutlined className="MuiDialog-confirm-icon-info" />
    </>
  );
};

const SuccessContent = () => {
  return (
    <>
      <CheckCircleOutlined className="MuiDialog-confirm-icon-success" />
    </>
  );
};

const ErrorContent = () => {
  return (
    <>
      <HighlightOffOutlined className="MuiDialog-confirm-icon-error" />
    </>
  );
};

const WarningContent = () => {
  return (
    <>
      <ReportProblemOutlined className="MuiDialog-confirm-icon-warning" />
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

  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
