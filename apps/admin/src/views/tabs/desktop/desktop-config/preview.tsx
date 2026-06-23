import FullPageContainer from "@/components/containter/full";
import { detailDesktopAdminConfig } from "@/services/tabs/desktop/desktop-config";
import { useRequest } from "ahooks";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Desktop } from "zs_library";

const DesktopConfigPreview = () => {
  const { id } = useParams();

  const { data, loading, run } = useRequest(detailDesktopAdminConfig, {
    manual: true,
  });

  const { config } = data ?? {};

  useEffect(() => {
    if (id) {
      run(id);
    }
  }, [id]);

  return (
    <FullPageContainer loading={loading}>
      <Desktop list={config?.list} theme={(config?.theme && (config?.theme?.value ?? config?.theme))} />
    </FullPageContainer>
  );
};

export default DesktopConfigPreview;
