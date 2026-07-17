import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import TablePageContainer from "@/components/containter/table";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  getLegalDocumentHistory,
  type LegalDocumentRecord,
} from "@/services/system/legal-document";
import { Tag, Typography } from "antd";
import { useNavigate, useParams } from "react-router";
import { SystemPaths } from "../router";
import {
  documentLabels,
  formatLegalDate,
  isLegalDocumentType,
} from "./shared";

const LegalDocumentHistory = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const documentType = isLegalDocumentType(type) ? type : undefined;
  const table = useTablePage<LegalDocumentRecord>(
    (params) =>
      documentType
        ? getLegalDocumentHistory(documentType, params)
        : Promise.resolve({ data: [], total: 0, page: 1, pageSize: 200 }),
    { ready: Boolean(documentType) },
  );

  const columns: WindowTableColumnType<LegalDocumentRecord>[] = [
    {
      title: "标题",
      dataIndex: ["title", "zh-CN"],
      minWidth: 220,
      render: (value) => value || "-",
    },
    {
      title: "确认版本",
      dataIndex: "consentVersion",
      width: 110,
      render: (value) => `V${value}`,
    },
    {
      title: "变更类型",
      dataIndex: "requiresReconfirmation",
      width: 150,
      render: (value) =>
        value ? (
          <Tag color="orange">需要重新确认</Tag>
        ) : (
          <Tag>普通修订</Tag>
        ),
    },
    {
      title: "变更摘要",
      dataIndex: "changeSummary",
      minWidth: 220,
      render: (value) => value || "-",
    },
    {
      title: "发布人",
      dataIndex: "publishedBy",
      width: 140,
      render: (value) =>
        typeof value === "string" ? value : value?.username || "-",
    },
    {
      title: "发布时间",
      dataIndex: "publishedAt",
      width: 170,
      render: formatLegalDate,
    },
    {
      title: "操作",
      dataIndex: "operation",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Operation
          columns={[
            {
              title: "查看",
              onClick: () => {
                if (documentType && record._id) {
                  navigate(
                    `${SystemPaths.legalDocumentRevision}/${documentType}/${record._id}`,
                  );
                }
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <TablePageContainer>
      <TablePage table={table} columns={columns} rowKey="_id">
        <Typography.Text type="secondary">
          {documentType ? documentLabels[documentType] : "法律文档"}发布历史
        </Typography.Text>
      </TablePage>
    </TablePageContainer>
  );
};

export default LegalDocumentHistory;
