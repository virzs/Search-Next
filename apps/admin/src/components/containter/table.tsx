import { Outlet } from "react-router";
import { cx, css } from "@emotion/css";
import BasePageContainer, { BasePageContainerProps } from "./base";
import { FC } from "react";

export interface TablePageContainerProps extends BasePageContainerProps {}

const TablePageContainer: FC<TablePageContainerProps> = (props) => {
  const { children, ...rest } = props;

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
          }
          .ant-pro-table,
          .ant-list {
            display: flex;
            flex-direction: column;
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
          .ant-table-wrapper {
            flex: 1;
            height: 0;
            .ant-spin-nested-loading {
              height: 100%;
            }
          }
          .ant-table {
            flex: 1;
            height: 0;
            .ant-table-container {
              height: 100%;
              .ant-table-content {
                height: 100%;
                overflow: auto !important;
                table {
                  thead {
                    /* 表头位置固定 */
                    position: sticky;
                    top: 0;
                    z-index: 10;
                  }
                }
              }
            }
          }
          .ant-pro-table,
          .ant-pro-card,
          .ant-pro-card-body,
          .ant-spin-container,
          /* .ant-table, */
          .ant-list {
            /* height 继承父级 */
            height: inherit;
          }
          .ant-pro-table-search {
            height: auto;
            flex-shrink: 0;
          }
          .ant-pro-card-body,
          .ant-spin-container {
            display: flex;
            flex-direction: column;
          }
          .ant-pro-table {
            .ant-pro-table-search-query-filter {
              .ant-pro-query-filter {
                padding-top: 16px;
                padding-bottom: 16px;
              }
            }
            .ant-pro-table-search-query-filter + .ant-pro-card {
              height: calc(100% - 40px);
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
        {children ?? <Outlet />}
      </BasePageContainer>
    </div>
  );
};

export default TablePageContainer;
