import { FC } from "react";
import { ReactSortable } from "react-sortablejs";
import { useSortable } from "./context";
import SortableItem from "./Item";
import { css, cx } from "@emotion/css";
import ContextMenu from "./Item/ContextMenu";
import SortableGroupItem from "./Item/GroupItem";
import { SortItem } from "./types";
import ItemInfoModal from "./Item/Modal/InfoModal";
import GroupItemModal from "./Item/Modal/GroupItemModal";
import { ghostClass } from "./style";

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
  } = useSortable();

  return (
    <>
      <ReactSortable
        className={cx(
          "grid justify-center gap-8 transition-all",
          css`
            grid-template-columns: repeat(auto-fill, 64px);
            grid-auto-flow: dense;
            grid-auto-rows: 64px;
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
        onStart={() => {
          setListStatus("onMove");
        }}
        onEnd={(e) => {
          setListStatus(null);
        }}
        ghostClass={ghostClass}
      >
        {list.map((item, index) => {
          switch (item.type) {
            case "group":
            case "app":
              return (
                <SortableGroupItem
                  key={item.id}
                  data={item}
                  itemIndex={index}
                  parentIds={[item.id]}
                />
              );
            default:
              return (
                <SortableItem key={item.id} data={item} itemIndex={index} />
              );
          }
          // <div className="p-2 bg-white text-black">{item.title}</div>
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
