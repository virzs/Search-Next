import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { message } from 'antd';
import '@/locales';
import devtools from 'devtools-detect';
import { randomLog } from './data/console/log';
import { getAccount } from './views/setting/auth/utils/acount';

// 全局初始化事件
window.addEventListener('DOMContentLoaded', () => {
  // 初始化时获取用户
  getAccount();
});

// 控制台监听事件
window.addEventListener('devtoolschange', (event) => {
  randomLog(devtools.isOpen);
});

// 错误监听
window.onerror = function (msg, source, lineno, colno, error) {
  /* 错误信息（字符串）：message
      发生错误的脚本URL（字符串）：source
      发生错误的行号（数字）：lineno
      发生错误的列号（数字）：colno
      Error对象（对象）：error
      https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers/onerror */
  console.log(msg, source, lineno, colno, error);
  message.error(msg);
  return false;
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
