/*
 * @Author: Vir
 * @Date: 2021-09-18 16:56:05
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-18 17:04:25
 */

import React from 'react';

export interface RenderContentProps {
  pChildren: any; // 父级 children
  children: any; // 组件 children
  location: Location;
}

/**
 * 用于 setting 页面，内容主视图，处理多级嵌套路由显示问题
 * location 为页面传递的 history.location，如果提示类型错误可以这样写
 * location={history.location as unknown as Location}
 */

const RenderContent: React.FC<RenderContentProps> = ({
  pChildren,
  children,
  location,
}) => {
  return pChildren &&
    pChildren.find((i: any) => i.key === location.pathname) ? (
    <>{pChildren}</>
  ) : (
    children
  );
};

export default RenderContent;
