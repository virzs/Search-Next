import { RiArrowLeftLine } from "@remixicon/react";
import { Button, Modal, ModalFuncProps } from "antd";
import { FC } from "react";
import { useNavigate } from "react-router";

export interface BackButtonProps {
  confirm?:
    | boolean
    | ModalFuncProps
    | (() => boolean | ModalFuncProps);
  onBack?: () => void;
}

const { useModal } = Modal;

const BackButton: FC<BackButtonProps> = (props) => {
  const { confirm, onBack } = props;

  const navigate = useNavigate();

  const [modal, contextHolder] = useModal();
  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <>
      <Button
        icon={<RiArrowLeftLine size={16} />}
        onClick={() => {
          const resolvedConfirm =
            typeof confirm === "function" ? confirm() : confirm;

          if (resolvedConfirm === true) {
            modal.confirm({
              title: "确认离开当前表单？",
              content: "返回后将离开此页面，未保存的内容不会保留。",
              okText: "确认返回",
              cancelText: "留在此页",
              okButtonProps: { danger: true },
              onOk: () => {
                goBack();
              },
            });
            return;
          } else if (resolvedConfirm instanceof Object) {
            modal.confirm({
              ...resolvedConfirm,
              onOk: () => {
                goBack();
              },
            });
            return;
          }
          goBack();
        }}
      >
        返回
      </Button>
      {contextHolder}
    </>
  );
};

export default BackButton;
