"use client";

import { Modal } from "antd";
import { FC } from "react";
import { SortItem } from "../../types";
import { ReactSortable } from "react-sortablejs";
import SortableItem from "..";
import { useSortable } from "../../context";
import { css, cx } from "@emotion/css";

interface GroupItemModalProps {
  data: SortItem | null;
  onClose: () => void;
}

const GroupItemModal: FC<GroupItemModalProps> = (props) => {
  const { data, onClose } = props;
  const { setList, setListStatus } = useSortable();

  const _children = [...(data?.children ?? [])];

  return (
    <Modal
      open={!!data}
      onCancel={() => {
        onClose();
      }}
      title={data?.data?.name ?? "文件夹"}
      footer={null}
      closable={false}
      className={css`
        .ant-modal-content {
          background-color: transparent;
          box-shadow: none;
          padding: 0;
          .ant-modal-header {
            text-align: center;
            background-color: transparent;
            margin-bottom: 16px;
            .ant-modal-title {
              color: #fff;
            }
          }
          .ant-modal-body {
            background-color: rgba(255, 255, 255, 0.8);
            padding: 20px 28px;
            border-radius: 10px;
            max-height: 60vh;
            overflow-y: auto;
          }
        }
      `}
    >
      <ReactSortable
        className={cx(
          "grid gap-4",
          css`
            grid-template-columns: repeat(auto-fill, 64px);
            grid-auto-flow: dense;
            grid-auto-rows: 64px;
          `
        )}
        group={{ name: "nested", pull: true, put: false }}
        animation={150}
        fallbackOnBody
        list={data?.children ?? []}
        setList={(x) => setList(x, [data?.id])}
        onMove={(e) => {
          setListStatus("onMove");
          return true;
        }}
        onStart={() => {
          setListStatus("onMove");
        }}
        onEnd={(e) => {
          setListStatus(null);
        }}
        ghostClass={css`
          padding: 8px;
          transition: all 0.2s;
          > div {
            transition: all 0.2s;
            border: 2px solid aquamarine;
            background-color: transparent;
            > div {
              opacity: 0;
              transition: all 0.2s;
            }
          }
        `}
      >
        {_children.map((item, index) => {
          return <SortableItem key={item.id} data={item} itemIndex={index} />;
        })}
      </ReactSortable>
    </Modal>
  );
};

export default GroupItemModal;
