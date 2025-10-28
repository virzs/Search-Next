import { Tabs } from "antd";
import { FC, useState } from "react";
import { DesktopBaseModal, DesktopBaseDrawer } from "zs_library";
import AccountView from "./views/account";
import BackupView from "./views/backup";
import { RiInbox2Fill, RiUserFill } from "@remixicon/react";
import { isMobileDevice } from "@/utils/utils";
import { css, cx } from "@emotion/css";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

const SettingsView = () => {
  const [currentMenu, setCurrentMenu] = useState("account");

  const tabItems = [
    {
      label: (
        <span className="inline-flex items-center gap-1">
          <RiUserFill size={16} />
          账号
        </span>
      ),
      key: "account",
      children: <AccountView />,
    },
    // {
    //   label: (
    //     <span className="inline-flex items-center gap-1">
    //       <RiKeyFill size={16} />
    //       第三方服务
    //     </span>
    //   ),
    //   key: "third-party",
    //   children: <ThirdPartyView />,
    // },
    // {
    //   label: (
    //     <span className="inline-flex items-center gap-1">
    //       <RiGlobalLine size={16} />
    //       语言
    //     </span>
    //   ),
    //   key: "language",
    //   children: <LanguageView />,
    // },
    {
      label: (
        <span className="inline-flex items-center gap-1">
          <RiInbox2Fill size={16} />
          备份与恢复
        </span>
      ),
      key: "backup",
      children: <BackupView />,
    },
    // {
    //   label: (
    //     <span className="inline-flex items-center gap-1">
    //       <RiInformationFill size={16} />
    //       关于
    //     </span>
    //   ),
    //   key: "about",
    //   children: <AboutView />,
    // },
  ];

  return (
    <Tabs
      className={cx(
        "h-[60vh]",
        css`
          .ant-tabs-content-holder {
            overflow-y: auto;
            .ant-tabs-content,
            .ant-tabs-tabpane {
              height: 100%;
            }
          }
        `
      )}
      activeKey={currentMenu}
      onChange={(key) => setCurrentMenu(key)}
      tabPosition="left"
      size="small"
      destroyInactiveTabPane
      items={tabItems}
    />
  );
};

const Settings: FC<SettingsProps> = (props) => {
  const { open, onClose } = props;

  const isMobile = isMobileDevice();

  return isMobile ? (
    <DesktopBaseDrawer width="100vw" height="100vh" open={open} onClose={onClose}>
      <SettingsView />
    </DesktopBaseDrawer>
  ) : (
    <DesktopBaseModal visible={open} onClose={onClose} width={1000} contentClassName="!overflow-hidden">
      <SettingsView />
    </DesktopBaseModal>
  );
};

export default Settings;
