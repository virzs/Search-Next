import { DialogTitle, DialogTitleProps, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React from 'react';

/*
 * @Author: Vir
 * @Date: 2021-04-11 19:59:33
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-11 22:47:25
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
    <DialogTitle {...props}>
      {children}
      {onClose ? (
        <IconButton aria-label="close" onClick={() => onClose}>
          <Close />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default DialogTitleCustom;
