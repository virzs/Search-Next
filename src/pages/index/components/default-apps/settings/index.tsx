import { FC, useState } from "react";
import { DesktopBaseModal, DesktopBaseDrawer } from "zs_library";
import AccountView from "./views/account";
import BackupView from "./views/backup";
import { RiInbox2Fill, RiUserFill } from "@remixicon/react";
// import { RiGlobalLine, RiInformationFill, RiKeyFill } from "@remixicon/react";
import { isMobileDevice } from "@/utils/utils";
import { AppResponsiveOverlay, AppSidebar } from "@/components";
// import AboutView from "./views/about";
// import LanguageView from "./views/language";
// import ThirdPartyView from "./views/third-party";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

const SettingsView = () => {
  const [currentMenu, setCurrentMenu] = useState("account");

  return (
    <div className="h-[60vh] overflow-hidden flex">
      <AppSidebar
        header={
          <>
            <div className="text-xs font-medium tracking-wide mb-2">设置</div>
            <div className="text-2xl font-bold tracking-tight">偏好</div>
          </>
        }
        menuItems={[
          {
            key: "account",
            label: "账号",
            icon: <RiUserFill size={16} />,
          },
          // {
          //   key: "third-party",
          //   label: "第三方服务",
          //   icon: <RiKeyFill size={16} />,
          // },
          // {
          //   key: "language",
          //   label: "语言",
          //   icon: <RiGlobalLine size={16} />,
          // },
          {
            key: "backup",
            label: "备份与恢复",
            icon: <RiInbox2Fill size={16} />,
          },
          // {
          //   key: "about",
          //   label: "关于",
          //   icon: <RiInformationFill size={16} />,
          // },
        ]}
        activeMenuKey={currentMenu}
        onMenuSelect={setCurrentMenu}
      />

      <div className="h-full w-0 grow overflow-hidden">
        <div className="h-full w-full overflow-y-auto">
          {currentMenu === "account" ? <AccountView /> : null}
          {/* {currentMenu === "third-party" ? <ThirdPartyView /> : null} */}
          {/* {currentMenu === "language" ? <LanguageView /> : null} */}
          {currentMenu === "backup" ? <BackupView /> : null}
          {/* {currentMenu === "about" ? <AboutView /> : null} */}
        </div>
      </div>
    </div>
  );
};

const Settings: FC<SettingsProps> = (props) => {
  return (
    <AppResponsiveOverlay wrapContent {...props}>
      <SettingsView />
    </AppResponsiveOverlay>
  );
};

export default Settings;
