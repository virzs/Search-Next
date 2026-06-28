import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import { adjustAiBalance, getAiBalanceLogs, getAiBalances } from "@/services/ai/balances";
import { formatDateString } from "@/utils/utils";
import { useRequest } from "ahooks";
import { Form, Input, InputNumber, Modal, Table, Tag, message } from "antd";
import { useState } from "react";

const Balances = () => {
  const table = useTablePage(getAiBalances);
  const { refresh } = table;
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>();
  const [form] = Form.useForm();

  const { runAsync: adjustRun, loading: adjustLoading } = useRequest(
    async (values: any) => adjustAiBalance(currentUser._id, values),
    {
      manual: true,
      onSuccess: () => {
        message.success("调整成功");
        setAdjustOpen(false);
        form.resetFields();
        refresh();
      },
    }
  );

  const { data: logsRes, run: logsRun, loading: logsLoading } = useRequest(
    (userId: string) => getAiBalanceLogs(userId, { page: 1, pageSize: 100 }),
    { manual: true }
  );

  const openAdjust = (record: any) => {
    setCurrentUser(record);
    form.setFieldsValue({ integral: 0, reason: "AI 余额调整" });
    setAdjustOpen(true);
  };

  const openLogs = (record: any) => {
    setCurrentUser(record);
    logsRun(record._id);
    setLogsOpen(true);
  };

  const columns: WindowTableColumnType<any>[] = [
    { title: "用户名", dataIndex: "username" },
    { title: "邮箱", dataIndex: "email" },
    { title: "当前积分", dataIndex: "integral" },
    {
      title: "状态",
      dataIndex: "enable",
      render: (value) => (value ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>),
    },
    { title: "创建时间", dataIndex: "createdAt", render: (value) => formatDateString(value) },
    {
      title: "操作",
      dataIndex: "operation",
      fixed: "right",
      render: (_, record) => (
        <Operation
          columns={[
            { title: "调整余额", onClick: () => openAdjust(record) },
            { title: "查看流水", onClick: () => openLogs(record) },
          ]}
        />
      ),
    },
  ];

  return (
    <TablePageContainer>
      <TablePage table={table} columns={columns} showSearch searchPlaceholder="搜索用户" />
      <Modal
        open={adjustOpen}
        title={`调整余额${currentUser ? `：${currentUser.username}` : ""}`}
        confirmLoading={adjustLoading}
        onCancel={() => setAdjustOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={adjustRun}>
          <Form.Item name="integral" label="调整积分" rules={[{ required: true, message: "请输入调整积分" }]}>
            <InputNumber className="w-full" precision={8} placeholder="正数充值，负数扣减" />
          </Form.Item>
          <Form.Item name="reason" label="原因">
            <Input placeholder="请输入调整原因" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={logsOpen}
        title={`余额流水${currentUser ? `：${currentUser.username}` : ""}`}
        width={720}
        footer={null}
        onCancel={() => setLogsOpen(false)}
        destroyOnHidden
      >
        <Table
          rowKey="_id"
          loading={logsLoading}
          dataSource={logsRes?.data || []}
          pagination={false}
          columns={[
            { title: "时间", dataIndex: "createdAt", render: (value) => formatDateString(value) },
            { title: "积分", dataIndex: "integral" },
            { title: "原因", dataIndex: "reason" },
          ]}
        />
      </Modal>
    </TablePageContainer>
  );
};

export default Balances;
