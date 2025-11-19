import { useRequest } from "ahooks";
import { useState, useMemo } from "react";
import { Card, Empty, Image, Pagination, Button, Modal, Form, Input } from "antd";
import { getTabsWebsitePublic } from "@/services/website";

interface WebsiteViewProps {
  onAddWebsite?: (site: any) => void;
}

const WebsiteView: React.FC<WebsiteViewProps> = ({ onAddWebsite }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [addVisible, setAddVisible] = useState(false);
  const [form] = Form.useForm();

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
      <div className="flex items-center justify-end py-2 shrink-0">
        <Button type="primary" onClick={() => setAddVisible(true)}>
          新增网站
        </Button>
      </div>
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
      <Modal zIndex={2001}
        open={addVisible}
        title="新增网站"
        onCancel={() => setAddVisible(false)}
        onOk={() => form.submit()}
        okText="添加"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const site = {
              name: values.name,
              url: values.url,
              icon: values.iconUrl ? { url: values.iconUrl } : undefined,
            };
            onAddWebsite?.(site);
            setAddVisible(false);
            form.resetFields();
          }}
        >
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="例如：我的常用站点" />
          </Form.Item>
          <Form.Item name="url" label="网址" rules={[{ required: true, type: "url" }]}>
            <Input placeholder="例如：https://example.com" />
          </Form.Item>
          <Form.Item name="iconUrl" label="图标URL" rules={[{ type: "url" }]}>
            <Input placeholder="例如：https://example.com/icon.png" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WebsiteView;
