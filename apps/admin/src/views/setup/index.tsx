import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Button,
  Collapse,
  Form,
  Input,
  InputNumber,
  Result,
  Segmented,
  Spin,
  Steps,
  Typography,
  message,
} from "antd";
import { useRequest } from "ahooks";
import {
  RiCheckboxCircleLine,
  RiArrowLeftLine,
  RiFolderOpenLine,
  RiLoginCircleLine,
  RiRefreshLine,
  RiRestartLine,
  RiShieldUserLine,
} from "@remixicon/react";
import { AuthPaths } from "@/views/auth/router";
import {
  getSetupStatus,
  getSetupStatusSilently,
  postSetupAdminComplete,
  postSetupCheckMongo,
  postSetupCheckRedis,
  postSetupEnvironmentComplete,
  SetupAdminCompleteRequest,
  SetupEnvironmentCompleteRequest,
  SetupSingleCheckResult,
  SetupStatus,
} from "@/services/setup";

type SetupStage = SetupStatus["stage"];
type EnvironmentFormValues = SetupEnvironmentCompleteRequest;
type AdminFormValues = SetupAdminCompleteRequest;

const defaultEnvironmentValues: EnvironmentFormValues = {
  api: {
    port: 5151,
  },
  mongo: {
    host: "127.0.0.1",
    port: 27017,
    database: "search_next",
    username: "",
    password: "",
    authSource: "",
  },
  redis: {
    host: "127.0.0.1",
    port: 6379,
    password: "",
    db: 0,
    ttl: 60,
  },
  storage: {
    service: "local",
    localPath: "./assets/uploads",
    r2: {
      accessKey: "",
      secretKey: "",
      bucket: "",
      accountId: "",
      customDomain: "",
    },
  },
};

const defaultAdminValues: AdminFormValues = {
  admin: {
    username: "admin",
    email: "",
    password: "",
    confirmPassword: "",
  },
};

const mongoFieldNames = [
  ["mongo", "host"],
  ["mongo", "port"],
  ["mongo", "database"],
  ["mongo", "username"],
  ["mongo", "password"],
  ["mongo", "authSource"],
];

const redisFieldNames = [
  ["redis", "host"],
  ["redis", "port"],
  ["redis", "password"],
  ["redis", "db"],
  ["redis", "ttl"],
];

const runtimeStepItems = [
  { title: "MongoDB" },
  { title: "Redis" },
  { title: "存储" },
];

const surfaceStyle = {
  background: "rgba(255, 255, 255, 0.92)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  boxShadow: "0 18px 60px rgba(15, 23, 42, 0.10)",
  backdropFilter: "blur(18px)",
  borderRadius: 8,
} as const;

const inputStyle = { borderRadius: 8 } as const;

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <div className="mb-4 mt-7 first:mt-0">
    <Typography.Title
      level={5}
      className="!mb-1 !text-[15px] !font-semibold !text-slate-950"
    >
      {title}
    </Typography.Title>
    {description ? (
      <Typography.Text className="!text-[13px] !text-slate-500">
        {description}
      </Typography.Text>
    ) : null}
  </div>
);

