import { getMenuByPath, Menu } from "@/utils/menu";
import { PageContainerProps } from "@ant-design/pro-components";
import { css, cx } from "@emotion/css";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Outlet, useLocation } from "react-router";
import TablePageContainer from "./table";
import useMenu from "@/hooks/useMenu";

export interface TabRouteContainerProps extends PageContainerProps {
  parent: string;
  wrapper?: boolean;
  hideBreadcrumb?: boolean;
}

const TabRouteContainer: React.FC<TabRouteContainerProps> = (props) => {
  const { parent, hideBreadcrumb, ...rest } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const menus = useMenu();

  const routes: Menu[] = useMemo(() => {
    const menu = getMenuByPath(parent, menus);
    let res: Menu[] = [];

    if (menu?.children?.length) {
      res = menu.children;
    }

    return res;
  }, [menus, parent]);

  return (
    <TablePageContainer
      className={cx(
        hideBreadcrumb &&
          css`
            .ant-page-header.has-footer {
              padding-top: 0;
              .ant-page-header-footer {
                margin-top: 0;
              }
            }
          `
      )}
      tabList={routes
        .filter((i) => !i.hideInTab)
        .map((v) => ({
          key: v.path,
          tab: v.name,
        }))}
      onTabChange={(key) => {
        navigate(key, { replace: true });
      }}
      tabActiveKey={location.pathname}
      {...rest}
    >
      <Outlet />
    </TablePageContainer>
  );
};

export default TabRouteContainer;
