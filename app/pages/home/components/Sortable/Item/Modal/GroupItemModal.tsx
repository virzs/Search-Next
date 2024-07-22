"use client";

import { Input, Modal } from "antd";
import { FC } from "react";
import { SortItem } from "../../types";
import { ReactSortable } from "react-sortablejs";
import SortableItem from "..";
import { css, cx } from "@emotion/css";
import { ghostClass } from "../../style";
import { useSortable } from "../../hook";

interface GroupItemModalProps {
  data: SortItem | null;
  onClose: () => void;
}

const GroupItemModal: FC<GroupItemModalProps> = (props) => {
  const { data, onClose } = props;
  const { list, setList, setListStatus, setMoveItemId, setMoveTargetId } =
    useSortable();

  const _children = [...(data?.children ?? [])];

  return (
    <Modal
      open={!!data}
      onCancel={() => {
        onClose();
      }}
      title={
        <Input
          className="!bg-transparent !border-none text-center text-white !shadow-none text-xl"
          value={data?.data?.name ?? "文件夹"}
        />
      }
      footer={null}
      closable={false}
      className={cx(
        "group-item-modal",
        css`
          .ant-modal-content {
            background-color: transparent;
            box-shadow: none;
            padding: 0;
            .ant-modal-header {
              text-align: center;
              background-color: transparent;
              margin-bottom: 16px;
              .ant-modal-name {
                color: #fff;
              }
            }
            .ant-modal-body {
              background-color: rgba(255, 255, 255, 0.8);
              border-radius: 10px;
              overflow: hidden;
            }
          }
        `
      )}
      width={600}
      destroyOnClose
    >
      <div
        className="overflow-y-auto max-h-[60vh] py-5 pl-6 pr-4"
        onDragLeave={(e) => {
          // 获取鼠标指针进入的元素
          const relatedTarget = e.relatedTarget;
          if (!relatedTarget) return;

          if (!e.currentTarget.contains(relatedTarget as any)) {
            // 鼠标确实离开了当前元素
            setTimeout(() => {
              onClose();
            }, 500);
          }
        }}
      >
        <ReactSortable
          className={cx(
            "grid gap-4 place-items-center",
            css`
              grid-template-columns: repeat(auto-fill, 96px);
              grid-auto-flow: dense;
              grid-auto-rows: 96px;
            `
          )}
          group={{ name: "nested", pull: true, put: false }}
          animation={150}
          fallbackOnBody
          list={data?.children ?? []}
          setList={(x) => {
            const xIds = x.map((item) => item.id);
            const parentChildrenIds = list
              .find((item) => item.id === data?.id)
              ?.children?.map((item) => item.id);
            // ! 如果ids个数相同，顺序相同 return，优化性能
            if (
              xIds.length === parentChildrenIds?.length &&
              xIds.every((id, index) => id === parentChildrenIds[index])
            ) {
              return;
            }

            // ! 解决文件夹中移出再移入会触发setList导致元素丢失bug
            if (xIds.length < (parentChildrenIds?.length ?? 0)) {
              return;
            }

            setList(x, [data?.id], "modal");
          }}
          onMove={(e) => {
            setMoveTargetId(null);
            setListStatus("onMove");
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
          {_children.map((item, index) => {
            return <SortableItem key={item.id} data={item} itemIndex={index} />;
          })}
        </ReactSortable>
      </div>
    </Modal>
  );
};

export default GroupItemModal;
