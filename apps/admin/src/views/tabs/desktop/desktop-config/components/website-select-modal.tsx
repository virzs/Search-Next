import { FC, useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Tree,
  Spin,
  Checkbox,
  Pagination,
  Image,
  Empty,
  Input,
  Button,
} from "antd";
import type { DataNode } from "antd/es/tree";
import { useRequest } from "ahooks";
import {
  getWebsiteClassifyTree,
  type Website,
} from "@/services/tabs/website_classifty";
import { useTablePage } from "@/hooks/useTablePage2";
import { getWebsiteList } from "@/services/tabs/website";

export interface WebsiteSelectModalProps {
  open: boolean;
  value?: Website[];
  title?: string;
  okText?: string;
  onOk: (websites: Website[]) => void | Promise<void>;
  onCancel: () => void;
}

const WebsiteSelectModal: FC<WebsiteSelectModalProps> = (props) => {
  const { open, value, title, okText, onOk, onCancel } = props;

  const { data: classifyTree = [], loading: classifyLoading } = useRequest(
    getWebsiteClassifyTree,
  );

  const [selectedClassifyId, setSelectedClassifyId] = useState<
    string | undefined
  >(undefined);
  const [selectedMap, setSelectedMap] = useState<Map<string, Website>>(
    new Map(),
  );
  const [keyword, setKeyword] = useState("");
  const websiteResourceParams = useMemo(() => ({ enable: true }), []);

  const table = useTablePage<Website>(
    (params) =>
      getWebsiteList({
        ...params,
        ...websiteResourceParams,
      }),
    {
      pathname: "/desktop/website-select-modal",
      defaultParams: {
        page: 1,
        pageSize: 24,
        ...websiteResourceParams,
      },
    },
  );

  const {
    data: rawWebsiteData = [],
    total = 0,
    current,
    setCurrent,
    pageSize,
    setPageSize,
    loading,
  } = table;

  const websiteData = useMemo(
    () => rawWebsiteData.filter((item) => item.enable !== false),
    [rawWebsiteData],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedMap(() => {
      const next = new Map<string, Website>();
      for (const w of value || []) {
        if (w?._id) next.set(w._id, w);
      }
      return next;
    });
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    table.run({
      ...table.params,
      ...websiteResourceParams,
      page: 1,
      search: keyword || undefined,
      classifyIds: selectedClassifyId,
    });
  }, [open]);

  const clearClassify = () => {
    setSelectedClassifyId(undefined);
    table.run({
      ...table.params,
      ...websiteResourceParams,
      page: 1,
      search: keyword || undefined,
      classifyIds: undefined,
    });
  };

  const treeData = useMemo<DataNode[]>(() => {
    // 仅保留分类节点（不在树中显示网站），以便右侧展示网站网格
    const mapNode = (node: any): any => {
      const children = (node.children || []).map(mapNode);
      return {
        ...node,
        websites: undefined,
        children,
        key: node._id,
        title: node.name,
      };
    };

    return (classifyTree || []).map(mapNode) as unknown as DataNode[];
  }, [classifyTree]);

  const onSelectTree = (_: any, info: any) => {
    const node = info.node as any;
    const id = node.key as string | undefined;
    if (id && id === selectedClassifyId) {
      clearClassify();
      return;
    }
    setSelectedClassifyId(id);
    table.run({
      ...table.params,
      ...websiteResourceParams,
      classifyIds: id,
      search: keyword || undefined,
      page: 1,
    });
  };

  const toggleSelect = (record: Website, checked?: boolean) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      const key = record._id;
      if (checked ?? !next.has(key)) {
        next.set(key, record);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const isSelected = (id: string) => selectedMap.has(id);

  const handleOk = async () => {
    const selected = Array.from(selectedMap.values());
    await onOk(selected);
  };

  const handleSearch = (v?: string) => {
    const nextKeyword = (v || "").trim();
    setKeyword(nextKeyword);
    table.run({
      ...table.params,
      ...websiteResourceParams,
      page: 1,
      search: nextKeyword || undefined,
      classifyIds: selectedClassifyId,
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onCancel}
      width={680}
      title={title ?? "选择网站"}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500">
            已选择：{selectedMap.size} 项
          </span>
          <div className="flex items-center gap-2">
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleOk}>
              {okText ?? "确定"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex h-full" style={{ minHeight: 520 }}>
        <div className="w-48 shrink-0 pr-3 border-r">
          <Spin spinning={classifyLoading}>
            {treeData.length ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">分类</div>
                  <Button
                    type="link"
                    size="small"
                    className="px-0!"
                    disabled={!selectedClassifyId}
                    onClick={clearClassify}
                  >
                    清除
                  </Button>
                </div>
                <Tree
                  showLine
                  fieldNames={{ title: "name", key: "_id" }}
                  treeData={treeData}
                  selectedKeys={selectedClassifyId ? [selectedClassifyId] : []}
                  onSelect={onSelectTree}
                />
              </div>
            ) : (
              <Empty description="暂无分类" />
            )}
          </Spin>
        </div>
        <div className="flex-1 pl-3">
          <div className="mb-3">
            <Input.Search
              allowClear
              placeholder="搜索网站名称/网址"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              onClear={() => handleSearch("")}
            />
          </div>
          <Spin className="w-full" spinning={loading}>
            {websiteData.length ? (
              <div className="grid grid-cols-1 gap-2">
                {websiteData.map((item) => {
                  const selected = isSelected(item._id);
                  return (
                    <div key={item._id}>
                      <div
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                          selected ? "border-blue-500" : "border-gray-200"
                        }`}
                        onClick={() => toggleSelect(item)}
                      >
                        {item.iconEdited?.url || item.icon?.url ? (
                          <Image
                            className="!w-9 !h-9 object-contain shrink-0"
                            preview={false}
                            src={item.iconEdited?.url || item.icon?.url}
                          />
                        ) : null}
                        <div className="flex-1 w-0">
                          <div className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.url}
                          </div>
                        </div>
                        <Checkbox
                          checked={selected}
                          onChange={(e) => toggleSelect(item, e.target.checked)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty
                description={selectedClassifyId ? "该分类暂无网站" : "暂无数据"}
              />
            )}
          </Spin>

          <div className="mt-3 flex items-center justify-end">
            <Pagination
              pageSize={pageSize}
              total={total}
              current={current}
              showSizeChanger
              pageSizeOptions={[200, 1000, 3000, 5000, 10000]}
              onChange={(page, size) => {
                if (size !== pageSize) {
                  table.setCurrent(1);
                  setPageSize(size);
                  return;
                }
                setCurrent(page);
              }}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default WebsiteSelectModal;
