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
    setMoveTargetId,
  } = useSortable();

  const { children, data: itemData, config: itemConfig } = data;

  const { row = 1, col = 1 } = itemConfig ?? {};

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
    return moveTargetId === data.id;
  }, [data.id, moveTargetId]);

  const sizedContent = () => {
    /** type app */
    if (childrenEmpty) {
      return (
        <motion.div className="w-full h-full bg-green-500 absolute left-0 top-0 sortable-group-item"></motion.div>
      );
    }
    if ((row === 1 && col === 1) || (row === 2 && col === 2)) {
      return (
        <motion.div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1 gap-2">
          {_children?.slice(0, 9).map((i) => (
            <motion.div className="bg-green-500 rounded-lg"></motion.div>
          ))}
        </motion.div>
      );
    }
    if (row === 1 && col === 2) {
      return (
        <motion.div className="grid grid-cols-10 grid-rows-4 gap-x-2 gap-y-1 w-[144px] h-[52px]">
          {_children?.slice(0, 4).map((i, j) => (
            <motion.div
              className={cx(
                "bg-green-500",
                j < 2
                  ? "w-[52px] h-[52px] rounded-lg col-span-4 row-span-4"
                  : "w-6 h-6 rounded-md col-span-2 row-span-2"
              )}
            ></motion.div>
          ))}
        </motion.div>
      );
    }
    if (row === 2 && col === 1) {
      return (
        <motion.div className="grid grid-cols-4 grid-rows-10 gap-x-1 gap-y-2 w-[52px] h-[144px]">
          {_children?.slice(0, 4).map((i, j) => (
            <motion.div
              className={cx(
                "bg-green-500",
                j < 2
                  ? "w-[52px] h-[52px] rounded-lg col-span-4 row-span-4"
                  : "w-6 h-6 rounded-md col-span-2 row-span-2"
              )}
            ></motion.div>
          ))}
        </motion.div>
      );
    }
  };

  return (
    <motion.div
      data-id={data.id}
      data-parent-ids={parentIds?.join(",")}
      data-children-length={children?.length}
      className={css`
        grid-row: span ${row};
        grid-column: span ${col};
      `}
    >
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={cx(
          "relative rounded-xl bg-orange-400 border-0 overflow-hidden transition-all mx-auto",
          isMoveTarget ? "!scale-110" : "",
          css`
            width: ${col * 64 + 32 * (col - 1)}px;
            height: ${row * 64 + 32 * (row - 1)}px;
          `
        )}
        onClick={() => {
          if (!childrenEmpty && !longPressTriggered) {
            setOpenGroupItemData(data);
          }
        }}
        {...contextMenuFuns(data)}
      >
        <motion.div className="p-1.5 relative w-full h-full flex justify-center items-center">
          {sizedContent()}
          {/* 需要设置宽高小于父元素，否则在拖拽时会始终响应子列表 */}
          <ReactSortable
            className={cx(
              "absolute sortable-group-item cursor-pointer left-1.5 top-1.5",
              css`
                width: calc(100% - 0.75rem);
                height: calc(100% - 0.75rem);
                > * {
                  opacity: 0;
                }
              `
            )}
            group={{ name: "nested", pull: false, put: true }}
            animation={150}
            fallbackOnBody
            list={children ?? []}
            setList={(x) => setList(x, parentIds)}
            // 只能移入，文件夹中的不能响应拖拽事件
            filter={() => true}
            data-id={data.id}
            onChange={() => {
              setMoveTargetId(data.id);
            }}
          ></ReactSortable>
        </motion.div>
      </motion.div>
      <motion.p
        className="text-center mt-1 text-black dark:text-white"
        variants={variants}
        animate={isMove ? "hidden" : "visible"}
      >
        {itemData?.name ?? "文件夹"}
      </motion.p>
    </motion.div>
  );
};

export default SortableGroupItem;
