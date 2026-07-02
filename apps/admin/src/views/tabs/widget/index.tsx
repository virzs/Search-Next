import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  delWidget,
  getWidget,
  updateWidgetEnable,
  uploadWidgetPackage,
  type WidgetPackageImportResult,
} from "@/services/tabs/widget";
import {
  Alert,
  Button,
  List,
  message,
  Modal,
  Progress,
  Space,
  Tag,
  Typography,
  Upload,
  type UploadProps,
} from "antd";
import { useRequest } from "ahooks";
import { useNavigate } from "react-router";
import { RiAddLine, RiUploadCloud2Line } from "@remixicon/react";
import { TabsPaths } from "../router";
import { type ReactNode, useMemo, useState } from "react";
import WidgetVersionModal from "./version-modal";

const { Dragger } = Upload;

type BatchUploadStatus = "pending" | "uploading" | "success" | "error";

type BatchUploadItem = {
  uid: string;
  fileKey: string;
  file: File;
  name: string;
  status: BatchUploadStatus;
  message?: string;
};

const getFileKey = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}`;

const getUploadErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || "上传失败");

const getImportResultText = (result: WidgetPackageImportResult) => {
  const widgetName = result.widget?.name || "小组件";
  const version = result.widget?.version || result.version?.version;
  return version ? `${widgetName} v${version}` : widgetName;
};

const statusTagMap: Record<BatchUploadStatus, ReactNode> = {
  pending: <Tag>待上传</Tag>,
  uploading: <Tag color="processing">上传中</Tag>,
  success: <Tag color="success">成功</Tag>,
  error: <Tag color="error">失败</Tag>,
};

const BatchWidgetUploadModal = ({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}) => {
  const [items, setItems] = useState<BatchUploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const successCount = useMemo(
    () => items.filter((item) => item.status === "success").length,
    [items],
  );
  const failedCount = useMemo(
    () => items.filter((item) => item.status === "error").length,
    [items],
  );
  const uploadableCount = useMemo(
    () => items.filter((item) => item.status !== "success").length,
    [items],
  );
  const progressPercent = items.length
    ? Math.round((successCount / items.length) * 100)
    : 0;

  const updateItem = (uid: string, patch: Partial<BatchUploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, ...patch } : item)),
    );
  };

  const handleBeforeUpload: UploadProps["beforeUpload"] = (rawFile) => {
    const file = rawFile as File & { uid: string };
    if (!file.name.toLowerCase().endsWith(".snwidget")) {
      message.warning(`${file.name} 不是 .snwidget 文件`);
      return false;
    }

    const fileKey = getFileKey(file);
    setItems((prev) => {
      if (prev.some((item) => item.fileKey === fileKey)) return prev;
      return [
        ...prev,
        {
          uid: file.uid,
          fileKey,
          file,
          name: file.name,
          status: "pending",
        },
      ];
    });
    return false;
  };

  const removeItem = (uid: string) => {
    setItems((prev) => prev.filter((item) => item.uid !== uid));
  };

  const handleUpload = async () => {
    const targets = items.filter((item) => item.status !== "success");
    if (!targets.length) return;

    setUploading(true);
    let success = 0;
    let failed = 0;

    for (const item of targets) {
      updateItem(item.uid, { status: "uploading", message: undefined });
      try {
        const result = await uploadWidgetPackage(item.file);
        success += 1;
        updateItem(item.uid, {
          status: "success",
          message: `已导入 ${getImportResultText(result)}`,
        });
      } catch (error) {
        failed += 1;
        updateItem(item.uid, {
          status: "error",
          message: getUploadErrorMessage(error),
        });
      }
    }

    setUploading(false);
    if (success) {
      message.success(`成功导入/更新 ${success} 个小组件`);
      onUploaded();
    }
    if (failed) {
      message.error(`${failed} 个小组件上传失败，可修正后重试`);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    onClose();
    setItems([]);
  };

  return (
    <Modal
      open={open}
      title="批量上传小组件"
      width={760}
      onCancel={handleClose}
      footer={[
        <Button key="clear" disabled={uploading || !items.length} onClick={() => setItems([])}>
          清空
        </Button>,
        <Button key="close" disabled={uploading} onClick={handleClose}>
          关闭
        </Button>,
        <Button
          key="upload"
          type="primary"
          loading={uploading}
          disabled={!uploadableCount}
          onClick={handleUpload}
        >
          {failedCount ? "重试失败项" : "开始上传"}
        </Button>,
      ]}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Alert
          showIcon
          type="info"
          message="支持一次选择多个 .snwidget 包"
          description="系统会按包内 widget.config.json 的 name 自动新增或更新同名小组件，并发布当前包版本。分类、启用状态和排序等运营字段会保留原值。"
        />
        <Dragger
          multiple
          accept=".snwidget"
          beforeUpload={handleBeforeUpload}
          showUploadList={false}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <RiUploadCloud2Line size={34} />
          </p>
          <p className="ant-upload-text">点击或拖拽多个 .snwidget 文件到这里</p>
          <p className="ant-upload-hint">已存在的小组件会按包名自动更新，无需逐个进入表单。</p>
        </Dragger>

        {items.length ? (
          <>
            <div>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Typography.Text type="secondary">
                  共 {items.length} 个，成功 {successCount} 个
                  {failedCount ? `，失败 ${failedCount} 个` : ""}
                </Typography.Text>
                <Typography.Text type="secondary">{progressPercent}%</Typography.Text>
              </Space>
              <Progress percent={progressPercent} showInfo={false} />
            </div>
            <List
              bordered
              size="small"
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key="remove"
                      type="link"
                      danger
                      disabled={uploading}
                      onClick={() => removeItem(item.uid)}
                    >
                      移除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Typography.Text ellipsis style={{ maxWidth: 430 }}>
                          {item.name}
                        </Typography.Text>
                        {statusTagMap[item.status]}
                      </Space>
                    }
                    description={
                      item.status === "error" ? (
                        <Typography.Text type="danger">{item.message}</Typography.Text>
                      ) : (
                        item.message || "等待上传"
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </>
        ) : null}
      </Space>
    </Modal>
  );
};

const WidgetIndex = () => {
  const navigate = useNavigate();
  const table = useTablePage(getWidget);
  const { refresh } = table;
  const [versionTarget, setVersionTarget] = useState<any>(null);
  const [batchUploadOpen, setBatchUploadOpen] = useState(false);

  const { runAsync: delRun } = useRequest(delWidget, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const { runAsync: updateEnableRun } = useRequest(updateWidgetEnable, {
    manual: true,
    onSuccess: () => {
      message.success("操作成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "名称",
      dataIndex: "name",
    },
    {
      title: "简介",
      dataIndex: "description",
    },
    {
      title: "分类",
      dataIndex: "classify",
      render: (c: any) => c?.name ?? "-",
    },
    // 版本号列
    {
      title: "版本",
      dataIndex: "version",
      width: 80,
      render: (text: string) => text || "-",
    },
    // 作者列
    {
      title: "作者",
      dataIndex: "author",
      width: 100,
      render: (text: string) => text || "-",
    },
    // 图标模式支持状态列
    {
      title: "图标模式",
      dataIndex: "supportIconMode",
      width: 90,
      render: (val: boolean) => val ? "支持" : "不支持",
    },
    {
      title: "应用模式",
      dataIndex: "supportAppMode",
      width: 90,
      render: (val: boolean) => val ? "支持" : "不支持",
    },
    // 标签展示列
    {
      title: "标签",
      dataIndex: "tags",
      width: 150,
      render: (tags: string[]) => tags?.length ? tags.join("、") : "-",
    },
    {
      title: "是否启用",
      dataIndex: "enable",
      render: (text) => (text ? "是" : "否"),
      width: 100,
    },
    {
      title: "来源",
      dataIndex: "sourceType",
      width: 110,
      render: (value: string) => value === "snwidget" ? <Tag color="blue">snwidget</Tag> : <Tag>legacy</Tag>,
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 220,
      render: (_: any, record: any) => (
        <Operation
          columns={[
            {
              title: "修改",
              onClick: () => navigate(TabsPaths.widgetHandle + "/" + record._id),
            },
            {
              title: "版本",
              onClick: () => setVersionTarget(record),
            },
            {
              title: record.enable ? "禁用" : "启用",
              confirm: record.enable ? { title: "确认禁用?", content: "禁用后前台将不再展示该小组件" } : undefined,
              onClick: async () => {
                await updateEnableRun(record._id);
              },
            },
            {
              title: "删除",
              confirm: "delete",
              onClick: async () => {
                await delRun(record._id);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <TablePageContainer>
      <TablePage
        table={table}
        columns={columns}
        button={
          <Space>
            <Button icon={<RiUploadCloud2Line size={16} />} onClick={() => setBatchUploadOpen(true)}>
              批量上传
            </Button>
            <Button type="primary" icon={<RiAddLine size={16} />} onClick={() => navigate(TabsPaths.widgetHandle)}>
              新增
            </Button>
          </Space>
        }
      />
      <BatchWidgetUploadModal
        open={batchUploadOpen}
        onClose={() => setBatchUploadOpen(false)}
        onUploaded={refresh}
      />
      <WidgetVersionModal
        open={!!versionTarget}
        widgetId={versionTarget?._id}
        widgetName={versionTarget?.name}
        onClose={() => setVersionTarget(null)}
        onPublished={refresh}
      />
    </TablePageContainer>
  );
};

export default WidgetIndex;
