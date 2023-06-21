/*
 * @Author: vir virs98@outlook.com
 * @Date: 2021-09-22 16:34:45
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-13 14:35:57
 */
import React from 'react';
import * as client from 'react-dom/client';
import './index.css';
import App from './App';
import '@/locales';
import devtools from 'devtools-detect';
import { randomLog } from './data/console/log';
import { getAccount } from './views/setting/auth/utils/acount';
import getVersionInfo from './components/global/versionModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auto, disable, enable } from 'darkreader';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import 'virtual:svg-icons-register';
import { getTheme } from './apis/setting/theme';

const env = import.meta.env;

// 全局初始化事件
window.addEventListener('DOMContentLoaded', () => {
  // 初始化时获取用户
  const res = getAccount();
  res && getVersionInfo();

  // 设置主题
  const theme = getTheme();
  if (theme) {
    theme?.type === 'system'
      ? auto(theme?.darkSettings)
      : theme?.type === 'light'
      ? disable()
      : enable(theme?.darkSettings);
  }
});

// 控制台监听事件
window.addEventListener('devtoolschange', (event) => {
  randomLog(devtools.isOpen);
});

// 生产环境屏蔽右键菜单
window.oncontextmenu = function (e) {
  const prod = env?.PROD;
  prod && e.preventDefault();
};

// 错误监听
window.onerror = function (msg, source, lineno, colno, error) {
  /* 错误信息（字符串）：message
      发生错误的脚本URL（字符串）：source
      发生错误的行号（数字）：lineno
      发生错误的列号（数字）：colno
      Error对象（对象）：error
      https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers/onerror */
  console.log(msg, source, lineno, colno, error);
  toast.error(msg);
  return false;
};

env?.VITE_SENTRY_URL &&
  env?.PROD &&
  Sentry.init({
    dsn: env?.VITE_SENTRY_URL as string,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = client.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
