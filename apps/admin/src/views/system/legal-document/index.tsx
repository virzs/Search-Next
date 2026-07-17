import FullPageContainer from "@/components/containter/full";
import {
  getLegalDocumentList,
  LEGAL_DOCUMENT_TYPES,
  type LegalDocumentRecord,
  type LegalDocumentType,
} from "@/services/system/legal-document";
import {
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Alert, Button, Card, Space, Tag, Typography } from "antd";
import { useNavigate } from "react-router";
import { SystemPaths } from "../router";
import { documentLabels, formatLegalDate } from "./shared";

const documentDescriptions: Record<LegalDocumentType, string> = {
  terms: "约定用户使用 Search Next 服务时的权利与责任。",
  privacy: "说明个人信息的收集、使用、保存与用户权利。",
};

const documentIcons = {
  terms: <FileTextOutlined />,
  privacy: <SafetyCertificateOutlined />,
} satisfies Record<LegalDocumentType, React.ReactNode>;

const createEmptyRecord = (
  type: LegalDocumentType,
): LegalDocumentRecord => ({
  _id: null,
  type,
  status: "draft",
  title: { "zh-CN": "", "en-US": "" },
  content: { "zh-CN": "", "en-US": "" },
  currentPublished: null,
});

const LegalDocumentManagement = () => {
  const navigate = useNavigate();
  const {
    data: response,
    loading,
    error,
    refresh,
  } = useRequest(getLegalDocumentList);
  const records = LEGAL_DOCUMENT_TYPES.map(
    (type) =>
      response?.data.find((record) => record.type === type) ??
      createEmptyRecord(type),
  );

  const navigateToEdit = (type: LegalDocumentType) =>
    navigate(`${SystemPaths.legalDocumentHandle}/${type}`);

  const navigateToHistory = (type: LegalDocumentType) =>
    navigate(`${SystemPaths.legalDocumentHistory}/${type}`);

  const navigateToRevision = (record: LegalDocumentRecord) => {
    const revisionId = record.currentPublished?.revisionId;
    if (!revisionId) return;
    navigate(
      `${SystemPaths.legalDocumentRevision}/${record.type}/${revisionId}`,
    );
  };

  return (
    <FullPageContainer
      showBackButton={false}
      loading={loading}
      cardProps={{
        extra: (
          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={refresh}
          >
            刷新
          </Button>
        ),
      }}
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <Alert
          type="info"
          showIcon
          message="发布后的版本不可修改；实质性变更会要求现有用户重新确认。"
        />

        {error ? (
          <Alert
            type="error"
            showIcon
            message="法律文档状态加载失败"
            description={error.message}
            action={<Button onClick={refresh}>重新加载</Button>}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {records.map((record) => {
            const published = record.currentPublished;
            const hasDraft = Boolean(record._id);
            return (
              <Card
                key={record.type}
                className="h-full overflow-hidden"
                styles={{ body: { height: "100%", padding: 0 } }}
              >
                <div className="flex h-full min-h-80 flex-col">
                  <div className="flex items-start justify-between gap-4 px-6 pt-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                        {documentIcons[record.type]}
                      </div>
                      <div className="min-w-0">
                        <Typography.Title level={4} className="mb-0!">
                          {documentLabels[record.type]}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                          {documentDescriptions[record.type]}
                        </Typography.Text>
                      </div>
                    </div>
                    <Space size={4} wrap className="justify-end">
                      {published ? (
                        <Tag color="green">已发布</Tag>
                      ) : (
                        <Tag>尚未发布</Tag>
                      )}
                      {hasDraft ? <Tag color="blue">有草稿</Tag> : null}
                    </Space>
                  </div>

                  <div className="flex-1 px-6 py-6">
                    <Typography.Text
                      type="secondary"
                      className="text-xs! tracking-wide"
                    >
                      当前发布标题
                    </Typography.Text>
                    <Typography.Title level={5} className="mb-5! mt-1!">
                      {published?.title?.["zh-CN"] || "尚未配置发布版本"}
                    </Typography.Title>

                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
                      <div>
                        <Typography.Text type="secondary" className="text-xs!">
                          确认版本
                        </Typography.Text>
                        <div className="mt-1 font-medium">
                          {published ? `V${published.consentVersion}` : "-"}
                        </div>
                      </div>
                      <div>
                        <Typography.Text type="secondary" className="text-xs!">
                          最近发布
                        </Typography.Text>
                        <div className="mt-1 font-medium">
                          {formatLegalDate(published?.publishedAt)}
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <Typography.Text type="secondary" className="text-xs!">
                          草稿状态
                        </Typography.Text>
                        <div className="mt-1 font-medium">
                          {hasDraft
                            ? "待发布"
                            : published
                              ? "无待发布草稿"
                              : "待配置"}
                        </div>
                      </div>
                    </div>

                    {published?.changeSummary ? (
                      <div className="mt-4">
                        <Typography.Text type="secondary" className="text-xs!">
                          最近变更摘要
                        </Typography.Text>
                        <Typography.Paragraph
                          ellipsis={{ rows: 2 }}
                          className="mb-0! mt-1!"
                        >
                          {published.changeSummary}
                        </Typography.Paragraph>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-6 py-4">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => navigateToEdit(record.type)}
                    >
                      {hasDraft ? "继续编辑" : "编辑配置"}
                    </Button>
                    <Button
                      icon={<EyeOutlined />}
                      disabled={!published}
                      onClick={() => navigateToRevision(record)}
                    >
                      查看当前版本
                    </Button>
                    <Button
                      type="text"
                      icon={<HistoryOutlined />}
                      onClick={() => navigateToHistory(record.type)}
                    >
                      发布历史
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </FullPageContainer>
  );
};

export default LegalDocumentManagement;
