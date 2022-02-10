/*
 * @Author: Vir
 * @Date: 2021-09-18 16:56:05
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-24 10:12:12
 */

import React from 'react';
import { Outlet, useLocation, useMatch } from 'react-router-dom';

export interface RenderContentProps {
  children: any; // 组件 children
  pathname: string;
  noOutlet?: boolean; // 忽略显示子组件
}

/**
 * 用于 setting 页面，内容主视图，处理多级嵌套路由显示问题
 * location 为页面传递的 history.location，如果提示类型错误可以这样写
 * location={history.location as unknown as Location}
 */

const RenderContent: React.FC<RenderContentProps> = (props) => {
  const { children, pathname, noOutlet = false } = props;
  const location = useLocation();
  let match = useMatch(pathname);

  return (
    <>
      {(pathname === location.pathname ||
        pathname === match?.pattern?.path ||
        (pathname && pathname.indexOf('undefined') !== -1)) &&
        children}
      {!noOutlet && <Outlet />}
    </>
  );
};

export default RenderContent;
