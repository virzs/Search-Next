/*
 * @Author: Vir
 * @Date: 2021-06-10 11:38:40
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-14 23:26:18
 */
import {
  PaletteOutlined,
  TranslateOutlined,
  AccountBoxOutlined,
  VisibilityOutlined,
  InfoOutlined,
  Storage,
} from '@material-ui/icons';
import { SettingType } from './interface';
import About from './settings/about';
import Auth from './settings/auth';
import Locales from './settings/locales';
import Personalise from './settings/personalise';

const iconProps: { fontSize: any } = {
  fontSize: 'small',
};

export default [
  {
    id: '8d31980bee4040ffbacfaac264d1c11d',
    icon: <AccountBoxOutlined {...iconProps} />,
    name: '个人信息',
    component: <Auth />,
  },
  {
    id: '1b47486d417c438ab66a3b91c40e99f0',
    icon: <PaletteOutlined {...iconProps} />,
    name: '个性化',
    component: <Personalise />,
  },
  {
    id: '47821a4215d4434e92683b7036464f0a',
    icon: <VisibilityOutlined {...iconProps} />,
    name: '网站权限',
    component: '',
  },
  {
    id: 'c7c7f60a702e4d4fa44e992662292da5',
    icon: <TranslateOutlined {...iconProps} />,
    name: '语言',
    component: <Locales />,
  },
  {
    id: '041925b47b4142c8bf03b9ffbd8035a2',
    icon: <Storage {...iconProps} />,
    name: '数据',
    component: '',
  },
  {
    id: '29772d9758bb46db945d26b78728d8fb',
    icon: <InfoOutlined {...iconProps} />,
    name: '关于',
    component: <About />,
  },
] as SettingType[];
