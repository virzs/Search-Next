import { AnimatePresence, Variants, motion } from "framer-motion";
import { FC, useEffect, useRef } from "react";
import { css, cx } from "@emotion/css";
import {
  RiCloseCircleLine,
  RiInformationLine,
  RiPencilRuler2Line,
  RiShareLine,
} from "@remixicon/react";
import { Menu, Modal } from "antd";
import { useSortable } from "../hook";

const itemVariants: Variants = {
  menuShow: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  menuHide: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

interface ContextButtonProps {
  icon: any;
  title: string;
  onClick?: () => void;
}

const ContextButton: FC<ContextButtonProps> = (props) => {
  const { icon, title, onClick } = props;

  return (
    <motion.div
      className="hover:bg-gray-100 dark:text-black text-xs cursor-pointer transition select-none rounded-lg"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      variants={itemVariants}
    >
      <motion.div className="py-1.5 px-3 rounded-lg" whileTap={{ scale: 0.9 }}>
        <motion.div className="mb-1.5 flex justify-center">{icon}</motion.div>
        <motion.div>{title}</motion.div>
      </motion.div>
    </motion.div>
  );
};

export interface ContextMenuProps {}

const ContextMenu: FC<ContextMenuProps> = (props) => {
  const {
    contextMenu,
    setContextMenu,
    listStatus,
    hideContextMenu,
    setShowInfoItemData,
    removeItem,
  } = useSortable();
  const ref = useRef<HTMLDivElement>(null);

  const [modal, contextHolder] = Modal.useModal();

  const { rect } = contextMenu ?? {};
  const { left = 0, bottom = 0, width = 0 } = rect ?? {};

  // 点击空白处关闭
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        hideContextMenu();
        return;
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [hideContextMenu]);

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={ref}
          className={cx(
            "fixed -translate-x-1/2 z-[1001]",
            css`
              top: ${bottom}px;
              left: ${left + width / 2}px;
            `
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <motion.div
            className={cx(
              "shadow rounded-lg overflow-hidden",
              css`
                .ant-menu {
                  border-inline-end: none !important;
                }
              `
            )}
          >
            <Menu
              items={[
                {
                  label: "修改大小",
                  key: "resize",
                  icon: <RiPencilRuler2Line size={14} />,
                  children: [
                    {
                      label: "1x1",
                      key: "small",
                      onClick: () => {
                        console.log("small");
                      },
                    },
                    {
                      label: "2x1",
                      key: "medium",
                      onClick: () => {
                        console.log("medium");
                      },
                    },
                    {
                      label: "1x2",
                      key: "large",
                      onClick: () => {
                        console.log("large");
                      },
                    },
                  ],
                },
              ]}
            ></Menu>
          </motion.div>
          <motion.div className="flex shadow bg-white mt-2 rounded-lg overflow-hidden p-1">
            <ContextButton icon={<RiShareLine size={20} />} title="分享" />
            <ContextButton
              icon={<RiInformationLine size={20} />}
              title="信息"
              onClick={() => {
                setShowInfoItemData(contextMenu.data);
                hideContextMenu();
              }}
            />
            <ContextButton
              icon={<RiCloseCircleLine size={20} />}
              title="移除"
              onClick={() => {
                setContextMenu(null);
                modal.confirm({
                  icon: null,
                  title: "移除",
                  content: "确认移除此项？",
                  onOk: () => {
                    removeItem(contextMenu.data.id);
                  },
                  onCancel: () => {},
                });
              }}
            />
          </motion.div>
        </motion.div>
      )}
      {contextHolder}
    </AnimatePresence>
  );
};

export default ContextMenu;
