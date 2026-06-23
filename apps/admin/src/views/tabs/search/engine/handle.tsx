import BasePageContainer from "@/components/containter/base";
import { baseFormItemLayout } from "@/utils/utils";
import { RollbackOutlined, SearchOutlined, ExperimentOutlined } from "@ant-design/icons";
import {
  ProForm,
  ProCard,
  ProFormInstance,
  ProFormText,
  ProFormTextArea,
  ProFormDependency,
} from "@ant-design/pro-components";
import { Button, Input, Space, message, Form, Upload } from "antd";
import { useRequest } from "ahooks";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { addSearchEngine, getSearchEngineDetail, updateSearchEngine } from "@/services/tabs/search_engine";
import { Editor as MonacoEditor } from "@monaco-editor/react";

const JsonpTester: FC<{
  searchUrl?: string;
  suggestUrl?: string;
  jsonpCode?: string;
}> = ({ searchUrl, suggestUrl, jsonpCode }) => {
  const [kw, setKw] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonpResp, setJsonpResp] = useState<any>(null);
  const [processed, setProcessed] = useState<any>(null);
  const jsonpRef = useRef<{ currentCb?: string }>({});

  const canSearch = useMemo(() => !!(searchUrl && searchUrl.includes("{keyword}")), [searchUrl]);
  const canSuggest = useMemo(
    () => !!(suggestUrl && suggestUrl.includes("{keyword}") && suggestUrl.includes("{jsonp}")),
    [suggestUrl]
  );
  const canRunCode = useMemo(() => !!jsonpCode && jsonpCode.trim().length > 0, [jsonpCode]);

  // 调试：观察 jsonpResp 和 processed 的变化
  useEffect(() => {
    if (jsonpResp !== null) {
      console.log("[JSONP] state updated: jsonpResp =", jsonpResp);
    }
  }, [jsonpResp]);
  useEffect(() => {
    if (processed !== null) {
      console.log("[JSONP] state updated: processed =", processed);
    }
  }, [processed]);

  const openSearch = () => {
    if (!canSearch) {
      message.warning("请在 搜索URL 中包含 {keyword} 占位符");
      return;
    }
    const url = searchUrl!.replace("{keyword}", encodeURIComponent(kw || ""));
    window.open(url, "_blank");
  };

  const fetchJsonp = async () => {
    if (!canSuggest) {
      message.warning("请在 建议词 JSONP URL 中包含 {keyword} 和 {jsonp} 占位符");
      return;
    }
    setLoading(true);
    setJsonpResp(null);
    setProcessed(null);
    const cbName = `__jsonp_cb_${Date.now()}`;
    jsonpRef.current.currentCb = cbName;
    const url = suggestUrl!.replace("{keyword}", encodeURIComponent(kw || "")).replace("{jsonp}", cbName);

    console.log("[JSONP] fetch start", { cbName, url });

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      let timer: number | undefined;
      const script = document.createElement("script");
      const cleanup = (reason: string) => {
        if (settled) return;
        settled = true;
        try {
          delete (window as any)[cbName];
          if (script.parentNode) script.parentNode.removeChild(script);
        } catch {}
        if (typeof timer !== "undefined") clearTimeout(timer);
        console.log("[JSONP] cleanup", { cbName, reason });
      };

      (window as any)[cbName] = async (resp: any) => {
        console.log("[JSONP] callback received", { cbName, resp });
        try {
          setJsonpResp(resp);
          if (canRunCode) {
            try {
              await runCode(resp);
            } catch (err) {
              console.error("[JSONP] runCode error", err);
            }
          }
        } finally {
          cleanup("success");
          resolve();
        }
      };

      script.src = url;
      script.async = true;
      script.onerror = () => {
        console.error("[JSONP] load error", { cbName, url });
        message.error("JSONP 加载失败");
        cleanup("error");
        reject(new Error("JSONP 加载失败"));
      };
      document.body.appendChild(script);

      timer = window.setTimeout(() => {
        console.warn("[JSONP] timeout", { cbName, url });
        message.error("JSONP 超时");
        cleanup("timeout");
        reject(new Error("JSONP 超时"));
      }, 10000);
    }).finally(() => setLoading(false));
  };

  const runCode = async (overrideResp?: any) => {
    if (!canRunCode) {
      message.warning("请先填写 JSONP 代码");
      return;
    }

    setLoading(true);
    setProcessed(null);

    try {
      // 以表达式方式求值，支持：
      // 1) 直接返回数组的表达式，如 ["a","b"]
      // 2) 返回函数的表达式，如 (kw)=>[kw]
      // 3) 支持以 (resp)=>[...] 或 (resp, kw)=>[...] 处理 JSONP 原始返回
      const result = new Function(`return (${jsonpCode});`)();

      let out = result;
      if (typeof result === "function") {
        const respForFn = overrideResp !== undefined ? overrideResp : jsonpResp;
        const hasResp = respForFn !== null && respForFn !== undefined;
        console.log("[JSONP] runCode call", { fnLen: result.length, hasResp, kw, respForFn });
        try {
          if (result.length >= 2) {
            // 优先传入原始 JSONP 返回，其次关键字
            out = result(hasResp ? respForFn : null, kw);
          } else if (result.length === 1) {
            // 单参函数：如果已有原始返回，传 resp；否则传 kw
            out = result(hasResp ? respForFn : kw);
          } else {
            out = result();
          }
        } catch (e) {
          out = { error: String(e) };
        }
        if (out && typeof (out as any).then === "function") {
          out = await out;
        }
      }

      setProcessed(out);
    } catch (e: any) {
      message.error("代码执行错误");
      setProcessed({ error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const respText = useMemo(() => (jsonpResp ? JSON.stringify(jsonpResp, null, 2) : "(空)"), [jsonpResp]);
  const processedText = useMemo(() => (processed ? JSON.stringify(processed, null, 2) : "(空)"), [processed]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input placeholder="输入关键字进行测试" value={kw} onChange={(e) => setKw(e.target.value)} allowClear />
        <Space>
          <Button icon={<SearchOutlined />} type="default" onClick={openSearch} disabled={!canSearch}>
            测试搜索
          </Button>
          <Button
            icon={<ExperimentOutlined />}
            loading={loading}
            type="default"
            onClick={fetchJsonp}
            disabled={!canSuggest}
          >
            获取JSONP
          </Button>
        </Space>
      </div>
      <div>
        <div className="mb-2 text-gray-500 text-sm">JSONP 原始返回</div>
        <div className="rounded overflow-hidden border border-gray-200">
          <MonacoEditor
            theme="vs-dark"
            height="220px"
            language="json"
            value={respText}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              automaticLayout: true,
              fontSize: 13,
              lineNumbers: "off",
              wordWrap: "on",
              wrappingIndent: "same",
            }}
          />
        </div>
      </div>
      <div>
        <div className="mb-2 text-gray-500 text-sm">代码处理后返回</div>
        <div className="rounded overflow-hidden border border-gray-200">
          <MonacoEditor
            theme="vs-dark"
            height="220px"
            language="json"
            value={processedText}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              automaticLayout: true,
              fontSize: 13,
              lineNumbers: "off",
              wordWrap: "on",
              wrappingIndent: "same",
            }}
          />
        </div>
      </div>
      <div className="text-gray-400 text-xs">
        {`说明：
+1) 建议在 建议词 JSONP URL 中使用 {keyword} 和 {jsonp} 作为占位符，例如：https://suggestion.baidu.com/su?wd={keyword}&cb={jsonp}
+2) jsonpCode 可为数组表达式或函数表达式：
+   - 数组表达式：直接作为建议词数组或对象。
+   - 函数表达式：支持 (resp)=>[...] 或 (resp, kw)=>[...]，返回 Promise 亦可。
+3) 点击“获取JSONP”后会自动执行 jsonpCode，并在“代码处理后返回”和“JSONP 原始返回”中展示。`}
      </div>
    </div>
  );
};

