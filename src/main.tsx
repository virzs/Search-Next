import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { addAccount } from './apis/auth';
import { authDefaultData } from './data/account/default';

// 全局初始化事件
window.addEventListener('DOMContentLoaded', () => {
  // 初始化没有用户时添加新用户
  const user = localStorage.getItem('account');
  if (!user) {
    const inset = addAccount(authDefaultData);
    localStorage.setItem('account', inset._id);
  }
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
