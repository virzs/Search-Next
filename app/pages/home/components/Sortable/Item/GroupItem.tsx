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
        <motion.div className="p-1.5 relative w-full h-full">
          <motion.div
            className={cx(
              "h-full w-full absolute left-0 top-0 grid gap-1 sortable-group-item cursor-pointer transition-all",
              childrenEmpty ? "" : "p-1.5",
              ((col === 1 && row === 1) || (col === 2 && row === 2)) &&
                "grid-cols-3 grid-rows-3",
              col === 1 && row === 2 && "grid-cols-2 grid-rows-6",
              col === 2 && row === 1 && "grid-cols-6 grid-rows-2"
            )}
          >
            {_children?.map((item, index) => (
              <motion.div
                data-parent-ids={parentIds?.join(",")}
                data-children-length={children?.length}
                className={cx(
                  "bg-green-500 rounded transition-all cursor-pointer",
                  childrenEmpty && "sortable-group-item",
                  (() => {
                    if (childrenEmpty) {
                      if (col === 1 && row === 1) {
                        return "col-span-3 row-span-3";
                      }
                      if (col === 2 && row === 1) {
                        return "col-span-6 row-span-2";
                      }
                      if (col === 1 && row === 2) {
                        return "col-span-3 row-span-2";
                      }
                      return "col-span-3 row-span-3";
                    } else {
                      if (col === 1 && row === 1) {
                        return "col-span-1 row-span-1";
                      }
                      if (col === 2 && row === 1) {
                        if (index < 2) {
                          return "col-span-2 row-span-2";
                        } else {
                          return "col-span-1 row-span-1";
                        }
                      }
                      if (col === 1 && row === 2) {
                        if (index < 2) {
                          return "col-span-2 row-span-2";
                        } else {
                          return "col-span-1 row-span-1";
                        }
                      }
                      return "col-span-1 row-span-1";
                    }
                  })()
                )}
                key={index}
              ></motion.div>
            ))}
          </motion.div>
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
