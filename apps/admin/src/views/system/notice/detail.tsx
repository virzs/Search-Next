import FullPageContainer from "@/components/containter/full";
import PrivateImage from "@/components/Image/PrivateImage";
import { detailNotice } from "@/services/system/notice";
import { useRequest } from "ahooks";
import { Tag, Typography } from "antd";
import { useEffect } from "react";
import { useParams } from "react-router";
import { SimpleEditorViewer } from "zs_library";

const { Title, Paragraph } = Typography;

const NoticeDetail = () => {
  const { id } = useParams();

  const { data, loading, run } = useRequest(detailNotice, {
    manual: true,
  });

  useEffect(() => {
    if (id) {
      run(id);
    }
  }, [id]);

  const cover = (data as any)?.cover;
  const coverResource =
    typeof cover === "string"
      ? {
          _id: cover,
          name: "",
          key: "",
          mimetype: "",
          dir: "",
          size: 0,
          url: "",
        }
      : cover;

  return (
    <FullPageContainer loading={loading}>
      <Title level={2}>{(data as any)?.title}</Title>
      <Paragraph className="flex items-center gap-2">
        <Tag>{(data as any)?.key}</Tag>
        {(data as any)?.enable ? (
          <Tag color="green">启用</Tag>
        ) : (
          <Tag>禁用</Tag>
        )}
        <span>{(data as any)?.effectiveStart ?? "-"}</span>
        <span>~</span>
        <span>{(data as any)?.effectiveEnd ?? "-"}</span>
      </Paragraph>

      {coverResource ? (
        <div className="pb-4">
          <PrivateImage resource={coverResource} width={260} />
        </div>
      ) : null}

      {(data as any)?.content ? (
        <SimpleEditorViewer value={(data as any)?.content} />
      ) : null}
    </FullPageContainer>
  );
};

export default NoticeDetail;
