/*
 * @Author: Vir
 * @Date: 2021-10-07 10:16:22
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-07 21:43:42
 */

import React from 'react';
import {
  Fade,
  Modal as MModal,
  Backdrop,
  Button,
  IconButton,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Close } from '@material-ui/icons';

export interface DialogProps {
  open: boolean;
  title: string | (() => void);
  onOk: (value?: any) => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
  children?: any;
  container?: Element;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  onOk,
  onCancel,
  children,
  container,
}) => {
  const { t } = useTranslation();

  return (
    <MModal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={onCancel}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      container={container}
    >
      <Fade in={open}>
        <div className="bg-white rounded absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-100">
          <div className="p-3 py-2 font-bold text-base flex justify-between items-center">
            {title}
            <IconButton size="small" onClick={onCancel}>
              <Close />
            </IconButton>
          </div>
          <div className="p-4">{children}</div>
          <div className="p-2 flex justify-end gap-2">
            <Button variant="text" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button variant="text" onClick={onOk}>
              {t('submit')}
            </Button>
          </div>
        </div>
      </Fade>
    </MModal>
  );
};

export default Dialog;
