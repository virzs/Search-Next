import { useAuth } from "@/hooks/useAuth";
import UnloggedView from "@/components/auth/UnloggedView";
import { Avatar, Button } from "antd";
import BoringAccountAvatar from "@/components/auth/BoringAccountAvatar";
import { format } from "date-fns";
import {
  RiLogoutBoxRLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiUserLine,
} from "@remixicon/react";
import {
  MacSettingsChevron,
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsValue,
  MacSettingsView,
} from "../../components/macos-settings";

const AccountView = () => {
  const { user, isAuthenticated, logout, coverGradientCss } = useAuth();

  const joinedAt = user?.createdAt
    ? format(user.createdAt, "yyyy-MM-dd")
    : "未知";

  const renderUnloggedView = () => (
    <>
      <MacSettingsSection>
        <div className="px-6 py-6">
          <div className="mx-auto w-full max-w-[520px]">
            <UnloggedView
              mode="inline"
              title="欢迎使用"
              description="登录后可以同步您的数据和设置"
              onLoginSuccess="show-account"
              onRegisterSuccess="show-account"
              showToggle={true}
            />
          </div>
        </div>
      </MacSettingsSection>
    </>
  );

  const renderLoggedView = () => {
    if (!user) return null;

    return (
      <>
        <div className="rounded-[20px] border border-white/80 bg-white/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
          <div className="flex items-center gap-5 max-[640px]:items-start">
            <Avatar
              size={88}
              src={
                <BoringAccountAvatar
                  seed={user.email || user.username}
                  aria-label={user.username || "账号头像"}
                />
              }
              style={{
                backgroundImage:
                  coverGradientCss ||
                  "linear-gradient(135deg, #0a84ff, #30d158)",
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[26px] font-extrabold leading-8 text-[#1d1d1f]">
                {user.username}
              </div>
              <div className="mt-1 truncate text-sm text-[#6e6e73]">
                {user.email}
              </div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#f2f2f7] px-2.5 py-1 text-xs font-semibold text-[#6e6e73]">
                <RiShieldCheckLine size={14} />
                <span>已登录</span>
              </div>
            </div>
            <Button
              type="text"
              icon={<RiLogoutBoxRLine size={16} />}
              onClick={() => void logout()}
              className="h-[34px] shrink-0 rounded-full border border-[rgba(255,59,48,0.18)] bg-[rgba(255,59,48,0.07)] px-3 text-[13px] font-bold text-[#ff3b30] shadow-none hover:!border-[rgba(255,59,48,0.3)] hover:!bg-[rgba(255,59,48,0.1)] hover:!text-[#ff3b30]"
            >
              退出登录
            </Button>
          </div>
        </div>

        <MacSettingsSection title="账号信息">
          <MacSettingsRow
            icon={<RiUserLine size={16} />}
            title="个人资料"
            description={user.email}
            extra={<MacSettingsValue>{user.username}</MacSettingsValue>}
          />
          <MacSettingsRow
            icon={<RiShieldCheckLine size={16} />}
            iconTone="green"
            title="登录与安全"
            description="密码、会话与访问令牌"
            extra={<MacSettingsChevron />}
          />
          <MacSettingsRow
            icon={<RiTimeLine size={16} />}
            iconTone="gray"
            title="加入时间"
            description="账号创建日期"
            extra={<MacSettingsValue>{joinedAt}</MacSettingsValue>}
          />
        </MacSettingsSection>
      </>
    );
  };

  return (
    <MacSettingsView>
      {isAuthenticated ? renderLoggedView() : renderUnloggedView()}
    </MacSettingsView>
  );
};

export default AccountView;
