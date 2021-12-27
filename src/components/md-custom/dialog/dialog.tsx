/*
 * @Author: Vir
 * @Date: 2021-10-07 10:16:22
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-27 14:03:53
 */

import React from 'react';
import {
  Fade,
  Modal as MModal,
  Backdrop,
  Button,
  IconButton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Close } from '@mui/icons-material';
import classnames from 'classnames';
import { css } from '@emotion/css';

export interface DialogProps {
  open: boolean;
  title: string | (() => void);
  onOk: (value?: any) => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
  children?: any;
  container?: Element;
  width?: string | number;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  onOk,
  onCancel,
  okText,
  cancelText,
  children,
  container,
  width = 520,
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
        <div
          className={classnames(
            'rounded transform mx-auto relative top-28',
            css`
              width: ${typeof width === 'number' ? width + 'px' : width};
              max-width: calc(100vw - 32px);
              background-color: rgba(255, 255, 255, 0.9);
              backdrop-filter: blur(8px);
            `,
          )}
        >
          <div className="p-3 py-2 font-bold text-base flex justify-between items-center">
            {title}
            <IconButton size="small" onClick={onCancel}>
              <Close />
            </IconButton>
          </div>
          <div className="p-4">{children}</div>
          <div className="p-2 flex justify-end gap-2">
            <Button variant="text" onClick={onCancel}>
              {cancelText ? cancelText : t('cancel')}
            </Button>
            <Button variant="text" onClick={onOk}>
              {okText ? okText : t('submit')}
            </Button>
          </div>
        </div>
      </Fade>
    </MModal>
  );
};

export default Dialog;
