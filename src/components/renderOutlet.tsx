import { FC, ReactNode } from "react";
import { Outlet, useLocation, useMatch } from "react-router-dom";

export interface RenderOutletProps {
  children: ReactNode; // 组件 children
  pathname: string;
  noOutlet?: boolean; // 忽略显示子组件
}

/**
 * 用于 setting 页面，内容主视图，处理多级嵌套路由显示问题
 * location 为页面传递的 history.location，如果提示类型错误可以这样写
 * location={history.location as unknown as Location}
 */

const RenderOutlet: FC<RenderOutletProps> = (props) => {
  const { children, pathname, noOutlet = false } = props;
  const location = useLocation();
  const match = useMatch(pathname);

  return (
    <>
      {(pathname === location.pathname ||
        pathname === match?.pattern?.path ||
        (pathname && pathname.indexOf("undefined") !== -1)) &&
        children}
      {!noOutlet && <Outlet />}
    </>
  );
};

export default RenderOutlet;
