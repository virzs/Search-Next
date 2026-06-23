import { Outlet } from "react-router";
import { cx, css } from "@emotion/css";
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
    <div
      className={cx(
        "h-full",
        css`
          .ant-pro-page-container {
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            max-height: 100vh;
            .ant-pro-page-container-children-container {
              overflow-y: auto;
              > .ant-pro-card {
                height: 100%;
                > .ant-pro-card-body {
                  overflow-y: auto;
                  scrollbar-width: thin;
                  scrollbar-color: #eaeaea transparent;
                  scrollbar-gutter: stable;
                }
              }
            }
          }
          .ant-pro-grid-content {
            flex: 1;
            height: 0;
            .ant-pro-grid-content-children {
              height: 100%;
              .ant-pro-page-container-children-content {
                height: 100%;
              }
            }
          }
        `
      )}
    >
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
          title={title}
          {...cardRest}
        >
          {children ?? <Outlet />}
        </ProCard>
      </BasePageContainer>
    </div>
  );
};

export default FullPageContainer;
