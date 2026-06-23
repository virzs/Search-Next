import { useRequest } from "ahooks";
import BaseDetail from "../components/baseDetail";
import { resourceDetail } from "@/services/resource";
import { useParams } from "react-router";
import { useEffect } from "react";

const R2DetailPage = () => {
  const { id } = useParams();

  const { data, loading, run } = useRequest(resourceDetail, {
    manual: true,
  });

  useEffect(() => {
    if (id) {
      run(id);
    }
  }, [id]);

  return <BaseDetail data={data} loading={loading}></BaseDetail>;
};

export default R2DetailPage;
