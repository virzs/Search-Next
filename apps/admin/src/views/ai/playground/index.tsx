import { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Card, Button, GetProp, Typography } from "antd";
import { Sender, Bubble, useXAgent, XProvider, useXChat, BubbleProps } from "@ant-design/x";
import OpenAI from "openai";
import FullPageContainer from "@/components/containter/full";
import { createOpenAIFetchWithTokenRefresh } from "@/utils/fetchWithTokenRefresh";
import markdownit from "markdown-it";

const md = markdownit({ html: true, breaks: true });

import PlaygroundForm from "./components/PlaygroundForm";
import { RiRobot2Line, RiUserLine } from "@remixicon/react";
import { css } from "@emotion/css";

const renderMarkdown: BubbleProps["messageRender"] = (content) => {
  return (
    <Typography>
      <div
        className={css`
          > :last-child {
            margin-bottom: 0;
          }
        `}
        dangerouslySetInnerHTML={{ __html: md.render(content) }}
      />
    </Typography>
  );
};

// OpenAI兼容接口，不再需要自定义PlaygroundParams类型

const Playground = () => {
  const [content, setContent] = useState("");

  const [formValues, setFormValues] = useState<any>({
    model: undefined,
    presetId: undefined,
    prompt: "",
    systemPrompt: "",
    temperature: 0.7,
    maxTokens: 2000,
    maxContext: 4000,
    stream: true,
    usePreset: false,
  });

  // 使用 useRef 存储最新的表单配置，解决闭包问题
  const formValuesRef = useRef(formValues);

  // 每次 formValues 更新时同步到 ref
  useEffect(() => {
    formValuesRef.current = formValues;
  }, [formValues]);

  const client = useMemo(
    () =>
      new OpenAI({
        baseURL: `${window.location.origin}/api/ai/playground`,
        apiKey: "",
        dangerouslyAllowBrowser: true,
        fetch: createOpenAIFetchWithTokenRefresh(),
      }),
    []
  );

  // 使用 useXAgent 管理AI对话
  const [agent] = useXAgent({
    request: async (info, callbacks) => {
      const { messages } = info;

      const { onSuccess, onUpdate, onError } = callbacks;

      // 使用 ref 获取最新的表单配置
      const currentFormValues = formValuesRef.current;

      let content: string = "";

      try {
        // 检查客户端是否已初始化
        if (!client) {
          onError?.(new Error("AI客户端未初始化，请稍后重试"));
          return;
        }

        // 检查是否选择模型
        if (!formValuesRef.current.model) {
          onError?.(new Error("请先选择模型"));
          return;
        }

        // 构建消息数组，包含系统提示词
        const requestMessages: any[] = [];

        // 添加系统提示词（如果有）
        if (currentFormValues.systemPrompt) {
          requestMessages.push({ role: "system", content: currentFormValues.systemPrompt });
        }

        // 添加历史消息
        if (messages && messages.length > 0) {
          requestMessages.push(
            ...messages.map((msg: any, index: number) => {
              // 如果 msg 是字符串，需要根据索引位置判断角色
              if (typeof msg === "string") {
                // 历史消息的角色分配：第一条消息是用户输入，然后交替进行
                // 系统提示词不影响历史消息的角色分配，因为它是独立添加的
                const role = index % 2 === 0 ? "user" : "assistant";
                return {
                  role,
                  content: msg,
                };
              }
              // 如果 msg 是对象，则按原逻辑处理
              return {
                role: msg.role || "user",
                content: msg.content || msg,
              };
            })
          );
        }

        const response = await client.chat.completions.create({
          model: currentFormValues.model,
          messages: requestMessages,
          temperature: currentFormValues.temperature,
          max_tokens: currentFormValues.maxTokens,
          max_completion_tokens: currentFormValues.maxContext,
          stream: currentFormValues.stream !== false,
        });

        // TODO: antd x 组件当前不支持向组件添加完整的chunk数据，只能添加字符串，需要等 antd x 2.0 版本发布后再修改
        // 检查是否为流式响应
        if (currentFormValues.stream !== false && Symbol.asyncIterator in response) {
          // 流式响应处理
          for await (const chunk of response as any) {
            content += chunk.choices[0]?.delta?.content || "";
            // @ts-ignore
            onUpdate(content);
          }
        } else {
          // 非流式响应处理
          const completion = response as any;
          content = completion.choices[0]?.message?.content || "";
          // @ts-ignore
          onUpdate(content);
        }

        // @ts-ignore
        onSuccess(content);
      } catch (error: any) {
        console.error("API调用错误:", error);
        onError?.(error);
      }
    },
  });

  // 使用 useXChat 管理对话状态
  const { onRequest, messages: chatMessages, setMessages } = useXChat({ agent });

  // 表单值变化处理
  const handleFormChange = (values: any) => {
    const newFormValues = { ...formValues, ...values };
    setFormValues(newFormValues);
  };

  const roles: GetProp<typeof Bubble.List, "roles"> = {
    ai: {
      placement: "start",
      avatar: { icon: <RiRobot2Line size={16} />, style: { background: "#fde3cf" } },
    },
    local: {
      placement: "end",
      avatar: { icon: <RiUserLine size={16} />, style: { background: "#87d068" } },
    },
  };

  return (
    <XProvider>
      <FullPageContainer showBackButton={false}>
        <div className="h-full">
          <Row gutter={16} className="h-full">
            {/* 左侧参数调整区域 */}
            <Col span={8} className="h-full">
              <Card title="参数设置" className="h-full" bodyStyle={{ height: "calc(100% - 56px)", overflow: "auto" }}>
                <PlaygroundForm value={formValues} onChange={handleFormChange} />
              </Card>
            </Col>

            {/* 右侧对话区域 */}
            <Col span={16} className="h-full">
              <Card
                title="对话测试"
                className="h-full"
                bodyStyle={{ height: "calc(100% - 56px)", padding: "16px" }}
                extra={
                  <Button size="small" onClick={() => setMessages([])}>
                    清空对话
                  </Button>
                }
              >
                <div className="h-full flex flex-col">
                  {/* 对话气泡区域 */}
                  <div className="flex-1 overflow-y-auto mb-4 min-h-0">
                    {chatMessages.length === 0 ? (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#999",
                          fontSize: "14px",
                        }}
                      >
                        开始你的AI对话测试吧！
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Bubble.List
                          roles={roles}
                          items={chatMessages.map((chatMessage) => {
                            const { id, message, status } = chatMessage;
                            return {
                              key: id,
                              role: status === "local" ? "local" : "ai",
                              content: message,
                              // ! loading状态无法判断模型是加载中还是流式传输中
                              loading: status === "loading" && !message,
                              messageRender: renderMarkdown,
                            };
                          })}
                        />
                      </div>
                    )}
                  </div>
                  {/* 输入框 */}
                  <Sender
                    loading={agent.isRequesting()}
                    value={content}
                    onChange={setContent}
                    onSubmit={(nextContent) => {
                      // 防止重复提交：如果正在请求中，则不处理新的提交
                      if (agent.isRequesting()) {
                        return;
                      }
                      onRequest(nextContent);
                      setContent("");
                    }}
                    placeholder="输入消息进行测试..."
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </FullPageContainer>
    </XProvider>
  );
};

export default Playground;
