import { AnimatePresence, Variants, motion } from "framer-motion";
import { FC, useEffect, useRef } from "react";
import { useSortable } from "../context";
import { css, cx } from "@emotion/css";
import {
  RiCloseCircleLine,
  RiInformationLine,
  RiShareLine,
} from "@remixicon/react";

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
      <motion.div className="py-2 px-4 rounded-lg" whileTap={{ scale: 0.9 }}>
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
  } = useSortable();
  const ref = useRef<HTMLDivElement>(null);

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
  }, []);

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={ref}
          className={cx(
            "bg-white mt-2 rounded-lg fixed -translate-x-1/2 overflow-hidden z-[1001]",
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
          <motion.div className="flex">
            <ContextButton icon={<RiShareLine />} title="分享" />
            <ContextButton
              icon={<RiInformationLine />}
              title="信息"
              onClick={() => {
                setShowInfoItemData(contextMenu.data);
                hideContextMenu();
              }}
            />
            <ContextButton icon={<RiCloseCircleLine />} title="移除" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
