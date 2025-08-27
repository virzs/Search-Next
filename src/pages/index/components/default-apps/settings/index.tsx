import { css, cx } from "@emotion/css";
import { Menu } from "antd";
import { FC, useState } from "react";
import { DesktopBaseModal } from "zs_library";
import AccountView from "./views/account";
import BackupView from "./views/backup";
import AboutView from "./views/about";
import { AnimatePresence } from "framer-motion";
import { RiInbox2Fill, RiInformationFill, RiUserFill } from "@remixicon/react";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

const Settings: FC<SettingsProps> = (props) => {
  const { open, onClose } = props;

  const [currentMenu, setCurrentMenu] = useState("account");

  return (
    <DesktopBaseModal visible={open} onClose={onClose} width={1000}>
      <div className="flex min-h-[60vh] gap-5">
        <Menu
          selectedKeys={[currentMenu]}
          onSelect={({ key }) => {
            setCurrentMenu(key);
          }}
          className={cx(
            "shrink-0 w-44 !bg-inherit rounded-2xl !shadow-2xl fixed bottom-5 top-5 !px-2 !py-3",
            css`
              border-inline-end: none !important;
            `
          )}
          items={[
            {
              label: "账号",
              key: "account",
              icon: <RiUserFill size={16} />,
            },
            {
              label: "备份与恢复",
              key: "backup",
              icon: <RiInbox2Fill size={16} />,
            },
            {
              label: "关于",
              key: "about",
              icon: <RiInformationFill size={16} />,
            },
          ]}
        />
        <div className="w-44"></div>
        <div className="grow-1 pr-2">
          <AnimatePresence mode="wait">
            {currentMenu === "account" && <AccountView key="account" />}
            {currentMenu === "backup" && <BackupView key="backup" />}
            {currentMenu === "about" && <AboutView key="about" />}
          </AnimatePresence>
        </div>
      </div>
    </DesktopBaseModal>
  );
};

export default Settings;
