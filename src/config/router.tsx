/*
 * @Author: Vir
 * @Date: 2021-09-11 15:26:27
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-23 15:11:47
 */

import { lazy } from 'react';
import {
  ManageAccounts,
  PhotoLibrary,
  SupervisorAccount,
} from '@material-ui/icons';
import React from 'react';
import Auth from '@views/setting/auth';
import Info from '@views/setting/auth/info';
import SettingPage from '@pages/setting';
import Others from '@/views/setting/auth/others';
import Personalise from '@/views/setting/personalise';
import Background from '@/views/setting/personalise/background';

/**
 * 关于 component 额外说明
 * 本想在 App.tsx 中统一使用 lazy 方式加载组件，但 vite 会提示错误，暂未找到解决方法
 * 当前在配置路由时使用 lazy 加载
 *
 * 关于部分页面未使用按需加载
 * 部分layout中的页面使用按需加载时会显示loading页，造成闪屏问题
 */

export interface Router {
  path: string;
  component?: any;
  exact?: boolean; // 精确匹配，默认 true，设置 false 一般用于 layout 路由
  routes?: Router[];
  redirect?: string;
  wrappers?: string[];
  title?: string;
  icon?: any;
}

const routers: Router[] = [
  {
    path: '/',
    component: lazy(() => import('@pages/index')),
  },
  {
    path: '/navigation',
    component: lazy(() => import('@pages/navigation')),
  },
  {
    path: '/setting',
    exact: false,
    component: SettingPage,
    routes: [
      {
        title: '账户',
        exact: false,
        path: '/setting/auth',
        component: Auth,
        routes: [
          {
            title: '账户信息',
            icon: <ManageAccounts />,
            path: '/setting/auth/info',
            component: Info,
          },
          {
            title: '其他账户',
            icon: <SupervisorAccount />,
            path: '/setting/auth/others',
            component: Others,
          },
        ],
      },
      {
        title: '个性化',
        exact: false,
        path: '/setting/personalise',
        component: Personalise,
        routes: [
          {
            title: '背景',
            icon: <PhotoLibrary />,
            path: '/setting/personalise/background',
            component: Background,
          },
        ],
      },
    ],
  },
];

export default routers;
