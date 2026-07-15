import { Space } from "antd";
import OperationButton, { OperationButtonProps } from "./button";
import { FC } from "react";
import { matchPermission, useAccess } from "@/contexts/AccessContext";

type OperationButtonType = typeof OperationButton;

export interface OperationProps {
  columns: OperationButtonProps[];
}

const PrivOperation: FC<OperationProps> = (props) => {
  const { columns } = props;
  const access = useAccess();

  return (
    <Space onClick={(e) => e.stopPropagation()}>
      {columns
        .filter((i) => [null, undefined, true].includes(i.show))
        .filter((i) => matchPermission(i.auth, access))
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
