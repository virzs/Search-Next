/*
 * @Author: Vir
 * @Date: 2021-04-23 15:48:07
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-23 16:17:59
 */

import { SnackbarOrigin } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';

// 最大数量
const MAX_SNACK: number = 3;
// 自动隐藏时间，单位毫秒
const AUTO_HIDE_DURATION: number = 3000;
// 消息条位置，默认右上角
const POSITION: SnackbarOrigin = {
  vertical: 'top',
  horizontal: 'right',
};

interface NotistackPropsType {
  children: React.ReactNode;
}

const NotistackWrapper = ({ children }: NotistackPropsType) => (
  <SnackbarProvider
    maxSnack={MAX_SNACK}
    autoHideDuration={AUTO_HIDE_DURATION}
    anchorOrigin={POSITION}
  >
    {children}
  </SnackbarProvider>
);

export default NotistackWrapper;
