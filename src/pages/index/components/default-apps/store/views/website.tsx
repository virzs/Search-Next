import { useRequest } from "ahooks";
import { useState, useMemo } from "react";
import { Card, Empty, Image, Pagination } from "antd";
import { getTabsWebsitePublic } from "@/services/website";

interface WebsiteViewProps {
  onAddWebsite?: (site: any) => void;
}

const WebsiteView: React.FC<WebsiteViewProps> = ({ onAddWebsite }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, loading, run } = useRequest(getTabsWebsitePublic, {
    defaultParams: [
      {
        page,
        pageSize,
      },
    ],
  });

  const items = useMemo(() => (data?.data as any[]) || [], [data]);
  const total = useMemo(() => (data as any)?.total ?? (data as any)?.count ?? 0, [data]);

  return (
    <div className="h-full max-h-[60vh] flex flex-col">
      <div className="grid gap-3 grid-cols-3 overflow-y-auto flex-1">
        {items.map((item: any) => (
          <Card key={item._id ?? item.id ?? item.name} hoverable onClick={() => onAddWebsite?.(item)}>
            <div className="flex items-center gap-2">
              <div className="shrink-0">
                <Image className="w-10! h-10!" src={item.icon?.url} preview={false} />
              </div>
              <span className="line-clamp-1">{item.name}</span>
            </div>
          </Card>
        ))}
        {items.length === 0 && <Empty description="暂无数据" />}
      </div>

      <div className="flex items-center justify-end py-4 shrink-0">
        <Pagination
          size="small"
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={[10, 20, 40, 80]}
          onChange={(p, ps) => {
            setPage(p);
            if (ps !== pageSize) setPageSize(ps);
            run({
              page: p,
              pageSize: ps,
            });
          }}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default WebsiteView;
