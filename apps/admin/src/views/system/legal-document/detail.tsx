import FullPageContainer from "@/components/containter/full";
import {
  getLegalDocumentRevision,
  type LegalDocumentLocale,
} from "@/services/system/legal-document";
import { useRequest } from "ahooks";
import { Space, Tabs, Tag, Typography } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { SimpleEditorViewer } from "zs_library";
import { SystemPaths } from "../router";
import {
  formatLegalDate,
  isLegalDocumentType,
  localeLabels,
} from "./shared";
import { normalizeLegalDocumentContent } from "./templates";

const LegalDocumentDetail = () => {
  const { type, revisionId } = useParams();
  const navigate = useNavigate();
  const documentType = isLegalDocumentType(type) ? type : undefined;
  const { data, loading, run } = useRequest(getLegalDocumentRevision, {
    manual: true,
  });

  useEffect(() => {
    if (!documentType || !revisionId) {
      navigate(SystemPaths.legalDocuments, { replace: true });
      return;
    }
    run(documentType, revisionId);
  }, [documentType, navigate, revisionId, run]);

  return (
    <FullPageContainer
      loading={loading}
      title={data?.title?.["zh-CN"] || "法律文档版本"}
    >
      {data ? (
        <div className="mx-auto max-w-5xl space-y-5">
          <Space wrap>
            <Tag>确认版本 V{data.consentVersion}</Tag>
            {data.requiresReconfirmation ? (
              <Tag color="orange">需要重新确认</Tag>
            ) : (
              <Tag>普通修订</Tag>
            )}
            <Typography.Text type="secondary">
              {formatLegalDate(data.publishedAt)}
            </Typography.Text>
          </Space>
          {data.changeSummary ? (
            <Typography.Paragraph type="secondary">
              变更摘要：{data.changeSummary}
            </Typography.Paragraph>
          ) : null}
          <Tabs
            items={(Object.keys(localeLabels) as LegalDocumentLocale[]).map(
              (item) => ({
                key: item,
                label: localeLabels[item],
                children: data.content?.[item] ? (
                    <SimpleEditorViewer
                      sanitize
                      value={normalizeLegalDocumentContent(
                        data.content[item],
                      )}
                  />
                ) : (
                  <Typography.Text type="secondary">
                    该语言暂无内容
                  </Typography.Text>
                ),
              }),
            )}
          />
        </div>
      ) : null}
    </FullPageContainer>
  );
};

export default LegalDocumentDetail;
