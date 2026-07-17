import FullPageContainer from "@/components/containter/full";
import {
  detailVersion,
  getLatestVersion,
  getReleaseCandidates,
  postVersion,
  publishReleasePublication,
  putVersion,
  type ReleaseCandidate,
  type ReleaseComponent,
} from "@/services/system/version";
import { baseFormItemLayout } from "@/utils/utils";
import { BetaSchemaForm, ProFormInstance } from "@ant-design/pro-components";
import { RiExternalLinkLine, RiRefreshLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { Alert, Button, Space, message } from "antd";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  platformAcceptDicMap,
  platformDicMap,
  updateTypeDicMap,
} from "./dic";

const clientPlatformDicMap = {
  windows: platformDicMap.windows,
  mac: platformDicMap.mac,
};

const releaseMeta: Record<
  ReleaseComponent,
  { label: string; titlePrefix: string }
> = {
  web: { label: "Web", titlePrefix: "Web" },
  admin: { label: "Admin", titlePrefix: "管理后台" },
};

const isReleaseComponent = (value?: string): value is ReleaseComponent =>
  value === "web" || value === "admin";

const buildUpdateContent = (release: ReleaseCandidate) => {
  const content = release.announcementContent.trim();
  const source = `[查看 GitHub Release](${release.releaseUrl})`;
  return content ? `${content}\n\n${source}` : source;
};

