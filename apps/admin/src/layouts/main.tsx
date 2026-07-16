import { MenuDataItem, ProLayout } from "@ant-design/pro-components";
import { Outlet, useNavigate } from "react-router";
import useMenu from "../hooks/useMenu";
import { Dropdown } from "antd";
import { useRequest } from "ahooks";
import { postLogout } from "@/services/auth";
import { removeUserInfo } from "@/utils/userInfo";
import {
  getRefreshToken,
  removeRefreshToken,
  removeToken,
} from "@/utils/token";
import { AuthPaths } from "@/views/auth/router";
import { UserPaths } from "@/views/user/router";
import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { RiLogoutBoxLine, RiUserLine } from "@remixicon/react";
import LayoutThemeToggle from "./components/theme";
import { useAccess } from "@/contexts/AccessContext";
import { useEffect } from "react";
import AdminNoticeCenter from "./components/notice";
import AdminReleaseUpdatePrompt from "./components/release-update";

const MainLayout = (props: any) => {
  const menus = useMenu();
  const navigate = useNavigate();
  const { userInfo, refresh, setAccessUser } = useAccess();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const { run: logoutRun } = useRequest(postLogout, {
    manual: true,
    onSuccess: () => {
      removeUserInfo();
      removeToken();
      removeRefreshToken();
      setAccessUser({});
      navigate(AuthPaths.login, {
        replace: true,
      });
    },
  });

  const menuItemRender = (item: MenuDataItem, defaultDom: React.ReactNode) => {
    if (item.isUrl || !item.path || location.pathname === item.path) {
      return <div>{defaultDom}</div>;
    }

    return (
      <div
        className={cx("w-full")}
        onClick={() => {
          item.path && navigate(item.path);
        }}
      >
        {defaultDom}
      </div>
    );
  };

  return (
    <ProLayout
      className={cx(
        "h-screen",
        css`
          .ant-layout {
            height: 100%;
          }
          .ant-pro-sider-actions-avatar {
            width: 100%;
            cursor: pointer;
          }
          .ant-layout-sider {
            .ant-layout-sider-children {
              border-radius: 0.75rem;
              border-right: 0;
            }
          }
          @media (max-width: 500px) {
            .ant-breadcrumb {
              display: none !important;
            }
            .ant-tabs-nav {
              margin-bottom: 0;
              .ant-tabs-tab {
                padding: 6px 0;
              }
            }
            .ant-page-header-footer {
              margin-block-start: 0 !important;
            }
          }
        `,
      )}
      logo={false}
      title="Search Next 管理"
      route={{
        routes: menus,
      }}
      waterMarkProps={{
        content: `${userInfo?.username} ${userInfo?.email}`,
        className: "h-full",
      }}
      menuItemRender={menuItemRender}
      avatarProps={{
        src: userInfo?.avatar,
        title: userInfo?.username ?? "Search Next",
        size: "small",
        render(_, defaultDom) {
          return (
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    label: "个人中心",
                    key: "个人中心",
                    icon: <RiUserLine size={14} />,
                    onClick: () => {
                      navigate(UserPaths.center);
                    },
                  },
                  {
                    label: "退出登录",
                    key: "退出登录",
                    icon: <RiLogoutBoxLine size={14} />,
                    onClick: () => {
                      logoutRun({
                        refreshToken: getRefreshToken(),
                      });
                    },
                  },
                ],
              }}
            >
              {defaultDom ?? "User"}
            </Dropdown>
          );
        },
      }}
      actionsRender={() => [
        <AdminNoticeCenter key="admin-notices" />,
        <LayoutThemeToggle key="layout-theme" />,
      ]}
      menuFooterRender={(props) => {
        if (props?.collapsed) return undefined;
        return (
          <p className="text-center text-xs text-gray-400">
            Powered by Search Next
          </p>
        );
      }}
      {...props}
    >
      <AdminReleaseUpdatePrompt />
      <motion.div
        className={cx("h-full")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Outlet />
      </motion.div>
    </ProLayout>
  );
};

export default MainLayout;
