import { InfoCircleOutlined } from "@ant-design/icons";
import {
  Button,
  ButtonProps,
  DropDownProps,
  Dropdown,
  Modal,
  ModalFuncProps,
  Tooltip,
  TooltipProps,
} from "antd";
import { FC } from "react";

const { useModal } = Modal;

export interface OperationButtonProps extends ButtonProps {
  tooltip?: TooltipProps;
  dropdown?: DropDownProps;
  // 是否显示，Operation 处控制，此处声明参数实际无用，与 auth 作用不同，只有 auth 通过才会触发 show 判断
  show?: boolean;
  title?: string;
  // 权限控制，Operation 处控制，此处声明参数实际无用
  auth?: boolean | string | string[];
  // confirm 提示 delete or ModalFuncProps
  confirm?: "delete" | ModalFuncProps;
}

const OperationButton: FC<OperationButtonProps> = (props) => {
  const { tooltip, dropdown, children, title, onClick, confirm, ...rest } =
    props;

  const [modal, contextHolder] = useModal();

  const b = (
    <Button
      type="link"
      size="small"
      danger={confirm === "delete"}
      onClick={(e) => {
        if (confirm === "delete") {
          modal.confirm({
            title: "确认删除?",
            content: "删除后不可恢复",
            onOk: onClick,
          });
          return;
        } else if (confirm) {
          modal.confirm({
            onOk: () => {
              onClick?.(e);
            },
            ...confirm,
          });
          return;
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {title ?? children}
    </Button>
  );

  return (
    <>
      {dropdown ? <Dropdown {...dropdown}>{b}</Dropdown> : b}
      {tooltip?.title && (
        <Tooltip {...tooltip}>
          <InfoCircleOutlined className="cursor-pointer" />
        </Tooltip>
      )}
      {contextHolder}
    </>
  );
};

export default OperationButton;
