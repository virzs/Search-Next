import { Card, Switch, Typography } from "antd";
import { RiCodeSSlashLine } from "@remixicon/react";
import { DefaultAppView } from "@/components";
import { useWidget } from "@/hooks/useWidget";

const { Text } = Typography;

const DeveloperView = () => {
  const { devModeEnabled, toggleDevMode } = useWidget();

  return (
    <DefaultAppView>
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-xl bg-emerald-500/10 p-2 w-10 h-10 flex items-center justify-center">
              <RiCodeSSlashLine
                className="text-emerald-600 dark:text-emerald-400"
                size={20}
              />
            </div>
            <div>
              <div className="font-medium">开发者模式</div>
              <Text type="secondary" className="text-xs">
                开启后可在应用商店侧边栏看到「开发者」入口，用于测试自定义小组件
              </Text>
            </div>
          </div>
          <Switch checked={devModeEnabled} onChange={toggleDevMode} />
        </div>
      </Card>
    </DefaultAppView>
  );
};

export default DeveloperView;
