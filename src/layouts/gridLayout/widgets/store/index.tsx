import { useState } from "react";
import StoreDialog from "./dialog";

const Store = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        onClick={() => {
          setOpen(true);
        }}
      >
        添加
      </div>
      <StoreDialog
        visible={open}
        onHide={() => {
          setOpen(false);
        }}
      />
    </div>
  );
};

export default Store;
