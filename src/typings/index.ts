/*
 * @Author: Vir
 * @Date: 2021-09-12 16:36:09
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-12 16:42:13
 */

import { Router } from '@/config/router';
import { RouteComponentProps } from 'react-router-dom';

export interface PageProps extends RouteComponentProps {
  route: Router;
}

export interface ResultTypes {
  code?: number;
  msg: string;
  data?: object | any[];
}
