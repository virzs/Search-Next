import { Switch } from "antd";
import { RiCodeSSlashLine, RiStore2Line } from "@remixicon/react";
import { useWidget } from "@/hooks/useWidget";
import {
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsValue,
  MacSettingsView,
} from "../../components/macos-settings";

const DeveloperView = () => {
  const { devModeEnabled, toggleDevMode } = useWidget();

  return (
    <MacSettingsView>
      <MacSettingsSection title="小组件开发">
        <MacSettingsRow
          icon={<RiCodeSSlashLine size={16} />}
          iconTone="green"
          title="开发者模式"
          description="用于测试自定义小组件和本地 ESM 入口。"
          extra={<Switch checked={devModeEnabled} onChange={toggleDevMode} />}
        />
        <MacSettingsRow
          icon={<RiStore2Line size={16} />}
          iconTone="blue"
          title="应用商店入口"
          description="开发者模式开启后显示「开发者」导航项"
          extra={
            <MacSettingsValue>
              {devModeEnabled ? "已启用" : "未启用"}
            </MacSettingsValue>
          }
        />
      </MacSettingsSection>
    </MacSettingsView>
  );
};

export default DeveloperView;
