import { css, cx } from "@emotion/css";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { flushSync } from "react-dom";
import { DesktopNextBaseModal } from "zs_library";
import { AccountInfo, UnloggedView } from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import type { AuthAction } from "@/types/auth";
import { accountRoute } from "./route-paths";
import { useI18n } from "@/i18n";
import useDesktopTheme from "@/hooks/useDesktopTheme";

const AccountModalRoute = () => {
  const navigate = useNavigate();
  const { resolvedColorScheme } = useDesktopTheme();
  const isDark = resolvedColorScheme === "dark";
  const [routeClosing, setRouteClosing] = useState(false);
  const handleClose = () => {
    flushSync(() => setRouteClosing(true));
    navigate("/");
  };

  if (routeClosing) return null;

  return (
    <DesktopNextBaseModal
      visible
      onClose={handleClose}
      width={600}
      floatingControls={{
        fullscreen: false,
      }}
      styles={{
        panel: {
          overflow: "hidden",
          borderRadius: 24,
          border: isDark
            ? "1px solid rgba(235,235,245,0.14)"
            : "1px solid rgba(255,255,255,0.72)",
          background: isDark
            ? "rgba(28,28,30,0.96)"
            : "rgba(247,247,249,0.94)",
          boxShadow:
            isDark
              ? "0 24px 70px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 24px 70px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.9)",
        },
        body: { padding: 0 },
        inner: {
          width: "100%",
          maxHeight: "calc(100dvh - 64px)",
          overflowY: "auto",
          overscrollBehavior: "contain",
        },
      }}
    >
      <div className={accountModalShellClassName}>
        <Outlet />
      </div>
    </DesktopNextBaseModal>
  );
};

export default AccountModalRoute;

export const AccountIndexRedirect = () => {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <AccountLoadingView />;

  return (
    <Navigate
      to={isAuthenticated ? accountRoute.path.profile : accountRoute.path.login}
      replace
    />
  );
};

export const AccountAuthView = ({ action }: { action: AuthAction }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { t } = useI18n();
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <AccountLoadingView />;
  if (isAuthenticated) {
    return <Navigate to={accountRoute.path.profile} replace />;
  }

  const handleActionChange = (nextAction: AuthAction) => {
    navigate({
      pathname:
        nextAction === "login"
          ? accountRoute.path.login
          : accountRoute.path.register,
      search,
    });
  };

  return (
    <div className={accountAuthPageClassName}>
      <UnloggedView
        mode="inline"
        activeAction={action}
        defaultAction={action}
        title={
          action === "login"
            ? t("ui.signInToSearchNext")
            : t("ui.createASearchNextAccount")
        }
        description={
          action === "login"
            ? t("ui.auth.signInSyncSubtitle")
            : t("ui.auth.registerSyncSubtitle")
        }
        onActionChange={handleActionChange}
        onLoginSuccess={() =>
          navigate(accountRoute.path.profile, { replace: true })
        }
        onRegisterSuccess={() =>
          navigate(accountRoute.path.profile, { replace: true })
        }
        showToggle={true}
      />
    </div>
  );
};

export const AccountProfileView = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <AccountLoadingView />;
  if (!isAuthenticated) {
    return <Navigate to={accountRoute.path.login} replace />;
  }

  return (
    <div className={accountProfilePageClassName}>
      <AccountInfo showActions className="w-full" />
    </div>
  );
};

const AccountLoadingView = () => (
  <div className={cx(accountAuthPageClassName, "text-center")}>
    <AccountLoadingText />
  </div>
);

const AccountLoadingText = () => {
  const { t } = useI18n();
  return (
    <div className="text-sm font-semibold text-[#6e6e73]">
      {t("ui.readingAccountStatus")}
    </div>
  );
};

const accountModalShellClassName = css`
  width: 100%;
  min-height: 100%;
  color: #1d1d1f;

  [data-theme="dark"] & {
    color: #f5f5f7;
  }
`;

const accountAuthPageClassName = css`
  width: 100%;
  padding: 34px 40px 42px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.86),
      rgba(246, 246, 248, 0.9)
    ),
    rgba(246, 246, 248, 0.92);

  [data-theme="dark"] & {
    background:
      linear-gradient(180deg, rgba(44, 44, 46, 0.96), rgba(28, 28, 30, 0.98)),
      #1c1c1e;
  }

  .unlogged-view-content {
    width: 100%;
  }

  .apple-auth-copy {
    margin-bottom: 24px;
  }

  .apple-auth-title {
    font-size: 26px;
  }

  .apple-auth-description {
    margin-inline: auto;
    max-width: 420px;
  }

  .apple-auth-segmented {
    margin-bottom: 24px;
  }

  @media (max-width: 560px) {
    padding: 26px 22px 34px;
  }
`;

const accountProfilePageClassName = css`
  width: 100%;
  padding: 0;
  background: rgba(246, 246, 248, 0.92);

  .account-info {
    width: 100%;
  }

  .apple-account-card {
    width: 100%;
    border: 0;
    border-radius: 0;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.9),
        rgba(246, 246, 248, 0.9)
      ),
      rgba(246, 246, 248, 0.94);
    box-shadow: none;
  }

  .apple-account-header {
    padding: 22px 24px;
  }

  [data-theme="dark"] & {
    background: #1c1c1e;
  }

  [data-theme="dark"] & .apple-account-card {
    background: linear-gradient(180deg, #2c2c2e, #1c1c1e);
  }
`;
