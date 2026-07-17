import FullPageContainer from "@/components/containter/full";
import { ProFormEditor } from "@/components/pro-form";
import { SnippetsOutlined } from "@ant-design/icons";
import {
  getLegalDocumentDraft,
  publishLegalDocument,
  saveLegalDocumentDraft,
  type LegalDocumentLocale,
  type LegalDocumentRecord,
} from "@/services/system/legal-document";
import {
  ProForm,
  ProFormInstance,
  ProFormText,
} from "@ant-design/pro-components";
import { useRequest } from "ahooks";
import {
  Alert,
  App,
  Button,
  Modal,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { SimpleEditorViewer } from "zs_library";
import { SystemPaths } from "../router";
import {
  documentLabels,
  isLegalDocumentType,
  localeLabels,
} from "./shared";
import {
  getLegalDocumentTemplate,
  normalizeLegalDocumentContent,
} from "./templates";

type LegalFormValues = Pick<
  LegalDocumentRecord,
  "title" | "content" | "changeSummary"
>;

const LegalDocumentHandle = () => {
  const { message, modal } = App.useApp();
  const { type } = useParams();
  const navigate = useNavigate();
  const formRef = useRef<ProFormInstance<LegalFormValues>>(null);
  const documentType = isLegalDocumentType(type) ? type : undefined;
  const [publishOpen, setPublishOpen] = useState(false);
  const [requiresReconfirmation, setRequiresReconfirmation] = useState(true);
  const [preview, setPreview] = useState<LegalFormValues | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);

  const {
    data: draft,
    loading: detailLoading,
    run: loadDraft,
  } = useRequest(getLegalDocumentDraft, { manual: true });
  const { loading: saving, runAsync: persistDraft } = useRequest(
    saveLegalDocumentDraft,
    { manual: true },
  );
  const { loading: publishing, runAsync: publish } = useRequest(
    publishLegalDocument,
    { manual: true },
  );

  useEffect(() => {
    if (!documentType) {
      navigate(SystemPaths.legalDocuments, { replace: true });
      return;
    }
    loadDraft(documentType);
  }, [documentType, loadDraft, navigate]);

  useEffect(() => {
    if (!draft) return;
    const shouldUseTemplate =
      !draft.currentPublished &&
      !draft.content?.["zh-CN"]?.trim() &&
      !draft.content?.["en-US"]?.trim();
    formRef.current?.setFieldsValue(
      shouldUseTemplate && documentType
        ? getLegalDocumentTemplate(documentType)
        : {
            title: {
              "zh-CN": draft.title?.["zh-CN"] ?? "",
              "en-US": draft.title?.["en-US"] ?? "",
            },
            content: {
              "zh-CN": normalizeLegalDocumentContent(
                draft.content?.["zh-CN"],
              ),
              "en-US": normalizeLegalDocumentContent(
                draft.content?.["en-US"],
              ),
            },
            changeSummary: draft.changeSummary ?? "",
          },
    );
    setEditorVersion((value) => value + 1);
  }, [documentType, draft]);

  const getValidatedValues = async () => {
    const values = await formRef.current?.validateFields();
    return values as LegalFormValues | undefined;
  };

  const submitDraft = async () => {
    if (!documentType) return;
    const values = await getValidatedValues();
    if (!values) return;
    await persistDraft(documentType, values);
    message.success("草稿已保存");
    loadDraft(documentType);
  };

  const previewDraft = () => {
    const values = formRef.current?.getFieldsValue() as
      | LegalFormValues
      | undefined;
    if (values) setPreview(values);
  };

  const fillTemplate = () => {
    if (!documentType) return;
    const apply = () => {
      formRef.current?.setFieldsValue(getLegalDocumentTemplate(documentType));
      setEditorVersion((value) => value + 1);
      message.success("推荐模板已填充");
    };
    const values = formRef.current?.getFieldsValue() as
      | LegalFormValues
      | undefined;
    const hasContent = Boolean(
      values?.title?.["zh-CN"]?.trim() ||
        values?.content?.["zh-CN"]?.trim() ||
        values?.title?.["en-US"]?.trim() ||
        values?.content?.["en-US"]?.trim(),
    );
    if (!hasContent) {
      apply();
      return;
    }
    modal.confirm({
      title: `重新填充${documentLabels[documentType]}模板？`,
      content: "当前尚未保存的编辑内容将被完整模板替换。",
      okText: "确认替换",
      cancelText: "取消",
      onOk: apply,
    });
  };

  const submitPublish = async () => {
    if (!documentType) return;
    const values = await getValidatedValues();
    if (!values) return;
    await persistDraft(documentType, values);
    await publish(documentType, requiresReconfirmation);
    message.success("文档已发布");
    navigate(SystemPaths.legalDocuments);
  };

  const renderDocument = (
    value: LegalFormValues,
    item: LegalDocumentLocale,
  ) => {
    const usesChineseFallback =
      item === "en-US" && !value.content?.[item]?.trim();
    const title = value.title?.[item] || value.title?.["zh-CN"] || "";
    const content = value.content?.[item] || value.content?.["zh-CN"] || "";

    return content ? (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Typography.Title level={4} className="mb-0!">
            {title || "未命名文档"}
          </Typography.Title>
          {usesChineseFallback ? <Tag>已回退中文</Tag> : null}
        </div>
        <SimpleEditorViewer sanitize value={content} />
      </div>
    ) : (
      <Typography.Text type="secondary">该语言暂无内容</Typography.Text>
    );
  };

  return (
    <FullPageContainer
      loading={detailLoading}
      title={
        documentType ? `编辑${documentLabels[documentType]}` : "编辑文档"
      }
      cardProps={{
        extra: (
          <Space>
            <Button icon={<SnippetsOutlined />} onClick={fillTemplate}>
              填充模板
            </Button>
            <Button onClick={previewDraft}>预览</Button>
            <Button onClick={() => void submitDraft()} loading={saving}>
              保存草稿
            </Button>
            <Button type="primary" onClick={() => setPublishOpen(true)}>
              发布
            </Button>
          </Space>
        ),
      }}
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <Alert
          type="info"
          showIcon
          message="发布后将立即成为 Web 当前版本；实质性变更会要求现有用户重新确认。"
        />
        <ProForm<LegalFormValues>
          formRef={formRef}
          submitter={false}
          layout="vertical"
          initialValues={{
            title: { "zh-CN": "", "en-US": "" },
            content: { "zh-CN": "", "en-US": "" },
          }}
        >
          <Tabs
            destroyOnHidden={false}
            items={(Object.keys(localeLabels) as LegalDocumentLocale[]).map(
              (item) => ({
                key: item,
                label: localeLabels[item],
                children: (
                  <div className="grid gap-4">
                    <ProFormText
                      name={["title", item]}
                      label={`${localeLabels[item]}标题`}
                      rules={
                        item === "zh-CN"
                          ? [
                              {
                                required: true,
                                message: "中文标题不能为空",
                              },
                            ]
                          : undefined
                      }
                    />
                    <ProFormEditor
                      key={`${documentType}-${item}-${editorVersion}`}
                      name={["content", item]}
                      label={`${localeLabels[item]}内容`}
                      rules={
                        item === "zh-CN"
                          ? [
                              {
                                required: true,
                                message: "中文内容不能为空",
                              },
                            ]
                          : undefined
                      }
                      fieldProps={{ uploadDir: "legal-document" }}
                    />
                  </div>
                ),
              }),
            )}
          />
          <ProFormText
            name="changeSummary"
            label="变更摘要"
            placeholder="简要说明本次修改，便于用户和管理员识别"
          />
        </ProForm>
      </div>

      <Modal
        open={publishOpen}
        title={
          documentType ? `发布${documentLabels[documentType]}` : "发布文档"
        }
        okText="确认发布"
        confirmLoading={publishing || saving}
        onCancel={() => setPublishOpen(false)}
        onOk={() => void submitPublish()}
      >
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message="发布版本不可修改，后续调整会形成新的历史版本。"
        />
        <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3">
          <div>
            <div className="font-medium">要求现有用户重新确认</div>
            <div className="mt-1 text-xs text-gray-500">
              仅实质性条款或隐私变化开启；首次发布会自动开启。
            </div>
          </div>
          <Switch
            checked={requiresReconfirmation}
            onChange={setRequiresReconfirmation}
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(preview)}
        width={800}
        title="草稿预览"
        footer={null}
        onCancel={() => setPreview(null)}
        destroyOnHidden
      >
        {preview ? (
          <div className="space-y-5">
            {preview.changeSummary ? (
              <Alert
                type="info"
                showIcon
                message="变更摘要"
                description={preview.changeSummary}
              />
            ) : null}
            <Tabs
              items={(
                Object.keys(localeLabels) as LegalDocumentLocale[]
              ).map((item) => ({
                key: item,
                label: localeLabels[item],
                children: renderDocument(preview, item),
              }))}
            />
          </div>
        ) : null}
      </Modal>
    </FullPageContainer>
  );
};

export default LegalDocumentHandle;
