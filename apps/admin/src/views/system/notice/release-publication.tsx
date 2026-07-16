import FullPageContainer from "@/components/containter/full";
import Access from "@/components/Access";
import MEditor from "@/components/pro-form/fields/editor/editor";
import {
  getReleaseCandidates,
  publishReleasePublication,
  type ReleaseCandidate,
  type ReleaseCandidatesResponse,
  type ReleaseComponent,
} from "@/services/system/version";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  Select,
  Space,
  Tag,
  message,
} from "antd";
import { useRequest } from "ahooks";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  RiExternalLinkLine,
  RiRefreshLine,
  RiRocket2Line,
} from "@remixicon/react";
import { SystemPaths } from "../router";
import { routeAuth } from "@/contexts/AccessContext";

interface ReleaseDraft {
  releaseId: number;
  title: string;
  content: string;
  confirmed: boolean;
}

const componentMeta: Record<
  ReleaseComponent,
  { label: string; titlePrefix: string; description: string }
> = {
  web: {
    label: "Web",
    titlePrefix: "Web",
    description: "发布到用户端通知中心，并作为用户端最新版本。",
  },
  admin: {
    label: "Admin",
    titlePrefix: "管理后台",
    description: "发布到后台消息中心，并作为管理后台最新版本。",
  },
};

const formatReleaseTime = (value: string) => {
  try {
    return format(new Date(value), "yyyy-MM-dd HH:mm");
  } catch {
    return value || "-";
  }
};

const buildAnnouncementContent = (release: ReleaseCandidate) => {
  const content = release.announcementContent.trim();
  const source = `[查看 GitHub Release](${release.releaseUrl})`;
  return content ? `${content}\n\n${source}` : source;
};

