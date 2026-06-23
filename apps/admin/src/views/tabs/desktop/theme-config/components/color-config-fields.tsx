import { ProFormColorPicker } from "@ant-design/pro-components";
import { Collapse } from "antd";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { DesktopTheme, desktopThemeLight } from "zs_library";

const colorPickerProps = {
  format: "rgb",
  disabledFormat: true,
  showText: true,
} as any;

export interface ColorConfigFieldsProps {
  themePrefix: string;
  value?: DesktopTheme;
  onChange?: (v: DesktopTheme) => void;
}

const ColorConfigFields: FC<ColorConfigFieldsProps> = (props) => {
  const { themePrefix, value, onChange } = props;

  const [colorConfig, setColorConfig] = useState<DesktopTheme>(value || desktopThemeLight);

  const toColorString = (v: any) => {
    if (v && typeof (v as any).toRgbString === "function") {
      return (v as any).toRgbString();
    }
    return typeof v === "string" ? v : v;
  };

  const updateThemeColorFactory =
    (setConfig: Dispatch<SetStateAction<DesktopTheme>>) => (path: (string | number)[]) => (value: any) => {
      const colorStr = toColorString(value);
      setConfig((prev) => {
        const next: any = { ...prev };
        let node: any = next;
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i] as any;
          const child = node[key];
          if (Array.isArray(child)) {
            node[key] = [...child];
          } else if (child && typeof child === "object") {
            node[key] = { ...child };
          } else {
            node[key] = {};
          }
          node = node[key];
        }
        node[path[path.length - 1] as any] = colorStr;
        return next as DesktopTheme;
      });
    };

  const updateThemeColor = updateThemeColorFactory(setColorConfig);

  useEffect(() => {
    if (onChange) {
      onChange(colorConfig);
    }
  }, [colorConfig, onChange]);

  return (
    <Collapse
      ghost
      defaultActiveKey={["base"]}
      size="small"
      bordered={false}
      accordion
      items={[
        {
          key: "base",
          label: "基础色",
          children: (
            <>
              <ProFormColorPicker
                name={[themePrefix, "token", "base", "hoverColor"] as any}
                label="选中/悬停颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "base", "hoverColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "base", "dangerColor"] as any}
                label="危险颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "base", "dangerColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "base", "backgroundColor"] as any}
                label="背景颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "base", "backgroundColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "base", "textColor"] as any}
                label="文字颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "base", "textColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "base", "shadowColor"] as any}
                label="阴影颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "base", "shadowColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "base", "borderColor"] as any}
                label="边框颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "base", "borderColor"])}
              />
            </>
          ),
        },
        {
          key: "dock",
          label: "Dock主题",
          children: (
            <>
              <ProFormColorPicker
                name={[themePrefix, "token", "dock", "backgroundColor"] as any}
                label="Dock背景颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "dock", "backgroundColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "dock", "borderColor"] as any}
                label="Dock边框颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "dock", "borderColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "dock", "boxShadowColor"] as any}
                label="Dock阴影颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "dock", "boxShadowColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "dock", "divider", "color"] as any}
                label="分割线颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "dock", "divider", "color"])}
              />
            </>
          ),
        },
        {
          key: "contextMenu",
          label: "上下文菜单主题",
          children: (
            <>
              <ProFormColorPicker
                name={[themePrefix, "token", "contextMenu", "textColor"] as any}
                label="菜单文字颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "contextMenu", "textColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "contextMenu", "activeColor"] as any}
                label="激活颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "contextMenu", "activeColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "contextMenu", "backgroundColor"] as any}
                label="菜单背景颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "contextMenu", "backgroundColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "contextMenu", "shadowColor"] as any}
                label="菜单阴影颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "contextMenu", "shadowColor"])}
              />
            </>
          ),
        },
        {
          key: "items",
          label: "项目主题",
          children: (
            <>
              <ProFormColorPicker
                name={[themePrefix, "token", "items", "textColor"] as any}
                label="项目文字颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "items", "textColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "items", "iconBackgroundColor"] as any}
                label="图标背景颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "items", "iconBackgroundColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "items", "iconShadowColor"] as any}
                label="图标阴影颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "items", "iconShadowColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "items", "groupIconBackgroundColor"] as any}
                label="分组图标背景颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "items", "groupIconBackgroundColor"])}
              />
            </>
          ),
        },
        {
          key: "modal",
          label: "模态框主题",
          children: (
            <>
              <ProFormColorPicker
                name={[themePrefix, "token", "modal", "mask", "backgroundColor"] as any}
                label="遮罩背景颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "modal", "mask", "backgroundColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "modal", "content", "backgroundColor"] as any}
                label="内容背景颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "modal", "content", "backgroundColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "modal", "content", "borderColor"] as any}
                label="内容边框颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "modal", "content", "borderColor"])}
              />
              <ProFormColorPicker
                name={[themePrefix, "token", "modal", "header", "textColor"] as any}
                label="标题文字颜色"
                fieldProps={colorPickerProps}
                onChange={updateThemeColor(["token", "modal", "header", "textColor"])}
              />
            </>
          ),
        },
      ]}
    ></Collapse>
  );
};

export default ColorConfigFields;
