/*
 * @Author: Vir
 * @Date: 2021-09-11 15:26:27
 * @Last Modified by: Vir
 * @Last Modified time: 2022-07-03 21:25:20
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
  Api,
  FeaturedPlayList,
  Message as MessageIcon,
  Search,
  BugReportOutlined,
  NewReleases,
  ColorLens,
  WbSunny,
  FolderOutlined,
} from '@mui/icons-material';
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
import Navigation from '@/views/setting/features/navigation';
import OtherApis from '@/views/setting/otherApis';
import Message from '@/views/setting/features/message';
import Engine from '@/views/setting/features/engine';
import Channel from '@/views/setting/about/channel';
import EngineDetail from '@/views/setting/features/engine/engineDetail';
import ReleasesView from '@/views/setting/features/message/release';
import Weather from '@/views/setting/features/weather';
import SearchBar from '@/views/setting/personalise/searchBar';
import Dependencies from '@/views/setting/about/dependencies';
import { ChannelType } from '@/data/channel';

/**
 * 关于 component 额外说明
 * 本想在 App.tsx 中统一使用 lazy 方式加载组件，但 vite 会提示错误，暂未找到解决方法
 * 当前在配置路由时使用 lazy 加载
 *
 * 关于部分页面未使用按需加载
 * 部分layout中的页面使用按需加载时会显示loading页，造成闪屏问题
 */
export type RouterStatus = 'done' | 'beta' | 'process';

export interface Router {
  path: string;
  component?: any;
  exact?: boolean; // 精确匹配，默认 true，设置 false 一般用于 layout 路由
  routes?: Router[];
  redirect?: string;
  wrappers?: string[];
  title?: string;
  icon?: any;
  status?: RouterStatus; // 当前状态
  channel?: ChannelType; // 预览渠道
}

const routers: Router[] = [
  {
    path: '/',
    title: '首页',
    component: lazy(() => import('@pages/index')),
  },
  {
    path: 'navigation/:classify',
    title: '导航',
    component: lazy(() => import('@pages/navigation')),
  },
  {
    path: 'setting',
    title: '设置',
    exact: false,
    component: SettingPage,
    routes: [
      {
        title: '账户',
        path: 'auth',
        component: Auth,
        routes: [
          {
            title: '账户信息',
            icon: <ManageAccounts />,
            path: 'info',
            component: Info,
          },
          {
            title: '其他账户',
            icon: <SupervisorAccount />,
            path: 'others',
            component: Others,
          },
        ],
      },
      {
        title: '个性化',
        path: 'personalise',
        component: Personalise,
        routes: [
          {
            title: '背景',
            icon: <PhotoLibrary />,
            path: 'background',
            component: Background,
          },
          {
            title: 'Logo',
            icon: <Brush />,
            path: 'logo',
            component: Logo,
          },
          {
            title: '主题',
            icon: <ColorLens />,
            path: 'theme',
            component: Theme,
          },
        ],
      },
      {
        title: '功能',
        icon: <FeaturedPlayList />,
        path: 'features',
        component: Features,
        routes: [
          {
            title: '导航页',
            icon: <NavigationIcon />,
            path: 'navigation',
            component: Navigation,
          },
          {
            title: '通知与消息',
            icon: <MessageIcon />,
            path: 'message',
            component: Message,
            routes: [
              {
                title: '版本更新',
                icon: <NewReleases />,
                path: 'release',
                component: ReleasesView,
              },
            ],
          },
        ],
      },
      {
        title: '数据',
        path: 'data',
        component: Data,
        routes: [
          {
            title: '备份与恢复',
            icon: <SettingsBackupRestore />,
            path: 'backup',
            component: Backup,
          },
        ],
      },
      {
        title: '实验室',
        path: 'lab',
        component: Lab,
        routes: [
          {
            title: '第三方API',
            icon: <Api />,
            path: 'otherApis',
            component: OtherApis,
          },
          {
            title: '搜索引擎',
            icon: <Search />,
            path: 'search-engine',
            component: Engine,
            channel: 'beta',
            routes: [
              {
                title: '搜索引擎详情',
                icon: <Search />,
                path: 'engine-detail/:id',
                component: EngineDetail,
              },
            ],
          },
          {
            title: '天气',
            icon: <WbSunny />,
            path: 'weather',
            component: Weather,
            channel: 'beta',
          },
          {
            title: '搜索框',
            icon: <Search />,
            path: 'search-bar',
            component: SearchBar,
            status: 'process',
            channel: 'dev',
          },
        ],
      },
      {
        title: '关于',
        path: 'about',
        component: About,
        routes: [
          {
            title: '历史版本记录',
            icon: <Update />,
            path: 'releases',
            component: Releases,
          },
          {
            title: '历史提交记录',
            icon: <Update />,
            path: 'commits',
            component: Commits,
          },
          {
            title: '预览渠道',
            icon: <BugReportOutlined />,
            path: 'channel',
            component: Channel,
          },
          {
            title: '项目依赖',
            icon: <FolderOutlined />,
            path: 'dependencies',
            component: Dependencies,
          },
        ],
      },
      {
        title: '',
        path: '*',
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