const ReleaseCard = ({
  component,
  releases,
  onPublished,
}: {
  component: ReleaseComponent;
  releases: ReleaseCandidate[];
  onPublished: () => void;
}) => {
  const navigate = useNavigate();
  const meta = componentMeta[component];
  const [selectedId, setSelectedId] = useState<number>();
  const [draft, setDraft] = useState<ReleaseDraft>();
  const selected = useMemo(
    () => releases.find((item) => item.githubReleaseId === selectedId),
    [releases, selectedId],
  );
  const suggestedId = releases.find((item) => !item.published)?.githubReleaseId;

  const { runAsync: publish, loading: publishing } = useRequest(
    publishReleasePublication,
    { manual: true },
  );

  const generateDraft = () => {
    if (!selected) return;
    setDraft({
      releaseId: selected.githubReleaseId,
      title: `${meta.titlePrefix} ${selected.version} 更新公告`,
      content: buildAnnouncementContent(selected),
      confirmed: false,
    });
  };

  const submit = async () => {
    if (!draft || !selected) return;
    if (!draft.title.trim() || !draft.content.trim()) {
      message.warning("请填写公告标题和内容");
      return;
    }
    if (!draft.confirmed) {
      message.warning("请先确认对应构建已经部署");
      return;
    }

    const result: any = await publish({
      component,
      githubReleaseId: selected.githubReleaseId,
      announcementTitle: draft.title.trim(),
      announcementContent: draft.content.trim(),
      deploymentConfirmed: true,
    });
    message.success(result?.created === false ? "该版本已经发布" : "发布成功");
    setDraft(undefined);
    setSelectedId(undefined);
    onPublished();
  };

  return (
    <Card
      className="h-full"
      title={
        <div>
          <div className="text-base font-semibold">{meta.label} 发布</div>
          <div className="mt-1 text-xs font-normal text-gray-500">
            {meta.description}
          </div>
        </div>
      }
    >
      {releases.length ? (
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-sm font-medium">选择已部署 Release</div>
            <Select
              className="w-full"
              value={selectedId}
              placeholder="请选择对应的 GitHub Release"
              onChange={(value) => {
                setSelectedId(value);
                setDraft(undefined);
              }}
              options={releases.map((release) => ({
                value: release.githubReleaseId,
                label: (
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <span className="min-w-0 truncate">
                      {release.tagName} · {release.releaseName}
                    </span>
                    <span className="shrink-0">
                      {release.published ? (
                        <Tag color="green">已发布</Tag>
                      ) : release.githubReleaseId === suggestedId ? (
                        <Tag color="blue">建议</Tag>
                      ) : null}
                    </span>
                  </div>
                ),
              }))}
            />
          </div>

          {selected ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">
                    {selected.releaseName}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {selected.tagName} ·{" "}
                    {formatReleaseTime(selected.releasePublishedAt)}
                  </div>
                </div>
                <Button
                  type="link"
                  size="small"
                  href={selected.releaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  icon={<RiExternalLinkLine size={14} />}
                >
                  GitHub
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.published ? (
                  <Button
                    onClick={() =>
                      selected.noticeId &&
                      navigate(`${SystemPaths.notice}/${selected.noticeId}`)
                    }
                  >
                    查看公告
                  </Button>
                ) : (
                  <Button type="primary" onClick={generateDraft}>
                    生成公告草稿
                  </Button>
                )}
              </div>
            </div>
          ) : null}

          {draft && selected && !selected.published ? (
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <Alert
                type="warning"
                showIcon
                message="请先完成服务器文件更新，再发布公告"
                description="发布后，对应端会立即把该 Release 视为最新版本并提示已打开的页面刷新。"
              />
              <div>
                <div className="mb-2 text-sm font-medium">公告标题</div>
                <Input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">公告内容</div>
                <MEditor
                  value={draft.content}
                  onChange={(value) =>
                    setDraft({ ...draft, content: String(value || "") })
                  }
                />
              </div>
              <Checkbox
                checked={draft.confirmed}
                onChange={(event) =>
                  setDraft({ ...draft, confirmed: event.target.checked })
                }
              >
                我确认 {meta.label} {selected.tagName} 构建已部署到服务器
              </Checkbox>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setDraft(undefined)}>取消</Button>
                <Access
                  auth={routeAuth(
                    "POST",
                    "/system/version/release-publications",
                  )}
                >
                  <Button
                    type="primary"
                    icon={<RiRocket2Line size={15} />}
                    loading={publishing}
                    disabled={!draft.confirmed}
                    onClick={submit}
                  >
                    发布 {meta.label} 公告
                  </Button>
                </Access>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <Empty description={`仓库中没有可用的 ${meta.label} Release`} />
      )}
    </Card>
  );
};

export interface ReleasePublicationPageProps {
  components: ReleaseComponent[];
  title: string;
  description: string;
}

export const ReleasePublicationPage = ({
  components,
  title,
  description,
}: ReleasePublicationPageProps) => {
  const {
    data,
    loading,
    run: load,
  } = useRequest((refresh = false) => getReleaseCandidates(refresh));

  const candidates = data as ReleaseCandidatesResponse | undefined;

  return (
    <FullPageContainer
      loading={loading && !candidates}
      title={title}
      cardProps={{
        extra: (
          <Button
            icon={<RiRefreshLine size={15} />}
            loading={loading}
            onClick={() => load(true)}
          >
            重新读取仓库
          </Button>
        ),
      }}
    >
      <div className="mx-auto max-w-7xl py-4">
        <div className="mb-4 text-sm text-gray-500">{description}</div>

        {candidates ? (
          <Alert
            className="mb-5"
            type="info"
            showIcon
            message={
              <Space wrap>
                <span>{candidates.repositoryUrl}</span>
                <Button
                  type="link"
                  size="small"
                  href={candidates.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  icon={<RiExternalLinkLine size={13} />}
                >
                  打开仓库
                </Button>
              </Space>
            }
            description={`读取时间：${formatReleaseTime(candidates.fetchedAt)}`}
          />
        ) : null}

        <div
          className={
            components.length > 1 ? "grid gap-5 xl:grid-cols-2" : undefined
          }
        >
          {components.map((component) => (
            <ReleaseCard
              key={component}
              component={component}
              releases={candidates?.[component] || []}
              onPublished={() => load(false)}
            />
          ))}
        </div>
      </div>
    </FullPageContainer>
  );
};