const SearchEngineHandle: FC = () => {
  const ref = useRef<ProFormInstance<any>>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [detailValues, setDetailValues] = useState<any | null>(null);

  const { run: detailRun, loading: detailLoading } = useRequest(getSearchEngineDetail, {
    manual: true,
    onSuccess: (data) => {
      const values = data as any;
      setDetailValues(values);
      if (ref.current) {
        ref.current.setFieldsValue({ ...values });
      }
    },
  });

  // 当服务端返回值更新时，尝试在表单实例就绪后填充
  useEffect(() => {
    if (detailValues && ref.current) {
      ref.current.setFieldsValue({ ...detailValues });
    }
  }, [detailValues]);

  const { runAsync: addRun } = useRequest(addSearchEngine, {
    manual: true,
    onSuccess: () => {
      messageApi.success("新增成功");
      navigate(-1);
    },
  });

  const { runAsync: editRun } = useRequest(updateSearchEngine, {
    manual: true,
    onSuccess: () => {
      messageApi.success("修改成功");
      navigate(-1);
    },
  });

  useEffect(() => {
    if (id) {
      detailRun(id);
    }
  }, [id]);

  return (
    <BasePageContainer loading={detailLoading}>
      <ProCard
        extra={
          <Space>
            <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
          </Space>
        }
      >
        <div className="max-w-5xl mx-auto py-6">
          <ProForm
            {...baseFormItemLayout}
            formRef={ref}
            initialValues={{
              jsonpCode: "(function(data){ return data; })",
              suggestUrl: "",
            }}
            submitter={{
              searchConfig: { submitText: "保存" },
              render: (_, dom) => <div className="flex items-center justify-center gap-2">{...dom}</div>,
            }}
            onFinish={async (values) => {
              const payload: any = {
                name: values.name,
                description: values.description,
                searchUrl: values.searchUrl,
                suggestUrl: values.suggestUrl,
                jsonpCode: values.jsonpCode,
                isEnabled: !!values.isEnabled,
                icon: values.icon,
              };
              try {
                await (id ? editRun(id!, payload) : addRun(payload));
                ref.current?.resetFields();
                return true;
              } catch (error) {
                return false;
              }
            }}
          >
            <ProFormText
              name="name"
              label="名称"
              placeholder="请输入名称"
              rules={[
                { required: true, message: "请输入名称" },
                { max: 50, message: "名称不超过50个字符" },
              ]}
            />
            <ProFormTextArea
              name="description"
              label="描述"
              placeholder="请输入描述"
              fieldProps={{ rows: 3, maxLength: 200, showCount: true }}
            />

            {/* 图标SVG 上传与预览，仅支持 .svg，提交时为 svg 字符串 */}
            <Form.Item label="图标SVG" tooltip="仅支持上传SVG文件，内容将以字符串形式保存">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Upload
                  accept=".svg,image/svg+xml"
                  showUploadList={false}
                  beforeUpload={async (file) => {
                    const isSvg = file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
                    if (!isSvg) {
                      message.error("仅支持上传SVG文件");
                      // @ts-ignore
                      return Upload.LIST_IGNORE;
                    }
                    try {
                      const text = await file.text();
                      const sanitized = text.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
                      if (!/^\s*<svg[\s>]/i.test(sanitized)) {
                        message.error("文件内容不是有效的SVG");
                        // @ts-ignore
                        return Upload.LIST_IGNORE;
                      }
                      ref.current?.setFieldsValue({ icon: sanitized });
                      message.success("SVG已加载");
                    } catch {
                      message.error("读取SVG失败");
                    }
                    // 阻止实际上传
                    // @ts-ignore
                    return Upload.LIST_IGNORE;
                  }}
                >
                  <Button type="default">选择SVG文件</Button>
                </Upload>
                {/* 隐藏字段用于表单收集 */}
                <Form.Item name="icon" noStyle>
                  <Input.TextArea style={{ display: "none" }} />
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prev, cur) => prev.icon !== cur.icon}>
                  {({ getFieldValue, setFieldsValue }) => {
                    const svg = getFieldValue("icon");
                    return (
                      <div>
                        <div className="mb-1 text-gray-500 text-sm">预览</div>
                        <div
                          className="border rounded p-2 bg-white"
                          style={{
                            width: 80,
                            height: 80,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {svg ? (
                            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: svg }} />
                          ) : (
                            <span className="text-gray-400">无</span>
                          )}
                        </div>
                        {svg && (
                          <div className="mt-2">
                            <Button size="small" onClick={() => setFieldsValue({ icon: undefined })}>
                              清除
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  }}
                </Form.Item>
              </Space>
            </Form.Item>

            <ProFormText
              name="searchUrl"
              label="搜索URL"
              tooltip="使用 {keyword} 作为关键词占位符，例如：https://www.google.com/search?q={keyword}"
              placeholder="请输入搜索URL"
              rules={[
                { required: true, message: "请输入搜索URL" },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    if (String(value).includes("{keyword}")) return Promise.resolve();
                    return Promise.reject(new Error("搜索URL需包含 {keyword} 占位符"));
                  },
                },
              ]}
            />
            <ProFormText
              name="suggestUrl"
              label="建议词 JSONP URL"
              tooltip="用于获取建议词的 JSONP 接口地址，需包含 {keyword} 和 {jsonp} 占位符"
              placeholder="请输入建议词 JSONP URL"
              rules={[
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    const v = String(value);
                    if (v.includes("{keyword}") && v.includes("{jsonp}")) return Promise.resolve();
                    return Promise.reject(new Error("建议词 JSONP URL需同时包含 {keyword} 和 {jsonp} 占位符"));
                  },
                },
              ]}
            />
            <Form.Item
              name="jsonpCode"
              label="JSONP代码"
              tooltip="JS 代码，将在客户端执行以生成建议词。返回值可为字符串数组，或函数(kw)=>字符串数组/Promise。默认 (function(data){ return data; })"
              rules={[{ required: true, message: "请输入 JSONP 代码" }]}
            >
              <MonacoEditor
                theme="vs-dark"
                height="320px"
                language="javascript"
                options={{
                  minimap: { enabled: false },
                  automaticLayout: true,
                  fontSize: 13,
                  lineNumbers: "off",
                  wordWrap: "on",
                  wrappingIndent: "same",
                }}
                onMount={(editor) => {
                  try {
                    editor.getAction("editor.action.formatDocument")?.run();
                  } catch {}
                }}
              />
            </Form.Item>
            <ProFormDependency name={["searchUrl", "suggestUrl", "jsonpCode"]}>
              {({ searchUrl, suggestUrl, jsonpCode }) => (
                <Form.Item label="测试">
                  <JsonpTester searchUrl={searchUrl} suggestUrl={suggestUrl} jsonpCode={jsonpCode} />
                </Form.Item>
              )}
            </ProFormDependency>
          </ProForm>
        </div>
      </ProCard>
      {contextHolder}
    </BasePageContainer>
  );
};

export default SearchEngineHandle;
