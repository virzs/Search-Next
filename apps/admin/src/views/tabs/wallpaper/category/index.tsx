import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  createDesktopWallpaperCategory,
  deleteDesktopWallpaperCategory,
  getDesktopWallpaperCategories,
  getDesktopWallpaperCategoryDetail,
  toggleDesktopWallpaperCategory,
  updateDesktopWallpaperCategory,
} from "@/services/tabs/desktop/wallpaper";
import { baseFormItemLayout } from "@/utils/utils";
import {
  ModalForm,
  ProFormDigit,
  ProFormInstance,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { App, Button } from "antd";
import { useRequest } from "ahooks";
import { RiAddLine } from "@remixicon/react";
import { FC, useEffect, useRef, useState } from "react";
import TablePageContainer from "@/components/containter/table";

export interface WallpaperCategoryHandleProps {
  onFinished?: () => void;
  open?: boolean;
  editId?: string;
  onClose?: () => void;
}

const WallpaperCategoryHandle: FC<WallpaperCategoryHandleProps> = (props) => {
  const { onFinished, open, editId, onClose } = props;
  const { message } = App.useApp();
  const ref = useRef<ProFormInstance<any>>(null);

  const { data, run } = useRequest(getDesktopWallpaperCategoryDetail, {
    manual: true,
  });

  useEffect(() => {
    if (editId) {
      run(editId);
    }
  }, [editId]);

  useEffect(() => {
    if (data) {
      ref.current?.setFieldsValue({
        name: (data as any)?.name,
        description: (data as any)?.description,
        isActive: (data as any)?.isActive,
        sortOrder: (data as any)?.sortOrder,
      });
    }
  }, [data]);

  return (
    <ModalForm
      {...baseFormItemLayout}
      open={open}
      formRef={ref}
      title={editId ? "编辑分类" : "新增分类"}
      onOpenChange={(visible) => {
        if (!visible) {
          onClose?.();
        }
        ref.current?.resetFields();
      }}
      onFinish={(values) => {
        return new Promise((resolve) => {
          const payload = values as any;
          (editId
            ? updateDesktopWallpaperCategory(editId, payload)
            : createDesktopWallpaperCategory(payload)
          )
            .then(() => {
              message.success(editId ? "修改成功" : "新增成功");
              onFinished?.();
              resolve(true);
              ref.current?.resetFields();
            })
            .catch(() => {
              resolve(false);
            });
        });
      }}
      modalProps={{ destroyOnClose: true }}
    >
      <ProFormText
        name="name"
        label="名称"
        rules={[{ required: true, message: "请输入名称" }]}
      />
      <ProFormTextArea name="description" label="描述" />
      <ProFormDigit name="sortOrder" label="排序" fieldProps={{ min: 0 }} />
      <ProFormSwitch name="isActive" label="是否启用" initialValue={true} />
    </ModalForm>
  );
};

const WallpaperCategoryIndex = () => {
  const { message } = App.useApp();
  const table = useTablePage(getDesktopWallpaperCategories);
  const { refresh } = table;

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryEditId, setCategoryEditId] = useState<string | undefined>(
    undefined,
  );

  const { runAsync: toggleRun, loading: toggleLoading } = useRequest(
    toggleDesktopWallpaperCategory,
    {
      manual: true,
      onSuccess: () => {
        message.success("操作成功");
        refresh();
      },
    },
  );

  const { runAsync: deleteRun, loading: deleteLoading } = useRequest(
    deleteDesktopWallpaperCategory,
    {
      manual: true,
      onSuccess: () => {
        message.success("删除成功");
        refresh();
      },
    },
  );

  const columns: WindowTableColumnType<any>[] = [
    { title: "名称", dataIndex: "name" },
    { title: "描述", dataIndex: "description" },
    { title: "排序", dataIndex: "sortOrder", width: 80 },
    {
      title: "是否启用",
      dataIndex: "isActive",
      width: 90,
      render: (v) => (v ? "是" : "否"),
    },
    {
      title: "创建人",
      dataIndex: "creator",
      render: (u: any) =>
        typeof u === "string" ? u : (u?.username ?? u?.name ?? "-"),
    },
    { title: "创建时间", dataIndex: "createdAt" },
    {
      title: "更新人",
      dataIndex: "updater",
      render: (u: any) =>
        typeof u === "string" ? u : (u?.username ?? u?.name ?? "-"),
    },
    { title: "更新时间", dataIndex: "updatedAt" },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 170,
      render: (_, record: any) => {
        return (
          <Operation
            columns={[
              {
                title: record.isActive ? "禁用" : "启用",
                loading: toggleLoading,
                onClick: async () => {
                  await toggleRun(record._id);
                },
              },
              {
                title: "修改",
                onClick: () => {
                  setCategoryOpen(true);
                  setCategoryEditId(record._id);
                },
              },
              {
                title: "删除",
                danger: true,
                confirm: "delete",
                loading: deleteLoading,
                onClick: async () => {
                  await deleteRun(record._id);
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
        table={table}
        columns={columns}
        rowKey="_id"
        showSearch
        searchPlaceholder="搜索分类名称/描述"
        button={
          <>
            <Button
              type="primary"
              icon={<RiAddLine size={20} />}
              onClick={() => {
                setCategoryOpen(true);
                setCategoryEditId(undefined);
              }}
            >
              新增分类
            </Button>
            <WallpaperCategoryHandle
              open={categoryOpen}
              editId={categoryEditId}
              onFinished={() => {
                refresh();
                setCategoryOpen(false);
                setCategoryEditId(undefined);
              }}
              onClose={() => {
                setCategoryOpen(false);
                setCategoryEditId(undefined);
              }}
            />
          </>
        }
      />
    </TablePageContainer>
  );
};

export default WallpaperCategoryIndex;
