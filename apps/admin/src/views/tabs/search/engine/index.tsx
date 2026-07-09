import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  delSearchEngine,
  exportSearchEngine,
  getSearchEngine,
  importSearchEngine,
  toggleSearchEngineEnable,
} from "@/services/tabs/search_engine";
import { Button, message, Space } from "antd";
import { useRequest } from "ahooks";
import { RiAddLine, RiDownloadLine, RiUploadLine } from "@remixicon/react";
import { useNavigate } from "react-router";
import { TabsPaths } from "../../router";
import { css, cx } from "@emotion/css";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useRef } from "react";
import {
  downloadJsonFile,
  readJsonFile,
  showImportResult,
} from "@/utils/json-transfer";

const SearchEngine = () => {
  const table = useTablePage(getSearchEngine);
  const navigate = useNavigate();
  const importInputRef = useRef<HTMLInputElement>(null);

  const { refresh } = table;

  const { runAsync: toggleRun, loading: toggleLoading } = useRequest(
    toggleSearchEngineEnable,
    {
      manual: true,
      onSuccess: () => {
        message.success("操作成功");
        refresh();
      },
    },
  );

  const { runAsync: delRun, loading: delLoading } = useRequest(
    delSearchEngine,
    {
      manual: true,
      onSuccess: () => {
        message.success("删除成功");
        refresh();
      },
    },
  );

  const { runAsync: exportRun, loading: exportLoading } = useRequest(
    async () => {
      const data = await exportSearchEngine();
      downloadJsonFile(
        `search-engine-${new Date().toISOString().slice(0, 10)}.json`,
        data,
      );
    },
    {
      manual: true,
      onSuccess: () => {
        message.success("导出成功");
      },
    },
  );

  const { runAsync: importRun, loading: importLoading } = useRequest(
    async (file: File) => {
      const data = await readJsonFile(file);
      return importSearchEngine(data);
    },
    {
      manual: true,
      onSuccess: (result) => {
        message.success("导入完成");
        showImportResult("搜索引擎导入结果", result);
        refresh();
      },
      onError: (error) => {
        message.error(error.message || "导入失败");
      },
    },
  );

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "名称",
      dataIndex: "name",
      render: (text, r: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {r?.icon ? (
            <span
              className={cx(
                "inline-block w-4 h-4",
                css`
                  svg {
                    width: 100%;
                    height: 100%;
                  }
                `,
              )}
              dangerouslySetInnerHTML={{ __html: r.icon }}
            />
          ) : null}
          <span>{text ?? "-"}</span>
        </div>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "搜索URL",
      dataIndex: "searchUrl",
    },
    {
      title: "是否启用",
      dataIndex: "isEnabled",
      render: (text) => (text ? "是" : "否"),
    },
    {
      title: "创建人",
      dataIndex: "creator",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
    },
    {
      title: "修改人",
      dataIndex: "updater",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
    },
    {
      title: "操作",
      dataIndex: "operation",
      fixed: "right",
      width: 160,
      render: (_, record: any) => {
        return (
          <Operation
            columns={[
              {
                title: record.isEnabled ? "禁用" : "启用",
                loading: toggleLoading,
                onClick: async () => {
                  await toggleRun(record._id);
                },
              },
              {
                title: "修改",
                onClick: () => {
                  navigate(TabsPaths.searchEngineHandle + "/" + record._id);
                },
              },
              {
                title: "删除",
                danger: true,
                confirm: "delete",
                loading: delLoading,
                onClick: async () => {
                  await delRun(record._id);
                },
              },
            ]}
          />
        );
      },
    },
  ];
  return (
    <TablePageContainer>
      <TablePage
        columns={columns}
        table={table}
        button={
          <Space>
            <Button
              key="add"
              type="primary"
              icon={<RiAddLine size={20} />}
              onClick={() => navigate(TabsPaths.searchEngineHandle)}
            >
              新增
            </Button>
            <input
              ref={importInputRef}
              className="hidden"
              type="file"
              accept=".json,application/json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                try {
                  await importRun(file);
                } catch {
                  // useRequest already shows the import error message.
                }
              }}
            />
            <Button
              icon={<RiUploadLine size={16} />}
              loading={importLoading}
              onClick={() => importInputRef.current?.click()}
            >
              导入
            </Button>
            <Button
              icon={<RiDownloadLine size={16} />}
              loading={exportLoading}
              onClick={() => exportRun()}
            >
              导出
            </Button>
          </Space>
        }
      />
    </TablePageContainer>
  );
};

export default SearchEngine;
