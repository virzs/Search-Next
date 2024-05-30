import { motion } from "framer-motion";
import { FC } from "react";
import { useSortable } from "../context";
import { ReactSortable } from "react-sortablejs";
import { SortItem } from "../types";
import { css, cx } from "@emotion/css";

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
    ? [...(children ?? [])]?.slice(0, 9)
    : [data];

  return (
    <motion.div
      className="h-full w-full"
      data-parent-ids={parentIds?.join(",")}
      data-children-length={children?.length}
    >
      <motion.div
        whileTap={{ scale: 0.9 }}
        className="relative rounded-xl h-full bg-orange-400 border-0 overflow-hidden"
        {...contextMenuFuns(data)}
      >
        <motion.div className="p-1.5 relative w-full h-full">
          <motion.div
            className={cx(
              "h-full w-full absolute left-0 top-0 grid grid-cols-3 grid-rows-3 gap-1 sortable-group-item cursor-pointer",
              childrenEmpty ? "" : "p-1.5"
            )}
          >
            {_children?.map((item) => (
              <motion.div
                data-parent-ids={parentIds?.join(",")}
                data-children-length={children?.length}
                className={cx(
                  "bg-green-500 rounded transition-all cursor-pointer",
                  childrenEmpty
                    ? "col-span-3 row-span-3 sortable-group-item"
                    : "col-span-1 row-span-1"
                )}
                key={item.id}
              ></motion.div>
            ))}
          </motion.div>
          <ReactSortable
            className={cx(
              "absolute left-1.5 top-1.5 grid grid-cols-3 grid-rows-3 gap-1 sortable-group-item cursor-pointer",
              css`
                width: calc(100% - 0.75rem);
                height: calc(100% - 0.75rem);
              `
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
          ></ReactSortable>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SortableGroupItem;
