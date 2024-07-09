import { motion } from "framer-motion";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { SortItem } from "../types";
import { css, cx } from "@emotion/css";
import { useSortable } from "../hook";

interface SortableGroupItemProps {
  data: SortItem;
  className?: string;
  itemIndex: number;
  parentIds: any[];
}

const SortableGroupItem: FC<SortableGroupItemProps> = (props) => {
  const { data, className, itemIndex, parentIds } = props;
  const {
    contextMenuFuns,
    setList,
    listStatus,
    setOpenGroupItemData,
    longPressTriggered,
    moveItemId,
    moveTargetId,
  } = useSortable();

  const { children, data: itemData } = data;

  const variants = {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.95 },
  };

  // 是否为空
  const childrenEmpty = (children?.length ?? 0) === 0;

  // 截取前 9 个
  const _children = !childrenEmpty
    ? [...(children ?? [])]?.slice(0, 9)
    : [data];

  const isMove = useMemo(() => {
    return moveItemId === data.id.toString();
  }, [data.id, moveItemId]);

  const isMoveTarget = useMemo(() => {
    return moveTargetId === data.id.toString();
  }, [data.id, moveTargetId]);

  return (
    <motion.div
      data-id={data.id}
      data-parent-ids={parentIds?.join(",")}
      data-children-length={children?.length}
    >
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={cx(
          "relative rounded-xl bg-orange-400 border-0 overflow-hidden h-16 w-16 transition-all",
          isMoveTarget ? "scale-110" : ""
        )}
        onClick={() => {
          if (!childrenEmpty && !longPressTriggered) {
            setOpenGroupItemData(data);
          }
        }}
        {...contextMenuFuns(data)}
      >
        <motion.div className="p-1.5 relative w-full h-full">
          <motion.div
            className={cx(
              "h-full w-full absolute left-0 top-0 grid grid-cols-3 grid-rows-3 gap-1 sortable-group-item cursor-pointer transition-all",
              childrenEmpty ? "" : "p-1.5"
            )}
          >
            {_children?.map((item, index) => (
              <motion.div
                data-parent-ids={parentIds?.join(",")}
                data-children-length={children?.length}
                className={cx(
                  "bg-green-500 rounded transition-all cursor-pointer",
                  childrenEmpty
                    ? "col-span-3 row-span-3 sortable-group-item"
                    : "col-span-1 row-span-1"
                )}
                key={index}
              ></motion.div>
            ))}
          </motion.div>
          {/* 需要设置宽高小于父元素，否则在拖拽时会始终响应子列表 */}
          <ReactSortable
            className={cx(
              "absolute left-1.5 top-1.5 sortable-group-item cursor-pointer",
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
            // 只能移入，文件夹中的不能响应拖拽事件
            filter={() => true}
          ></ReactSortable>
        </motion.div>
      </motion.div>
      <motion.p
        className="text-center mt-1"
        variants={variants}
        animate={isMove ? "hidden" : "visible"}
      >
        {itemData?.name ?? "文件夹"}
      </motion.p>
    </motion.div>
  );
};

export default SortableGroupItem;
