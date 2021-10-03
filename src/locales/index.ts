/*
 * @Author: Vir
 * @Date: 2021-10-03 18:26:30
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-03 20:06:09
 */

import i18n, { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './zh-CN.json';
import enUS from './en-US.json';

const resources: Resource = {
  'zh-CN': {
    translation: {
      ...zhCN,
    },
  },
  'en-US': {
    translation: {
      ...enUS,
    },
  },
};

export default i18n.use(initReactI18next).init({ resources, lng: 'zh-CN' });
