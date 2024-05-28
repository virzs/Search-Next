import { motion } from "framer-motion";
import { FC } from "react";
import { useSortable } from "../context";
import { ReactSortable } from "react-sortablejs";
import { SortItem } from "../types";
import { cx } from "@emotion/css";

interface SortableGroupItemProps {
  data: SortItem;
  className?: string;
  itemIndex: number;
  parentIds: any[];
}

const SortableGroupItem: FC<SortableGroupItemProps> = (props) => {
  const { data, className, itemIndex, parentIds } = props;
  const { contextMenuFuns, setList, setListStatus } = useSortable();

  const { children, data: itemData } = data;

  // 是否为空
  const childrenEmpty = children?.length === 0;

  // 截取前 9 个
  const _children = !childrenEmpty
    ? [itemData, ...(children ?? [])]?.slice(0, 9)
    : [data];

  return (
    <motion.div
      className="h-full w-full rounded-xl"
      data-parent-ids={parentIds?.join(",")}
      data-children-length={children?.length}
    >
      <motion.div
        whileTap={{ scale: 0.9 }}
        className="relative rounded-xl h-full bg-orange-400 border-0 overflow-hidden"
        {...contextMenuFuns(data)}
      >
        <ReactSortable
          className={cx(
            "h-full w-full grid grid-cols-3 grid-rows-3 gap-1 sortable-group-item",
            childrenEmpty ? "" : "p-1.5"
          )}
          group={{ name: "nested", pull: false, put: true }}
          animation={150}
          fallbackOnBody
          list={children ?? []}
          setList={(x) => setList(x, parentIds)}
          onMove={(e) => {
            setListStatus("onMove");
            return true;
          }}
          // 只能移入，文件夹中的不能响应拖拽事件
          filter={() => true}
        >
          {_children?.map((item) => (
            <motion.div
              className={cx(
                "bg-green-500 rounded transition-all",
                childrenEmpty
                  ? "col-span-3 row-span-3"
                  : "col-span-1 row-span-1"
              )}
              key={item.id}
            ></motion.div>
          ))}
        </ReactSortable>
      </motion.div>
    </motion.div>
  );
};

export default SortableGroupItem;
