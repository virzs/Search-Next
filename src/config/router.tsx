/*
 * @Author: Vir
 * @Date: 2021-09-11 15:26:27
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-15 14:28:04
 */

import { lazy } from 'react';
import {
  Brush,
  Navigation as NavigationIcon,
  ManageAccounts,
  PhotoLibrary,
  SettingsBackupRestore,
  SupervisorAccount,
  Update,
} from '@material-ui/icons';
import React from 'react';
import Auth from '@views/setting/auth';
import Info from '@views/setting/auth/info';
import SettingPage from '@pages/setting';
import Others from '@/views/setting/auth/others';
import Personalise from '@/views/setting/personalise';
import Background from '@/views/setting/personalise/background';
import Theme from '@/views/setting/personalise/theme/theme';
import About from '@/views/setting/about';
import History from '@/views/setting/about/releases';
import Releases from '@/views/setting/about/releases';
import Commits from '../views/setting/about/commits';
import Data from '@/views/setting/data';
import Logo from '@/views/setting/personalise/logo';
import Lab from '@/views/setting/lab';
import Backup from '@/views/setting/data/backup';
import Features from '@/views/setting/features';
import Navigation from '@/views/setting/navigation';

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
    title: '首页',
    component: lazy(() => import('@pages/index')),
  },
  {
    path: '/navigation/:classify?',
    title: '导航',
    component: lazy(() => import('@pages/navigation')),
  },
  {
    path: '/setting',
    title: '设置',
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
          // ! 主题功能暂时不开发，优先重构
          // {
          //   title: '主题',
          //   icon: <ColorLens />,
          //   path: '/setting/personalise/theme',
          //   component: Theme,
          // },
        ],
      },
      {
        title: '数据',
        exact: false,
        path: '/setting/data',
        component: Data,
      },
      {
        title: '实验室',
        exact: false,
        path: '/setting/lab',
        component: Lab,
        routes: [
          {
            title: 'Logo',
            icon: <Brush />,
            path: '/setting/lab/logo',
            component: Logo,
          },
          {
            title: '备份与恢复',
            icon: <SettingsBackupRestore />,
            path: '/setting/lab/backup',
            component: Backup,
          },
          {
            title: '导航页',
            icon: <NavigationIcon />,
            path: '/setting/lab/navigation',
            component: Navigation,
          },
          // {
          //   title: '功能',
          //   icon: <FeaturedPlayList />,
          //   path: '/setting/lab/features',
          //   component: Features,
          // },
        ],
      },
      {
        title: '关于',
        exact: false,
        path: '/setting/about',
        component: About,
        routes: [
          {
            title: '历史版本记录',
            icon: <Update />,
            path: '/setting/about/releases',
            component: Releases,
          },
          {
            title: '历史提交记录',
            icon: <Update />,
            path: '/setting/about/commits',
            component: Commits,
          },
        ],
      },
    ],
  },
  {
    path: '/help/:text',
    title: '帮助',
    component: lazy(() => import('@pages/help')),
  },
];

export default routers;
