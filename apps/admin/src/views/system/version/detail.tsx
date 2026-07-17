import { detailVersion } from "@/services/system/version";
import { useRequest } from "ahooks";
import { Button, Space, Tag, Typography } from "antd";
import { useEffect } from "react";
import { useParams } from "react-router";
import { getPlatformDicLabel, getUpdateTypeDicLabel } from "./dic";
import { SimpleEditorViewer } from "zs_library";
import FullPageContainer from "@/components/containter/full";
import { RiExternalLinkLine } from "@remixicon/react";

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
      {data?.title ? <Title level={4}>{data.title}</Title> : null}
      <Paragraph>
        <Space>
          {data?.platforms?.map((platform: any) => (
            <Tag
              key={platform?.platform}
              color={platform?.platform === "web" ? "blue" : platform?.platform === "admin" ? "purple" : undefined}
            >
              {getPlatformDicLabel(platform?.platform)}
              {platform?.updateType ? ` (${getUpdateTypeDicLabel(platform.updateType)})` : ""}
            </Tag>
          ))}
          {data?.releaseTime ? <span>发布于 {data.releaseTime}</span> : null}
        </Space>
      </Paragraph>
      {data?.content && <SimpleEditorViewer value={data?.content} sanitize />}
      {data?.releaseUrl ? (
        <Button
          className="mt-4"
          href={data.releaseUrl}
          target="_blank"
          rel="noreferrer"
          icon={<RiExternalLinkLine size={15} />}
        >
          查看 GitHub Release
        </Button>
      ) : null}
    </FullPageContainer>
  );
};

export default VersionDetail;
