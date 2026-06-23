import { resourceR2List } from "@/services/resource";
import BaseListPage from "../components/baseListPage";
import { useTablePage } from "@/hooks/useTablePage2";
import { useState } from "react";
import BaseUploadModal from "../components/baseUploadModal";

const R2Page = () => {
  const table = useTablePage(resourceR2List);

  const { refresh } = table;

  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  const handleReplace = (record: any) => {};

  const handleDelete = () => {
    refresh();
  };

  return (
    <BaseListPage table={table} onAdd={handleAddClick} onReplace={handleReplace} onDelete={handleDelete}>
      <BaseUploadModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
        }}
        onOk={() => {
          setAddModalOpen(false);
          refresh();
        }}
      />
    </BaseListPage>
  );
};

export default R2Page;
