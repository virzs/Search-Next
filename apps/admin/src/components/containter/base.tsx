import { PageContainer, PageContainerProps } from "@ant-design/pro-components";
import { FC, ReactNode } from "react";

export interface BasePageContainerProps extends PageContainerProps {
  children?: ReactNode;
}

const BasePageContainer: FC<BasePageContainerProps> = (props) => {
  const { className, ...rest } = props;

  return (
    <PageContainer
      className={[basePageContainerClassName, className]
        .filter(Boolean)
        .join(" ")}
      title={false}
      fixedHeader={false}
      ghost
      {...rest}
    />
  );
};

const basePageContainerClassName = [
  "[&_.ant-page-header]:pb-2 [&_.ant-page-header]:pl-6",
  "[&_.ant-page-header_.ant-breadcrumb]:flex [&_.ant-page-header_.ant-breadcrumb]:h-10 [&_.ant-page-header_.ant-breadcrumb]:items-center [&_.ant-page-header_.ant-breadcrumb]:p-0",
  "[&_.ant-pro-grid-content_.ant-pro-page-container-children-container]:pl-2",
  "max-[500px]:[&_.ant-page-header]:px-6",
  "max-[500px]:[&_.ant-page-header_.ant-page-header-breadcrumb]:pt-3",
  "max-[500px]:[&_.ant-pro-page-container-children-container]:px-6",
  "max-[500px]:[&_.ant-pro-page-container-children-container]:pb-6",
  "max-[500px]:[&_.ant-pro-page-container-children-container]:pt-0",
].join(" ");

export default BasePageContainer;
