import { DialogTitle, DialogTitleProps, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React from 'react';
import './styles/dialog-title.less';

/*
 * @Author: Vir
 * @Date: 2021-04-11 19:59:33
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-12 09:52:33
 */

export interface DialogTitleCustomProps extends DialogTitleProps {
  children: any;
  onClose: () => void;
}

const DialogTitleCustom: React.FC<DialogTitleCustomProps> = ({
  onClose,
  children,
  ...props
}) => {
  return (
    <DialogTitle className="dialog-title-custom" {...props}>
      {children}
      {onClose ? (
        <IconButton
          className="dialog-title-custom-close"
          aria-label="close"
          onClick={onClose}
          size="small"
        >
          <Close />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default DialogTitleCustom;
