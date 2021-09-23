/*
 * @Author: Vir
 * @Date: 2021-09-20 23:33:20
 * @Last Modified by:   Vir
 * @Last Modified time: 2021-09-20 23:33:20
 */

import { DialogTitle, DialogTitleProps, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React from 'react';

/*
 * @Author: Vir
 * @Date: 2021-04-11 19:59:33
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-20 23:33:13
 */

export interface DialogTitleCustomProps extends DialogTitleProps {
  children: any;
  onClose?: () => void;
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
        <IconButton
          className="absolute right-3 top-3"
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
