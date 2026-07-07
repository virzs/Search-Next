import { Outlet } from "react-router";
import BasePageContainer, { BasePageContainerProps } from "./base";
import { FC, ReactNode } from "react";
import { ProCard, ProCardProps } from "@ant-design/pro-components";
import { Space } from "antd";
import BackButton, { BackButtonProps } from "../BackButton";

export interface FullPageContainerProps extends BasePageContainerProps {
  cardProps?: Omit<ProCardProps, "loading">;
  loading?: boolean;
  title?: string | ReactNode;
  showBackButton?: boolean;
  backButtonProps?: BackButtonProps;
  children?: ReactNode;
}

const FullPageContainer: FC<FullPageContainerProps> = (props) => {
  const { children, cardProps, loading, title, showBackButton = true, backButtonProps, ...rest } = props;

  const { extra, title: cardTitle, ...cardRest } = cardProps ?? {};

  return (
    <div className={fullPageContainerClassName}>
      <BasePageContainer
        childrenContentStyle={{
          height: "100%",
        }}
        fixedHeader={false}
        {...rest}
      >
        <ProCard
          headStyle={
            !showBackButton && !extra && !title && !cardTitle
              ? {
                  padding: 0,
                  height: 0,
                }
              : undefined
          }
          extra={
            <Space>
              {extra}
              {showBackButton && <BackButton {...backButtonProps} />}
            </Space>
          }
          loading={loading}
          title={title ?? cardTitle}
          {...cardRest}
        >
          {children ?? <Outlet />}
        </ProCard>
      </BasePageContainer>
    </div>
  );
};

const fullPageContainerClassName = [
  "h-full",
  "[&_.ant-pro-page-container]:flex [&_.ant-pro-page-container]:h-full [&_.ant-pro-page-container]:max-h-screen [&_.ant-pro-page-container]:flex-col [&_.ant-pro-page-container]:overflow-hidden",
  "[&_.ant-pro-page-container-children-container]:overflow-y-auto",
  "[&_.ant-pro-page-container-children-container>.ant-pro-card]:h-full",
  "[&_.ant-pro-page-container-children-container>.ant-pro-card>.ant-pro-card-body]:overflow-y-auto",
  "[&_.ant-pro-page-container-children-container>.ant-pro-card>.ant-pro-card-body]:[scrollbar-color:#eaeaea_transparent]",
  "[&_.ant-pro-page-container-children-container>.ant-pro-card>.ant-pro-card-body]:[scrollbar-gutter:stable]",
  "[&_.ant-pro-page-container-children-container>.ant-pro-card>.ant-pro-card-body]:[scrollbar-width:thin]",
  "[&_.ant-pro-grid-content]:h-0 [&_.ant-pro-grid-content]:flex-1",
  "[&_.ant-pro-grid-content-children]:h-full",
  "[&_.ant-pro-page-container-children-content]:h-full",
].join(" ");

export default FullPageContainer;
