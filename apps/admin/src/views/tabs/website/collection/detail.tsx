import FullPageContainer from "@/components/containter/full";
import { getWebsiteCollectionDetail, previewWebsiteCollectionDynamic } from "@/services/tabs/website_collection";
import { App, Button, Descriptions, Table } from "antd";
import { useRequest } from "ahooks";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import { TabsPaths } from "../../router";

const WebsiteCollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data, loading, run } = useRequest(getWebsiteCollectionDetail, {
    manual: true,
    onError: () => {
      message.error("获取详情失败");
    },
  });

  const { data: dynamicWebsitesData, loading: dynamicWebsitesLoading, run: runDynamicWebsites } = useRequest(previewWebsiteCollectionDynamic, {
    manual: true,
    onError: () => {
      message.error("获取动态规则匹配网站失败");
    },
  });

  useEffect(() => {
    if (id) run(id);
  }, [id]);

  useEffect(() => {
    const type = (data as any)?.type;
    const dynamic = (data as any)?.dynamic;
    if (type !== "dynamic") return;
    if (!dynamic) return;
    runDynamicWebsites({ dynamic } as any);
  }, [data]);

  const websites = useMemo(() => {
    const arr = (data as any)?.websites ?? [];
    return Array.isArray(arr) ? arr : [];
  }, [data]);

  const dynamicWebsites = useMemo(() => {
    const arr = (dynamicWebsitesData as any) ?? [];
    return Array.isArray(arr) ? arr : [];
  }, [dynamicWebsitesData]);

  const title = (data as any)?.title ?? "合集详情";
  const type = (data as any)?.type as any;
  const websiteList = type === "dynamic" ? dynamicWebsites : websites;
  const websiteListLoading = type === "dynamic" ? dynamicWebsitesLoading : false;
  const websiteListTitle = type === "dynamic" ? `动态匹配网站（${websiteList.length}）` : `绑定网站（${websiteList.length}）`;

  return (
    <FullPageContainer
      loading={loading}
      title={title}
      cardProps={{
        extra: (
          <Button
            type="primary"
            onClick={() => {
              if (!id) return;
              navigate(`${TabsPaths.websiteCollectionHandle}/${id}`);
            }}
          >
            编辑
          </Button>
        ),
      }}
    >
      <div className="max-w-5xl mx-auto py-2">
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="名称">{(data as any)?.title ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="短标题">{(data as any)?.kicker ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="简介">{(data as any)?.description ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="推荐大卡">{(data as any)?.featured ? "是" : "否"}</Descriptions.Item>
          <Descriptions.Item label="展示样式">{(data as any)?.layout ?? "story"}</Descriptions.Item>
          <Descriptions.Item label="预览数量">{(data as any)?.itemLimit ?? 8}</Descriptions.Item>
          <Descriptions.Item label="是否启用">{(data as any)?.enable ? "是" : "否"}</Descriptions.Item>
          <Descriptions.Item label="排序">{(data as any)?.sort ?? 0}</Descriptions.Item>
          <Descriptions.Item label="生效开始">
            {(data as any)?.effectiveStart ? dayjs((data as any).effectiveStart).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="生效结束">
            {(data as any)?.effectiveEnd ? dayjs((data as any).effectiveEnd).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {(data as any)?.createdAt ? dayjs((data as any).createdAt).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {(data as any)?.updatedAt ? dayjs((data as any).updatedAt).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-6">
          <div className="text-sm font-medium mb-3">{websiteListTitle}</div>
          <Table
            rowKey={(r: any) => r?._id ?? r?.id ?? r?.url ?? JSON.stringify(r)}
            loading={websiteListLoading}
            dataSource={websiteList}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            columns={[
              { title: "名称", dataIndex: "name", render: (v: any) => v ?? "-" },
              { title: "URL", dataIndex: "url", render: (v: any) => v ?? "-" },
              {
                title: "是否启用",
                dataIndex: "enable",
                width: 100,
                render: (v: any) => (v === undefined ? "-" : v ? "是" : "否"),
              },
              {
                title: "是否公开",
                dataIndex: "public",
                width: 100,
                render: (v: any) => (v === undefined ? "-" : v ? "是" : "否"),
              },
              { title: "点击量", dataIndex: "click", width: 90, render: (v: any) => v ?? 0 },
            ]}
          />
        </div>
      </div>
    </FullPageContainer>
  );
};

export default WebsiteCollectionDetail;
