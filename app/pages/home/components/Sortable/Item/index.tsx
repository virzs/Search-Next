import { motion } from "framer-motion";
import { FC } from "react";
import { cx } from "@emotion/css";
import { useSortable } from "../hook";

export interface SortableItemProps {
  data: any;
  className?: string;
  itemIndex: number;
  showTitle?: boolean;
}

const SortableItem: FC<SortableItemProps> = (props) => {
  const { data, className, itemIndex, showTitle } = props;

  const { contextMenuFuns } = useSortable();

  return (
    <motion.div data-id={data.id} data-index={itemIndex}>
      <motion.div
        className="bg-white dark:bg-white dark:text-black rounded-xl shadow-2xl cursor-pointer border-0 relative w-16 h-16"
        whileTap={{ scale: 0.9 }}
      >
        {/* 遮罩 防止内部元素点击触发 */}
        <div
          className="absolute left-0 top-0 w-full h-full"
          {...contextMenuFuns(data)}
        ></div>
        <div>{data?.title}</div>
      </motion.div>
      <motion.p
        className={cx("text-center mt-1", showTitle ? "" : "text-transparent")}
      >
        ghost
      </motion.p>
    </motion.div>
  );
};

export default SortableItem;
