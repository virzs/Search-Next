import { Space } from "antd";
import OperationButton, { OperationButtonProps } from "./button";
import { FC } from "react";

type OperationButtonType = typeof OperationButton;

export interface OperationProps {
  columns: OperationButtonProps[];
}

const PrivOperation: FC<OperationProps> = (props) => {
  const { columns } = props;

  return (
    <Space onClick={(e) => e.stopPropagation()}>
      {columns
        // TODO 过滤权限
        .filter((i) => [null, undefined, true].includes(i.show))
        .map((column, i) => (
          <OperationButton key={i} {...column} />
        ))}
    </Space>
  );
};

type OperationType = typeof PrivOperation & {
  Button: OperationButtonType;
};

const Operation = PrivOperation as OperationType;

Operation.Button = OperationButton;

export default Operation;
