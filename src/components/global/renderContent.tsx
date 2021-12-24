/*
 * @Author: Vir
 * @Date: 2021-09-18 16:56:05
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-24 10:12:12
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export interface RenderContentProps {
  children: any; // 组件 children
  pathname: string;
}

/**
 * 用于 setting 页面，内容主视图，处理多级嵌套路由显示问题
 * location 为页面传递的 history.location，如果提示类型错误可以这样写
 * location={history.location as unknown as Location}
 */

const RenderContent: React.FC<RenderContentProps> = (props) => {
  const { children, pathname } = props;
  const location = useLocation();
  return (
    <>
      {(pathname === location.pathname ||
        (pathname && pathname.indexOf('undefined') !== -1)) &&
        children}
      <Outlet />
    </>
  );
};

export default RenderContent;
