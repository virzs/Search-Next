/*
 * @Author: Vir
 * @Date: 2021-04-23 15:48:07
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-23 16:17:59
 */

import { IconButton, SnackbarOrigin } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { SnackbarKey, SnackbarProvider } from 'notistack';
import React from 'react';

// 最大数量
const MAX_SNACK: number = 3;
// 自动隐藏时间，单位毫秒
const AUTO_HIDE_DURATION: number = 3000;
// 消息条位置，默认右上角
const POSITION: SnackbarOrigin = {
  vertical: 'bottom',
  horizontal: 'right',
};
// 隐藏图标
const HIDE_ICON = false;
// 是否防止重复，false可显示多条
const PREVENT_DUPLICATE = false;

interface NotistackPropsType {
  children: React.ReactNode;
}

type refType =
  | ((
      | string
      | React.RefObject<SnackbarProvider>
      | ((instance: SnackbarProvider | null) => void)
    ) &
      (
        | React.RefObject<SnackbarProvider>
        | ((instance: SnackbarProvider | null) => void)
      ))
  | null
  | undefined;

const NotistackWrapper = ({ children }: NotistackPropsType) => {
  const notistackRef: refType = React.createRef();
  const onClickDismiss = (key: SnackbarKey, ref: SnackbarProvider) => () => {
    ref.closeSnackbar(key);
  };
  return (
    <SnackbarProvider
      maxSnack={MAX_SNACK}
      autoHideDuration={AUTO_HIDE_DURATION}
      anchorOrigin={POSITION}
      hideIconVariant={HIDE_ICON}
      preventDuplicate={PREVENT_DUPLICATE}
      ref={notistackRef}
      action={(key) =>
        notistackRef.current && (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClickDismiss(key, notistackRef.current)}
          >
            <Close fontSize="inherit" />
          </IconButton>
        )
      }
    >
      {children}
    </SnackbarProvider>
  );
};

export default NotistackWrapper;
