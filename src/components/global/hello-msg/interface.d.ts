/*
 * @Author: Vir
 * @Date: 2021-06-02 13:43:01
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-02 14:07:05
 */

import { HitokotoType } from '@/apis/hitokoto/interface';
import { SnackbarKey } from 'notistack';

interface HelloMsgResolveType {
  content: string;
  hitokoto?: HitokotoType;
  node: (
    key: SnackbarKey,
    closeSnackbar: (key?: SnackbarKey | undefined) => void,
  ) => React.ReactNode | Element;
}
