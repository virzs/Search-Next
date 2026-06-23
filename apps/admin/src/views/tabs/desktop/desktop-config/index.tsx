import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { App, Button } from "antd";
import { useNavigate } from "react-router";
import { RiAddLine } from "@remixicon/react";
import { TabsPaths } from "../../router";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  deleteDesktopAdminConfig,
  getDesktopAdminConfig,
  putDesktopAdminConfigActive,
} from "@/services/tabs/desktop/desktop-config";
import { useRequest } from "ahooks";

const Desktop = () => {
  const navigate = useNavigate();
  const table = useTablePage(getDesktopAdminConfig);

  const { refresh } = table;

  const { message } = App.useApp();

  const { runAsync: enableRun } = useRequest(putDesktopAdminConfigActive, {
    manual: true,
    onSuccess: () => {
      message.success("操作成功");
      refresh();
    },
  });

  const { runAsync: deleteRun } = useRequest(deleteDesktopAdminConfig, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  return (
    <TablePageContainer>
      <TablePage
        table={table}
        columns={[
          {
            title: "名称",
            dataIndex: "name",
          },
          {
            title: "描述",
            dataIndex: "description",
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
            title: "更新人",
            dataIndex: "updater",
          },
          {
            title: "更新时间",
            dataIndex: "updatedAt",
          },
          {
            title: "是否启用",
            dataIndex: "isActive",
            render: (_, v) => {
              return v.isActive ? "是" : "否";
            },
          },
          {
            title: "操作",
            fixed: "right",
            width: 220,
            dataIndex: "action",
            render: (_, { _id, isActive }) => {
              return (
                <Operation
                  columns={[
                    {
                      title: "预览",
                      onClick: () => {
                        navigate(TabsPaths.desktopConfigPreview + `/${_id}`);
                      },
                    },
                    {
                      title: isActive ? "停用" : "启用",
                      confirm: isActive
                        ? {
                            title: "停用",
                            content: "确认停用吗？",
                          }
                        : {
                            title: "启用",
                            content: "启用后，其他配置将被停用，确认继续？",
                          },
                      onClick: () => {
                        return enableRun(_id);
                      },
                    },
                    {
                      title: "修改",
                      onClick: () => {
                        navigate(TabsPaths.desktopConfigHandle + `/${_id}`);
                      },
                    },
                    {
                      title: "删除",
                      confirm: "delete",
                      onClick: () => {
                        deleteRun(_id);
                      },
                    },
                  ]}
                />
              );
            },
          },
        ]}
        button={
          <Button
            type="primary"
            icon={<RiAddLine size={22} />}
            onClick={() => {
              navigate(TabsPaths.desktopConfigHandle);
            }}
          >
            新增
          </Button>
        }
      />
    </TablePageContainer>
  );
};

export default Desktop;
