import { motion } from "framer-motion";
import { FC } from "react";
import { useSortable } from "../context";

export interface SortableItemProps {
  data: any;
  className?: string;
  itemIndex: number;
}

const SortableItem: FC<SortableItemProps> = (props) => {
  const { data, className, itemIndex } = props;

  // console.log("item", props);

  const { contextMenuFuns } = useSortable();

  return (
    <motion.div
      className="h-full w-full rounded-xl"
      data-id={data.id}
      data-index={itemIndex}
    >
      <motion.div
        className="bg-white dark:bg-white dark:text-black rounded-xl shadow-2xl cursor-pointer h-full border-0 relative"
        whileTap={{ scale: 0.9 }}
      >
        {/* 遮罩 防止内部元素点击触发 */}
        <div
          className="absolute left-0 top-0 w-full h-full"
          {...contextMenuFuns(data)}
        ></div>
        <div>{data?.title}</div>
      </motion.div>
    </motion.div>
  );
};

export default SortableItem;