const SetupView = () => {
  const [environmentForm] = Form.useForm<EnvironmentFormValues>();
  const [adminForm] = Form.useForm<AdminFormValues>();
  const storageService =
    Form.useWatch(["storage", "service"], environmentForm) ?? "local";
  const navigate = useNavigate();
  const pollTimerRef = useRef<number>();
  const localDirectoryInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<SetupStage>("environment");
  const [runtimeStep, setRuntimeStep] = useState(0);
  const [mongoCheckResult, setMongoCheckResult] =
    useState<SetupSingleCheckResult>();
  const [redisCheckResult, setRedisCheckResult] =
    useState<SetupSingleCheckResult>();
  const [restarting, setRestarting] = useState(false);
  const [finished, setFinished] = useState(false);

  const applyStatus = useCallback(
    (data: SetupStatus) => {
      if (data.initialized || data.stage === "done") {
        navigate(AuthPaths.login, { replace: true });
        return;
      }
      setStage(data.stage);
    },
    [navigate],
  );

  const { loading: statusLoading } = useRequest(getSetupStatus, {
    onSuccess: applyStatus,
  });

  const { loading: checkingMongo, runAsync: runCheckMongo } = useRequest(
    postSetupCheckMongo,
    {
      manual: true,
    },
  );

  const { loading: checkingRedis, runAsync: runCheckRedis } = useRequest(
    postSetupCheckRedis,
    {
      manual: true,
    },
  );

  const { loading: savingEnvironment, runAsync: runEnvironmentComplete } =
    useRequest(postSetupEnvironmentComplete, {
      manual: true,
    });

  const { loading: creatingAdmin, runAsync: runAdminComplete } = useRequest(
    postSetupAdminComplete,
    {
      manual: true,
    },
  );

  const mongoCheckPassed = useMemo(() => {
    return mongoCheckResult?.ok;
  }, [mongoCheckResult]);

  const redisCheckPassed = useMemo(() => {
    return redisCheckResult?.ok;
  }, [redisCheckResult]);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = undefined;
    }
  }, []);

  const startRestartPolling = useCallback(() => {
    clearPollTimer();
    setRestarting(true);

    pollTimerRef.current = window.setInterval(async () => {
      try {
        const nextStatus = await getSetupStatusSilently();
        if (nextStatus.stage === "admin") {
          clearPollTimer();
          setRestarting(false);
          setStage("admin");
          message.success("服务已重启");
        }
        if (nextStatus.stage === "done") {
          clearPollTimer();
          navigate(AuthPaths.login, { replace: true });
        }
      } catch {
        // The API is expected to be briefly unavailable while the process restarts.
      }
    }, 2000);
  }, [clearPollTimer, navigate]);

  useEffect(() => {
    return clearPollTimer;
  }, [clearPollTimer]);

  useEffect(() => {
    if (!finished) return;
    const timer = window.setTimeout(() => {
      navigate(AuthPaths.login, { replace: true });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [finished, navigate]);

  const setLocalPath = useCallback(
    (localPath: string) => {
      const currentStorage = environmentForm.getFieldValue("storage") ?? {};
      environmentForm.setFieldsValue({
        storage: {
          ...currentStorage,
          localPath,
        },
      });
    },
    [environmentForm],
  );

  const chooseLocalDirectory = async () => {
    const directoryPicker = (window as any).showDirectoryPicker as
      | undefined
      | (() => Promise<{ name?: string }>);

    if (directoryPicker) {
      try {
        const directoryHandle = await directoryPicker();
        if (directoryHandle?.name) {
          setLocalPath(`./${directoryHandle.name}`);
          return;
        }
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
      }
    }

    localDirectoryInputRef.current?.click();
  };

  const handleDirectoryInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const relativePath = (file as File & { webkitRelativePath?: string })
      ?.webkitRelativePath;
    const folderName = relativePath?.split("/")?.[0];
    if (folderName) {
      setLocalPath(`./${folderName}`);
    }
    event.target.value = "";
  };

  const handleEnvironmentValuesChange = (
    changedValues: Partial<EnvironmentFormValues>,
  ) => {
    if (changedValues.mongo) {
      setMongoCheckResult(undefined);
    }
    if (changedValues.redis) {
      setRedisCheckResult(undefined);
    }
  };

  const testMongoConnection = async () => {
    const values = await environmentForm.validateFields(mongoFieldNames as any);
    const result = await runCheckMongo(values.mongo);
    setMongoCheckResult(result);
    if (result.ok) {
      message.success("MongoDB 连接测试通过");
      setRuntimeStep(1);
    }
  };

  const testRedisConnection = async () => {
    const values = await environmentForm.validateFields(redisFieldNames as any);
    const result = await runCheckRedis(values.redis);
    setRedisCheckResult(result);
    if (result.ok) {
      message.success("Redis 连接测试通过");
      setRuntimeStep(2);
    }
  };

  const saveEnvironment = async () => {
    if (!mongoCheckPassed) {
      setRuntimeStep(0);
      message.warning("请先通过 MongoDB 连接测试");
      return;
    }
    if (!redisCheckPassed) {
      setRuntimeStep(1);
      message.warning("请先通过 Redis 连接测试");
      return;
    }

    const values = await environmentForm.validateFields();
    await runEnvironmentComplete(values);
    setMongoCheckResult(undefined);
    setRedisCheckResult(undefined);
    startRestartPolling();
  };

  const createAdmin = async () => {
    const values = await adminForm.validateFields();
    await runAdminComplete(values);
    setFinished(true);
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <Spin />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
        <div className="w-full max-w-[560px] px-8 py-7" style={surfaceStyle}>
          <Result
            status="success"
            title="初始化完成"
            subTitle="正在进入登录页。"
            extra={
              <Button
                type="primary"
                icon={<RiLoginCircleLine size={16} />}
                onClick={() => navigate(AuthPaths.login, { replace: true })}
              >
                前往登录
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const renderMongoStep = () => (
    <>
      <SectionTitle title="MongoDB" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Form.Item
          name={["mongo", "host"]}
          label="主机"
          rules={[{ required: true, message: "请输入 MongoDB 主机" }]}
        >
          <Input placeholder="127.0.0.1" style={inputStyle} />
        </Form.Item>
        <Form.Item
          name={["mongo", "port"]}
          label="端口"
          rules={[{ required: true, message: "请输入 MongoDB 端口" }]}
        >
          <InputNumber
            className="w-full"
            min={1}
            max={65535}
            precision={0}
            style={inputStyle}
          />
        </Form.Item>
        <Form.Item
          name={["mongo", "database"]}
          label="数据库"
          rules={[{ required: true, message: "请输入数据库名" }]}
        >
          <Input placeholder="search_next" style={inputStyle} />
        </Form.Item>
      </div>

      <Collapse
        ghost
        className="mb-4 rounded-lg bg-slate-50/70"
        items={[
          {
            key: "mongo",
            label: "MongoDB 账号密码",
            children: (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Form.Item name={["mongo", "username"]} label="用户名">
                  <Input allowClear style={inputStyle} />
                </Form.Item>
                <Form.Item name={["mongo", "password"]} label="密码">
                  <Input.Password allowClear style={inputStyle} />
                </Form.Item>
                <Form.Item name={["mongo", "authSource"]} label="认证库">
                  <Input allowClear placeholder="admin" style={inputStyle} />
                </Form.Item>
              </div>
            ),
          },
        ]}
      />

      {mongoCheckResult ? (
        <Alert
          className="mb-4"
          type={mongoCheckPassed ? "success" : "error"}
          showIcon
          message={
            mongoCheckPassed ? "MongoDB 连接测试通过" : "MongoDB 连接测试未通过"
          }
          description={mongoCheckResult.message}
        />
      ) : null}

      <div className="mt-6 flex justify-end">
        <Button
          type="primary"
          icon={<RiRefreshLine size={16} />}
          loading={checkingMongo}
          onClick={testMongoConnection}
        >
          测试 MongoDB
        </Button>
      </div>
    </>
  );

  const renderRedisStep = () => (
    <>
      <SectionTitle title="Redis" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Form.Item
          name={["redis", "host"]}
          label="主机"
          rules={[{ required: true, message: "请输入 Redis 主机" }]}
        >
          <Input placeholder="127.0.0.1" style={inputStyle} />
        </Form.Item>
        <Form.Item
          name={["redis", "port"]}
          label="端口"
          rules={[{ required: true, message: "请输入 Redis 端口" }]}
        >
          <InputNumber
            className="w-full"
            min={1}
            max={65535}
            precision={0}
            style={inputStyle}
          />
        </Form.Item>
        <Form.Item
          name={["redis", "db"]}
          label="DB"
          rules={[{ required: true, message: "请输入 Redis DB" }]}
        >
          <InputNumber
            className="w-full"
            min={0}
            max={15}
            precision={0}
            style={inputStyle}
          />
        </Form.Item>
      </div>

      <Collapse
        ghost
        className="mb-4 rounded-lg bg-slate-50/70"
        items={[
          {
            key: "redis",
            label: "Redis 高级配置",
            children: (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Form.Item name={["redis", "password"]} label="密码">
                  <Input.Password allowClear style={inputStyle} />
                </Form.Item>
                <Form.Item name={["redis", "ttl"]} label="缓存 TTL">
                  <InputNumber
                    className="w-full"
                    min={1}
                    precision={0}
                    style={inputStyle}
                  />
                </Form.Item>
              </div>
            ),
          },
        ]}
      />

      {redisCheckResult ? (
        <Alert
          className="mb-4"
          type={redisCheckPassed ? "success" : "error"}
          showIcon
          message={
            redisCheckPassed ? "Redis 连接测试通过" : "Redis 连接测试未通过"
          }
          description={redisCheckResult.message}
        />
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          icon={<RiArrowLeftLine size={16} />}
          onClick={() => setRuntimeStep(0)}
        >
          上一步
        </Button>
        <Button
          type="primary"
          icon={<RiRefreshLine size={16} />}
          loading={checkingRedis}
          onClick={testRedisConnection}
        >
          测试 Redis
        </Button>
      </div>
    </>
  );

  const renderStorageStep = () => {
    const directoryInputProps = {
      type: "file",
      style: { display: "none" },
      ref: localDirectoryInputRef,
      onChange: handleDirectoryInputChange,
      webkitdirectory: "",
      directory: "",
    } as any;

    return (
      <>
        <SectionTitle title="服务" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            name={["api", "port"]}
            label="API 端口"
            rules={[{ required: true, message: "请输入 API 端口" }]}
          >
            <InputNumber
              className="w-full"
              min={1}
              max={65535}
              precision={0}
              style={inputStyle}
            />
          </Form.Item>
        </div>

        <SectionTitle
          title="存储方式"
          description="当前支持本地存储和 Cloudflare R2。"
        />
        <Form.Item name={["storage", "service"]} label="类型">
          <Segmented
            block
            options={[
              { label: "本地存储", value: "local" },
              { label: "Cloudflare R2", value: "r2" },
            ]}
          />
        </Form.Item>

        {storageService === "local" ? (
          <Form.Item label="本地上传目录" required>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Form.Item
                name={["storage", "localPath"]}
                noStyle
                rules={[{ required: true, message: "请选择本地上传目录" }]}
              >
                <Input
                  readOnly
                  placeholder="./assets/uploads"
                  style={inputStyle}
                />
              </Form.Item>
              <Button
                icon={<RiFolderOpenLine size={16} />}
                onClick={chooseLocalDirectory}
              >
                选择文件夹
              </Button>
            </div>
            <input {...directoryInputProps} />
          </Form.Item>
        ) : (
          <>
            <Alert
              className="mb-4"
              type="info"
              showIcon
              message="Cloudflare R2 配置指引"
              description="在 Cloudflare R2 中创建 Bucket，再创建 R2 API Token；Account ID 可在 R2 概览页查看。自定义域名可留空，绑定后填写域名即可。"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                name={["storage", "r2", "accountId"]}
                label="Account ID"
                rules={[{ required: true, message: "请输入 Account ID" }]}
              >
                <Input style={inputStyle} />
              </Form.Item>
              <Form.Item
                name={["storage", "r2", "bucket"]}
                label="Bucket"
                rules={[{ required: true, message: "请输入 Bucket" }]}
              >
                <Input style={inputStyle} />
              </Form.Item>
              <Form.Item
                name={["storage", "r2", "accessKey"]}
                label="Access Key ID"
                rules={[{ required: true, message: "请输入 Access Key ID" }]}
              >
                <Input style={inputStyle} />
              </Form.Item>
              <Form.Item
                name={["storage", "r2", "secretKey"]}
                label="Secret Access Key"
                rules={[
                  { required: true, message: "请输入 Secret Access Key" },
                ]}
              >
                <Input.Password style={inputStyle} />
              </Form.Item>
              <Form.Item
                name={["storage", "r2", "customDomain"]}
                label="自定义域名"
                className="md:col-span-2"
              >
                <Input placeholder="cdn.example.com" style={inputStyle} />
              </Form.Item>
            </div>
          </>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            icon={<RiArrowLeftLine size={16} />}
            onClick={() => setRuntimeStep(1)}
          >
            上一步
          </Button>
          <Button
            type="primary"
            icon={<RiRestartLine size={16} />}
            loading={savingEnvironment}
            onClick={saveEnvironment}
          >
            写入配置并重启
          </Button>
        </div>
      </>
    );
  };

  const renderRuntimeStep = () => {
    if (runtimeStep === 0) return renderMongoStep();
    if (runtimeStep === 1) return renderRedisStep();
    return renderStorageStep();
  };

  const renderEnvironmentForm = () => (
    <Form<EnvironmentFormValues>
      form={environmentForm}
      layout="vertical"
      initialValues={defaultEnvironmentValues}
      requiredMark={false}
      onValuesChange={handleEnvironmentValuesChange}
    >
      <Steps
        className="mb-7"
        current={runtimeStep}
        items={runtimeStepItems}
        responsive={false}
        size="small"
      />
      {renderRuntimeStep()}
    </Form>
  );

  const renderAdminForm = () => (
    <Form<AdminFormValues>
      form={adminForm}
      layout="vertical"
      initialValues={defaultAdminValues}
      requiredMark={false}
    >
      <SectionTitle
        title="初始管理员"
        description="创建完成后，引导入口将关闭。"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Item
          name={["admin", "username"]}
          label="用户名"
          rules={[{ required: true, message: "请输入管理员用户名" }]}
        >
          <Input style={inputStyle} />
        </Form.Item>
        <Form.Item
          name={["admin", "email"]}
          label="邮箱"
          rules={[
            { required: true, message: "请输入管理员邮箱" },
            { type: "email", message: "邮箱格式不正确" },
          ]}
        >
          <Input style={inputStyle} />
        </Form.Item>
        <Form.Item
          name={["admin", "password"]}
          label="密码"
          rules={[
            { required: true, message: "请输入管理员密码" },
            { min: 6, max: 20, message: "密码长度需要 6-20 位" },
          ]}
        >
          <Input.Password style={inputStyle} />
        </Form.Item>
        <Form.Item
          name={["admin", "confirmPassword"]}
          label="确认密码"
          dependencies={[["admin", "password"]]}
          rules={[
            { required: true, message: "请再次输入管理员密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue(["admin", "password"]) === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input.Password style={inputStyle} />
        </Form.Item>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="primary"
          icon={<RiCheckboxCircleLine size={16} />}
          loading={creatingAdmin}
          onClick={createAdmin}
        >
          创建管理员
        </Button>
      </div>
    </Form>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-4 py-8 text-slate-950">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="mb-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            <RiShieldUserLine size={16} />
            <span>Search Next 首次部署</span>
          </div>
          <Typography.Title
            level={2}
            className="!mb-0 !text-[28px] !font-semibold !leading-tight !text-slate-950"
          >
            {stage === "admin" ? "创建初始管理员" : "配置运行环境"}
          </Typography.Title>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6" style={surfaceStyle}>
          {restarting ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center">
              <Spin size="large" />
              <div>
                <Typography.Title level={4} className="!mb-1 !font-semibold">
                  正在重启服务
                </Typography.Title>
                <Typography.Text type="secondary">
                  恢复后将继续创建初始管理员。
                </Typography.Text>
              </div>
            </div>
          ) : stage === "admin" ? (
            renderAdminForm()
          ) : (
            renderEnvironmentForm()
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupView;
