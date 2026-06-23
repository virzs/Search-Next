import { detailVersion } from "@/services/system/version";
import { useRequest } from "ahooks";
import { Space, Tag, Typography } from "antd";
import { useEffect } from "react";
import { useParams } from "react-router";
import { getPlatformDicLabel, getUpdateTypeDicLabel } from "./dic";
import { SimpleEditorViewer } from "zs_library";
import FullPageContainer from "@/components/containter/full";

const { Title, Paragraph } = Typography;

const VersionDetail = () => {
  const { id } = useParams();

  const { data, loading, run } = useRequest(detailVersion, {
    manual: true,
  });

  useEffect(() => {
    if (id) {
      run(id);
    }
  }, [id]);

  return (
    <FullPageContainer loading={loading}>
      <Title level={2}>{data?.version}</Title>
      <Paragraph>
        <Space>
          {data?.platforms?.map((platform: any) => (
            <Tag>
              {getPlatformDicLabel(platform?.platform)} ({getUpdateTypeDicLabel(platform?.updateType)})
            </Tag>
          ))}
        </Space>
      </Paragraph>
      {data?.content && <SimpleEditorViewer value={data?.content} />}
    </FullPageContainer>
  );
};

export default VersionDetail;
