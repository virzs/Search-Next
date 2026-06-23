import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  createDesktopThemeCategory,
  deleteDesktopThemeCategory,
  getDesktopThemeCategory,
  getDesktopThemeCategoryDetail,
  toggleDesktopThemeCategory,
  updateDesktopThemeCategory,
} from "@/services/tabs/desktop/theme-config";
import { baseFormItemLayout } from "@/utils/utils";
import { RiAddLine } from "@remixicon/react";
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
import { FC, useEffect, useRef, useState } from "react";

export interface ThemeCategoryHandleProps {
  onFinished?: () => void;
  open?: boolean;
  editId?: string;
  onClose?: () => void;
}

const ThemeCategoryHandle: FC<ThemeCategoryHandleProps> = (props) => {
  const { onFinished, open, editId, onClose } = props;
  const { message } = App.useApp();
  const ref = useRef<ProFormInstance<any>>(null);

  const { data, run } = useRequest(getDesktopThemeCategoryDetail, {
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
            ? updateDesktopThemeCategory(editId, payload)
            : createDesktopThemeCategory(payload)
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
      <ProFormText name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]} />
      <ProFormTextArea name="description" label="描述" />
      <ProFormDigit name="sortOrder" label="排序" fieldProps={{ min: 0 }} />
      <ProFormSwitch name="isActive" label="是否启用" initialValue={true} />
    </ModalForm>
  );
};

const DesktopThemeConfigCategory = () => {
  const { message } = App.useApp();
  const table = useTablePage(getDesktopThemeCategory);

  const { refresh } = table;

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryEditId, setCategoryEditId] = useState<string | undefined>(
    undefined,
  );

  const { runAsync: toggleCategoryRun } = useRequest(toggleDesktopThemeCategory, {
    manual: true,
    onSuccess: () => {
      message.success("操作成功");
      refresh();
    },
  });
  const { runAsync: deleteCategoryRun } = useRequest(deleteDesktopThemeCategory, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const categoryColumns: WindowTableColumnType<any>[] = [
    { title: "名称", dataIndex: "name" },
    { title: "描述", dataIndex: "description" },
    { title: "排序", dataIndex: "sortOrder", width: 80 },
    { title: "创建人", dataIndex: "creator" },
    { title: "创建时间", dataIndex: "createdAt" },
    { title: "更新人", dataIndex: "updater" },
    { title: "更新时间", dataIndex: "updatedAt" },
    {
      title: "是否启用",
      dataIndex: "isActive",
      render: (text) => (text ? "是" : "否"),
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      render: (_, record) => {
        return (
          <Operation
            columns={[
              {
                title: record.isActive ? "禁用" : "启用",
                onClick: async () => {
                  await toggleCategoryRun(record._id);
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
                onClick: async () => {
                  await deleteCategoryRun(record._id);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <TablePage
      table={table}
      columns={categoryColumns}
      rowKey="_id"
      button={
        <>
          <Button
            type="primary"
            icon={<RiAddLine size={16} />}
            onClick={() => {
              setCategoryOpen(true);
              setCategoryEditId(undefined);
            }}
          >
            新增分类
          </Button>
          <ThemeCategoryHandle
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
  );
};

export default DesktopThemeConfigCategory;
