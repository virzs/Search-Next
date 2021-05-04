/*
 * @Author: Vir
 * @Date: 2021-05-01 01:23:50
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-04 16:37:26
 */

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  CheckCircleOutlined,
  InfoOutlined,
  HighlightOffOutlined,
  ReportProblemOutlined,
} from '@material-ui/icons';
import React from 'react';
import { DialogTitle } from '.';
import './styles/dialog-confirm.less';

export type confirmType = 'info' | 'success' | 'error' | 'warning';

export interface DialogConfirm extends DialogProps {
  okText?: string;
  cancelText?: string;
  type?: confirmType;
  content?: string;
  onOk?: (value: any) => void;
  onCancel?: () => void;
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
    onClose,
    okText,
    cancelText,
    onOk,
    onCancel,
    ...rest
  } = props;

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
    <Dialog
      className="MuiDialog-confirm"
      open={open}
      onClose={onCancel}
      fullScreen={fullScreen}
      {...rest}
    >
      <DialogTitle onClose={onCancel}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {getIconByType()}
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disableElevation variant="contained" onClick={onCancel}>
          {cancelText ? cancelText : 'Cancel'}
        </Button>
        <Button
          disableElevation
          variant="contained"
          color="primary"
          onClick={onOk}
        >
          {okText ? okText : 'Ok'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogConfirm;
