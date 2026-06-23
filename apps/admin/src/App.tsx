import { RouterProvider } from "react-router";
import router from "./routes/router";
import { ConfigProvider, theme as antTheme, App as AntdApp, Input } from "antd";
import { Provider } from "react-redux";
import { store } from "./store";
import { ProConfigProvider } from "@ant-design/pro-components";
import { RootLayoutProvider, useLayout } from "./context";
import { useMemo } from "react";
import { Theme } from "./hooks/useTheme";
import { Tree, ProFormUpload, ProFormUserSearchSelect } from "./components/pro-form";
import { GlobalNotificationProvider } from "./utils/globalNotification";
import MEditor from "./components/pro-form/fields/editor/editor";

const Root = () => {
  const { theme, appId } = useLayout();

  const darkMode = useMemo(() => {
    return theme === Theme.Dark;
  }, [theme]);

  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          cssVar: { key: appId },
          algorithm: darkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: "rgb(250, 84, 28)",
          },
        }}
      >
        <AntdApp>
          <GlobalNotificationProvider />
          <ProConfigProvider
            valueTypeMap={{
              upload: {
                renderFormItem(text, props) {
                  return <ProFormUpload value={text} {...props} />;
                },
              },
              editor: {
                renderFormItem(text, props) {
                  const { readonly, placeholder, fieldProps, ...rest } = props;

                  return <MEditor value={text} {...rest} {...fieldProps} />;
                },
              },
              code: {
                renderFormItem(text, props) {
                  const { fieldProps } = props as any;
                  return (
                    <Input.TextArea
                      value={text}
                      {...props}
                      {...fieldProps}
                      rows={fieldProps?.rows ?? 12}
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        ...(fieldProps?.style || {}),
                      }}
                      placeholder={fieldProps?.placeholder ?? "请输入代码"}
                    />
                  );
                },
              },
              tree: {
                renderFormItem(text, props: any) {
                  return <Tree value={text} {...props} />;
                },
              },
              userSelect: {
                renderFormItem(text, props: any) {
                  return <ProFormUserSearchSelect value={text} {...props} />;
                },
              },
            }}
          >
            <RouterProvider router={router} />
          </ProConfigProvider>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  );
};

function App() {
  return (
    <RootLayoutProvider>
      <Root />
    </RootLayoutProvider>
  );
}

export default App;
