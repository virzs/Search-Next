import { useLayout } from "@/context";
import { Theme } from "@/hooks/useTheme";
import { RiDeviceLine, RiMoonLine, RiSunLine } from "@remixicon/react";
import { Button, Dropdown, Tooltip } from "antd";

const LayoutThemeToggle = () => {
  const { realTheme, setTheme } = useLayout();

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: [
          {
            label: "跟随系统",
            key: "system",
            icon: <RiDeviceLine size={14} />,
            onClick: () => {
              setTheme(Theme.Auto);
            },
          },
          {
            label: "浅色",
            key: "light",
            icon: <RiSunLine size={14} />,
            onClick: () => {
              setTheme(Theme.Light);
            },
          },
          {
            label: "深色",
            key: "dark",
            icon: <RiMoonLine size={14} />,
            onClick: () => {
              setTheme(Theme.Dark);
            },
          },
        ],
      }}
    >
      <Tooltip title="主题" placement="left">
        <Button
          icon={
            {
              [Theme.Auto]: <RiDeviceLine size={14} />,
              [Theme.Light]: <RiSunLine size={14} />,
              [Theme.Dark]: <RiMoonLine size={14} />,
            }[realTheme]
          }
          size="small"
          variant="text"
        ></Button>
      </Tooltip>
    </Dropdown>
  );
};

export default LayoutThemeToggle;