const parseClientContent = (value?: string) => {
  if (!value) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const toMarkdown = (value: unknown) =>
  typeof value === "string" ? value : JSON.stringify(value || "");

const VersionHandle = () => {
  const ref = useRef<ProFormInstance | undefined>(undefined);
  const { id } = useParams();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<string>();
  const [selectedReleaseId, setSelectedReleaseId] = useState<number>();
  const [legacyPlatforms, setLegacyPlatforms] = useState<any[]>([]);

  const { data: latest, run: loadLatest } = useRequest(getLatestVersion, {
    manual: true,
  });
  const {
    data: releaseCandidates,
    loading: releaseLoading,
    run: loadReleaseCandidates,
  } = useRequest(getReleaseCandidates, { manual: true });

  const releases = useMemo(
    () =>
      isReleaseComponent(platform)
        ? releaseCandidates?.[platform] || []
        : [],
    [platform, releaseCandidates],
  );
  const selectedRelease = useMemo(
    () =>
      releases.find(
        (release) => release.githubReleaseId === selectedReleaseId,
      ),
    [releases, selectedReleaseId],
  );
  const releasePlatform = isReleaseComponent(platform);

  const { run: loadDetail } = useRequest(detailVersion, {
    manual: true,
    onSuccess: (data) => {
      const currentPlatform = data?.platforms?.[0];
      setLegacyPlatforms(data?.platforms || []);
      setPlatform(currentPlatform?.platform);
      ref.current?.setFieldsValue({
        ...data,
        platform: currentPlatform?.platform,
        updateType: currentPlatform?.updateType
          ? String(currentPlatform.updateType)
          : undefined,
        source: currentPlatform?.source,
        content: parseClientContent(data?.content),
      });
    },
  });

  useEffect(() => {
    if (id) {
      loadDetail(id);
      return;
    }
    loadLatest({ platform: "all" });
  }, [id]);

  useEffect(() => {
    if (id || releasePlatform || !latest) return;
    const latestArr = latest?.version?.split("-") ?? [];
    const suffixDate = format(new Date(), "yyMMdd");
    const version = `${latestArr?.[0] || "0.0.0"}-${suffixDate}-${
      (Number(latestArr[2]) || 0) + 1
    }`;
    ref.current?.setFieldsValue({ version });
  }, [latest, id, releasePlatform, platform]);

  const changePlatform = (value: string) => {
    setPlatform(value);
    if (id) {
      const currentPlatform = legacyPlatforms.find(
        (item) => item.platform === value,
      );
      ref.current?.setFieldsValue({
        platform: value,
        updateType: currentPlatform?.updateType
          ? String(currentPlatform.updateType)
          : undefined,
        source: currentPlatform?.source,
      });
      return;
    }
    setSelectedReleaseId(undefined);
    ref.current?.setFieldsValue({
      platform: value,
      githubReleaseId: undefined,
      updateType: undefined,
      source: undefined,
      announcementTitle: undefined,
      deploymentConfirmed: false,
      content: undefined,
      version: undefined,
    });
    if (isReleaseComponent(value)) {
      loadReleaseCandidates(false);
    } else {
      loadLatest({ platform: "all" });
    }
  };

  const changeRelease = (githubReleaseId: number) => {
    setSelectedReleaseId(githubReleaseId);
    const release = releases.find(
      (item) => item.githubReleaseId === githubReleaseId,
    );
    if (!release || !isReleaseComponent(platform)) return;
    ref.current?.setFieldsValue({
      githubReleaseId,
      version: release.version,
      announcementTitle: `${releaseMeta[platform].titlePrefix} ${release.version} 更新记录`,
      content: buildUpdateContent(release),
      deploymentConfirmed: false,
    });
  };

  const commonContentColumn = {
    title: "更新内容",
    dataIndex: "content",
    valueType: "editor" as const,
    formItemProps: {
      rules: [{ required: true, message: "更新内容不能为空" }],
    },
  };

  const columns: any[] = [
    {
      title: "发布平台",
      dataIndex: "platform",
      valueType: "select",
      valueEnum: id ? clientPlatformDicMap : platformDicMap,
      fieldProps: {
        disabled: Boolean(id && legacyPlatforms.length <= 1),
        onChange: changePlatform,
      },
      formItemProps: {
        rules: [{ required: true, message: "请选择发布平台" }],
      },
    },
    ...(!platform
      ? []
      : releasePlatform
      ? [
          {
            title: "GitHub Release",
            dataIndex: "githubReleaseId",
            valueType: "select",
            fieldProps: {
              loading: releaseLoading,
              showSearch: true,
              optionFilterProp: "label",
              options: releases.map((release) => ({
                value: release.githubReleaseId,
                label: `${release.tagName} · ${release.releaseName}${
                  release.published ? "（已发布）" : ""
                }`,
                disabled: release.published,
              })),
              onChange: changeRelease,
            },
            formItemProps: {
              rules: [{ required: true, message: "请选择 GitHub Release" }],
              extra: (
                <Space wrap className="pt-2">
                  <Button
                    type="link"
                    size="small"
                    icon={<RiRefreshLine size={14} />}
                    loading={releaseLoading}
                    onClick={() => loadReleaseCandidates(true)}
                  >
                    重新读取仓库
                  </Button>
                  {selectedRelease ? (
                    <Button
                      type="link"
                      size="small"
                      href={selectedRelease.releaseUrl}
                      target="_blank"
                      rel="noreferrer"
                      icon={<RiExternalLinkLine size={14} />}
                    >
                      查看所选 Release
                    </Button>
                  ) : null}
                </Space>
              ),
            },
          },
          {
            title: "版本号",
            dataIndex: "version",
            valueType: "text",
            fieldProps: { disabled: true },
            formItemProps: {
              rules: [{ required: true, message: "请先选择 GitHub Release" }],
            },
          },
          {
            title: "更新标题",
            dataIndex: "announcementTitle",
            valueType: "text",
            formItemProps: {
              rules: [{ required: true, message: "更新标题不能为空" }],
            },
          },
          commonContentColumn,
          {
            title: "确认部署",
            dataIndex: "deploymentConfirmed",
            valueType: "switch",
            fieldProps: {
              checkedChildren: "已部署",
              unCheckedChildren: "未确认",
            },
            formItemProps: {
              extra: `发布后，${releaseMeta[platform].label} 会立即将该 Release 识别为最新版本。`,
              rules: [
                {
                  validator: async (_: unknown, value: boolean) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("请先确认对应构建已经部署")),
                },
              ],
            },
          },
        ]
      : [
          {
            title: "版本号",
            dataIndex: "version",
            valueType: "text",
            formItemProps: {
              rules: [{ required: true, message: "版本号不能为空" }],
            },
          },
          {
            title: "更新方式",
            dataIndex: "updateType",
            valueType: "select",
            valueEnum: updateTypeDicMap,
            formItemProps: {
              rules: [{ required: true, message: "请选择更新方式" }],
            },
          },
          {
            title: "安装包",
            dataIndex: "source",
            valueType: "upload",
            fieldProps: {
              maxCount: 1,
              dir: "version",
              accept: platform ? platformAcceptDicMap[platform] : undefined,
            },
            formItemProps: {
              rules: [{ required: true, message: "请上传安装包" }],
            },
          },
          commonContentColumn,
          {
            title: "发布时间",
            dataIndex: "releaseTime",
            valueType: "dateTime",
          },
        ]),
  ];

  return (
    <FullPageContainer title={id ? "编辑版本" : "新增版本"}>
      <div className="mx-auto max-w-4xl py-8">
        {id && legacyPlatforms.length > 1 ? (
          <Alert
            className="mb-6"
            type="warning"
            showIcon
            message="这是一条历史多平台记录"
            description="请选择本次要保留的平台；保存后，该版本会转换为单平台记录。"
          />
        ) : null}
        <BetaSchemaForm
          {...baseFormItemLayout}
          formRef={ref}
          initialValues={{ deploymentConfirmed: false }}
          submitter={{
            searchConfig: {
              submitText: id ? "保存" : "发布版本",
            },
            render(_, dom) {
              return (
                <div className="flex items-center justify-center gap-2">
                  {...dom}
                </div>
              );
            },
          }}
          onFinish={async (values: any) => {
            try {
              if (isReleaseComponent(values.platform)) {
                const result: any = await publishReleasePublication({
                  component: values.platform,
                  githubReleaseId: values.githubReleaseId,
                  announcementTitle: values.announcementTitle.trim(),
                  announcementContent: toMarkdown(values.content).trim(),
                  deploymentConfirmed: true,
                });
                message.success(
                  result?.created === false ? "该版本已经发布" : "发布成功",
                );
              } else {
                const payload = {
                  version: values.version,
                  platforms: [
                    {
                      platform: values.platform,
                      updateType: values.updateType,
                      source: values.source,
                    },
                  ],
                  content: JSON.stringify(values.content),
                  releaseTime: values.releaseTime,
                };
                if (id) {
                  await putVersion(id, payload);
                } else {
                  await postVersion(payload);
                }
                message.success(id ? "修改成功" : "发布成功");
              }
              ref.current?.resetFields();
              navigate(-1);
              return true;
            } catch {
              return false;
            }
          }}
          columns={columns}
        />
      </div>
    </FullPageContainer>
  );
};

export default VersionHandle;
