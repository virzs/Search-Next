import { useTablePage } from "@/hooks/useTablePage2";
import BaseListPage from "../components/baseListPage";
import { resourceQiniuList } from "@/services/resource";

const QiniuPage = () => {
  const table = useTablePage(resourceQiniuList);

  return <BaseListPage table={table}></BaseListPage>;
};

export default QiniuPage;
