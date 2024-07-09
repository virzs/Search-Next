import { FC } from "react";
import { ReactSortable } from "react-sortablejs";
import SortableItem from "./Item";
import { css, cx } from "@emotion/css";
import ContextMenu from "./Item/ContextMenu";
import SortableGroupItem from "./Item/GroupItem";
import { SortItem } from "./types";
import { ghostClass } from "./style";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useSortable } from "./hook";

const ItemInfoModal = dynamic(() => import("./Item/Modal/InfoModal"), {
  ssr: false,
});

const GroupItemModal = dynamic(() => import("./Item/Modal/GroupItemModal"), {
  ssr: false,
});

export interface SortableProps {
  list?: SortItem[];
}

const Sortable: FC<SortableProps> = (props) => {
  const { list: propList } = props;
  const {
    list,
    setList,
    setListStatus,
    showInfoItemData,
    setShowInfoItemData,
    openGroupItemData,
    setOpenGroupItemData,
    setMoveItemId,
    moveTargetId,
    setMoveTargetId,
  } = useSortable();

  return (
    <>
      <ReactSortable
        className={cx(
          "grid justify-center transition-all place-items-center",
          css`
            grid-template-columns: repeat(auto-fill, 128px);
            grid-auto-flow: dense;
            grid-auto-rows: 128px;
          `
        )}
        animation={150}
        fallbackOnBody
        swapThreshold={0.65}
        group="nested"
        list={list}
        setList={(e) => setList(e)}
        onMove={(e) => {
          setListStatus("onMove");
          const { dragged, related } = e;
          const draggedData = dragged.dataset;
          const relatedData = related.dataset;
          if (relatedData?.id) {
            setMoveTargetId(relatedData.id);
          } else {
            setMoveTargetId(null);
          }
          // 限制只有一层
          // sortable-group-item 标记为文件夹
          if (
            (Object.keys(relatedData).length === 0 || relatedData.parentIds) &&
            Number(draggedData.childrenLength) > 0 &&
            related.classList.contains("sortable-group-item")
          ) {
            return false;
          }
          return true;
        }}
        onStart={(e) => {
          const dataset = e.item.dataset;
          if (dataset?.id) {
            setMoveItemId(dataset.id);
          }
          setListStatus("onMove");
        }}
        onEnd={(e) => {
          setMoveItemId(null);
          setMoveTargetId(null);
          setListStatus(null);
        }}
        ghostClass={ghostClass}
      >
        {list.map((item, index) => {
          let el;

          switch (item.type) {
            case "group":
            case "app":
              el = (
                <SortableGroupItem
                  key={item.id}
                  data={item}
                  itemIndex={index}
                  parentIds={[item.id]}
                />
              );
              break;
            default:
              el = <SortableItem key={item.id} data={item} itemIndex={index} />;
              break;
          }

          return el;
        })}
      </ReactSortable>

      {/* 右键菜单 */}
      <ContextMenu />

      {/* 单个item信息弹窗 */}
      <ItemInfoModal
        data={showInfoItemData}
        onClose={() => {
          setShowInfoItemData(null);
        }}
      />

      {/* GroupModal 点击展开弹窗 */}
      <GroupItemModal
        data={openGroupItemData}
        onClose={() => {
          setOpenGroupItemData(null);
        }}
      />
    </>
  );
};

export default Sortable;
