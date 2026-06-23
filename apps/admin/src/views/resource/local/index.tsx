import { resourceLocalList } from "@/services/resource";
import BaseListPage from "../components/baseListPage";
import { useTablePage } from "@/hooks/useTablePage2";
import { useState } from "react";
import BaseUploadModal from "../components/baseUploadModal";
import { App } from "antd";

const LocalPage = () => {
  const table = useTablePage(resourceLocalList);

  const { refresh } = table;

  const { message } = App.useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  const handleDelete = () => {
    message.success("删除成功");
    refresh();
  };

  return (
    <BaseListPage table={table} onAdd={handleAddClick} onDelete={handleDelete}>
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

export default LocalPage;
