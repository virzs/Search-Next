import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { message } from 'antd';
import '@/locales';
import devtools from 'devtools-detect';
import { randomLog } from './data/console/log';
import { getAccount } from './views/setting/auth/utils/acount';
import { latest } from './apis/github';
import confirm from './components/md-custom/dialog/confirm';
import Markdown from './components/global/markdown';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { formatText } from './utils/common';
import { getAuthDataByKey, updateAuthDataByKey } from './apis/auth';

const getVersionInfo = () => {
  const account = localStorage.getItem('account');
  const message = getAuthDataByKey(account ?? '', 'message');
  const latestVersion = getAuthDataByKey(account ?? '', 'latestVersion');

  latest().then((res) => {
    if (res.data) {
      const {
        tag_name = '',
        name = '',
        author = {},
        body = '',
        published_at = '',
      } = res.data;
      if (latestVersion === tag_name) return;
      updateAuthDataByKey(account ?? '', 'latestVersion', tag_name);

      message?.update &&
        confirm({
          title: '版本更新',
          type: false,
          content: (
            <div className="max-h-80 overflow-y-auto">
              <h1 className="font-semibold text-lg mb-2">{`${tag_name} (${name})`}</h1>
              <div className={classNames('flex gap-1 items-center mb-2')}>
                <img
                  className="w-5 h-5 rounded-full"
                  src={author?.avatar_url}
                  alt="author_avatar"
                />
                <span>{author?.login}</span>
                <span className="text-sm">
                  {dayjs(published_at).format('YYYY-MM-DD HH:mm')}
                </span>
              </div>
              <Markdown source={formatText(body)} />
            </div>
          ),
          cancelText: '不再提示',
          onCancel: () => {
            updateAuthDataByKey(account ?? '', 'message', {
              ...message,
              update: false,
            });
          },
        });
    }
  });
};

// 全局初始化事件
window.addEventListener('DOMContentLoaded', () => {
  // 初始化时获取用户
  const res = getAccount();
  res && getVersionInfo();
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
  message.error(msg);
  return false;
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
