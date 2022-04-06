import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import '@/locales';
import devtools from 'devtools-detect';
import { randomLog } from './data/console/log';
import { getAccount } from './views/setting/auth/utils/acount';
import getVersionInfo from './components/global/versionModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { disable, enable } from 'darkreader';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// 全局初始化事件
window.addEventListener('DOMContentLoaded', () => {
  // 初始化时获取用户
  const res = getAccount();
  res && getVersionInfo();
  // 设置主题
  if (res.theme) {
    res.theme?.type === 'light' ? disable() : enable(res.theme?.darkSettings);
  }
});

// 控制台监听事件
window.addEventListener('devtoolschange', (event) => {
  randomLog(devtools.isOpen);
});

// 生产环境屏蔽右键菜单
window.oncontextmenu = function (e) {
  const prod = import.meta.env?.PROD;
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

Sentry.init({
  dsn: 'https://0eb25ba527c5450d83135b29a601c447@o1191028.ingest.sentry.io/6312275',
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
