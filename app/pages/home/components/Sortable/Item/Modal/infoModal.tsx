import { motion } from "framer-motion";
import { FC } from "react";

export interface ItemInfoModalProps {}

const ItemInfoModal: FC<ItemInfoModalProps> = (props) => {
  // 是否为开发模式
  const isDev = process.env.NODE_ENV === "development";

  return <motion.div></motion.div>;
};

export default ItemInfoModal;
