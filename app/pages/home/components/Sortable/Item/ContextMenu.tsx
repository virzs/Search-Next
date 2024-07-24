import { AnimatePresence, Variants, motion } from "framer-motion";
import { FC, useEffect, useRef } from "react";
import { css, cx } from "@emotion/css";
import {
  RiCloseCircleLine,
  RiInformationLine,
  RiPencilRuler2Line,
  RiShareLine,
} from "@remixicon/react";
import { Modal } from "antd";
import { useSortable } from "../hook";
import { configMap, SortableItemBaseConfig } from "../config";

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
    updateItemConfig,
  } = useSortable();
  const ref = useRef<HTMLDivElement>(null);

  const [modal, contextHolder] = Modal.useModal();

  const { rect, data } = contextMenu ?? {};
  const { left = 0, bottom = 0, width = 0 } = rect ?? {};
  const { config } = data ?? {};

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

  const getAllSizes = () => {
    const config: SortableItemBaseConfig = configMap[contextMenu?.data?.type];
    const dimensions = [];
    for (let row = 1; row <= config.maxRow; row++) {
      for (let col = 1; col <= config.maxCol; col++) {
        dimensions.push(`${row}x${col}`);
      }
    }
    return dimensions;
  };

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
            <motion.ul className="bg-white p-1">
              {[
                {
                  label: "修改大小",
                  key: "size",
                  icon: <RiPencilRuler2Line size={14} />,
                  items: getAllSizes().map((size) => ({
                    label: size,
                    key: size,
                    onClick: () => {
                      const [row, col] = size.split("x").map(Number);
                      updateItemConfig(contextMenu.data.id, {
                        row,
                        col,
                      });
                    },
                  })),
                },
              ].map((i) => (
                <motion.li className="py-2 px-3" key={i.key}>
                  <motion.p className="flex items-center text-sm gap-2 pb-2">
                    {i.icon} {i.label}
                  </motion.p>
                  <motion.div className="grid grid-cols-2 gap-1">
                    {i.items.map((it) => (
                      <motion.div
                        className={cx(
                          "py-1 px-2 hover:bg-gray-100 rounded transition-all cursor-pointer text-center text-sm",
                          `${config.row}x${config.col}` === it.key &&
                            "bg-gray-100"
                        )}
                        key={it.key}
                        onClick={it.onClick}
                      >
                        {it.label}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
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
