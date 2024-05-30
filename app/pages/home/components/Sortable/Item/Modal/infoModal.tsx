"use client";

import { motion } from "framer-motion";
import { FC } from "react";
import { Modal } from "antd";
import ReactJson from "react-json-view";
import { SortItem } from "../../types";

export interface ItemInfoModalProps {
  data: SortItem | null;
  onClose: () => void;
}

/**
 * 查看当前项的详细信息，开发模式下会额外显示原始数据
 */
const ItemInfoModal: FC<ItemInfoModalProps> = (props) => {
  const { data, onClose } = props;

  // 是否为开发模式
  const isDev = process.env.NODE_ENV === "development";

  return (
    <Modal
      open={!!data}
      onCancel={() => {
        onClose();
      }}
      footer={null}
      title={data?.data?.name ?? "信息"}
    >
      {data && (
        <div>
          <div className="mb-2">开发者信息</div>
          <div className="p-2 rounded-md bg-[#272822]">
            <ReactJson src={data as object} theme="monokai" />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ItemInfoModal;
