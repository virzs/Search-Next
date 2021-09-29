/*
 * @Author: Vir
 * @Date: 2021-03-16 17:14:41
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-16 11:16:19
 */
// 全局加载组件

import React from 'react';
import './index.style.less';

const GlobalLoading: React.FC = () => {
  const items = [1, 2, 3, 4, 5];
  return (
    <div id="loading">
      <div className="pic">
        {items.map((i) => (
          <i key={i}></i>
        ))}
      </div>
    </div>
  );
};

export default GlobalLoading;
