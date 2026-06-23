import { RiArrowLeftLine } from "@remixicon/react";
import { Button, Modal, ModalFuncProps } from "antd";
import { FC } from "react";
import { useNavigate } from "react-router";

export interface BackButtonProps {
  confirm?: boolean | ModalFuncProps;
}

const { useModal } = Modal;

const BackButton: FC<BackButtonProps> = (props) => {
  const { confirm } = props;

  const navigate = useNavigate();

  const [modal, contextHolder] = useModal();

  return (
    <>
      <Button
        icon={<RiArrowLeftLine size={16} />}
        onClick={() => {
          if (confirm === true) {
            modal.confirm({
              title: "确认返回吗？",
              onOk: () => {
                navigate(-1);
              },
            });
            return;
          } else if (confirm instanceof Object) {
            modal.confirm({
              ...confirm,
              onOk: () => {
                navigate(-1);
              },
            });
            return;
          }
          navigate(-1);
        }}
      >
        返回
      </Button>
      {contextHolder}
    </>
  );
};

export default BackButton;
