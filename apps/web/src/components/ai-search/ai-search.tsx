import React, { useState, useCallback } from "react";
import { Sender, Bubble, Conversations } from "@ant-design/x";
import { Select, Space, Typography, Button, message, Drawer } from "antd";
import { RiGlobalLine, RiRobot2Line, RiHistoryLine } from "@remixicon/react";
import { css, cx } from "@emotion/css";
import { DesktopBaseModal } from "zs_library";
import { performAISearch, isDeepSeekConfigured } from "../../services/ai-search";

interface SearchEngine {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
  searchEngine?: string;
  searchResults?: any[];
}

const searchEngines: SearchEngine[] = [
  { value: "bing", label: "Bing", icon: <RiGlobalLine size={16} /> },
  { value: "baidu", label: "百度", icon: <RiGlobalLine size={16} /> },
  { value: "google", label: "Google", icon: <RiGlobalLine size={16} /> },
];

interface AISearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const AISearchModal: React.FC<AISearchModalProps> = ({ visible, onClose }) => {
  // 示例对话内容
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "example-1",
      content: "你好！我是AI搜索助手，可以帮你搜索任何问题。",
      role: "assistant",
      timestamp: Date.now() - 60000,
    },
    {
      id: "example-2",
      content: "请问今天的天气怎么样？",
      role: "user",
      timestamp: Date.now() - 50000,
    },
    {
      id: "example-3",
      content: "我可以帮你搜索天气信息。你可以选择使用Bing、百度或Google搜索引擎来获取最新的天气数据。",
      role: "assistant",
      timestamp: Date.now() - 40000,
    },
  ]);
  const [selectedEngine, setSelectedEngine] = useState<string>("bing");
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[][]>([]);

  // AI搜索功能
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        content: query,
        role: "user",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        const context = messages
          .slice(-3)
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n");

        // 调用AI搜索服务进行网页搜索
        const searchResponse = await performAISearch({
          query,
          searchEngine: selectedEngine,
          context,
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: searchResponse.content,
          role: "assistant",
          timestamp: Date.now() + 1,
          searchEngine: selectedEngine,
          searchResults: searchResponse.searchResults,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // 如果是模拟响应，提示用户配置API
        if (!isDeepSeekConfigured()) {
          message.info("当前为模拟模式，请配置DeepSeek API密钥以启用真实AI搜索功能");
        }
      } catch (error) {
        console.error("搜索失败:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "搜索失败，请稍后重试。如果问题持续存在，请检查网络连接或API配置。",
          role: "assistant",
          timestamp: Date.now() + 1,
        };
        setMessages((prev) => [...prev, errorMessage]);
        message.error("搜索请求失败");
      } finally {
        setLoading(false);
      }
    },
    [messages, selectedEngine]
  );

  const saveCurrentConversation = useCallback(() => {
    if (messages.length > 3) {
      // 只保存有实际对话的会话
      setConversationHistory((prev) => [messages, ...prev.slice(0, 9)]); // 最多保存10个历史会话
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    // 保存当前会话到历史记录
    saveCurrentConversation();
    // 重置为示例对话
    setMessages([
      {
        id: "example-1",
        content: "你好！我是AI搜索助手，可以帮你搜索任何问题。",
        role: "assistant",
        timestamp: Date.now() - 60000,
      },
      {
        id: "example-2",
        content: "请问今天的天气怎么样？",
        role: "user",
        timestamp: Date.now() - 50000,
      },
      {
        id: "example-3",
        content: "我可以帮你搜索天气信息。你可以选择使用Bing、百度或Google搜索引擎来获取最新的天气数据。",
        role: "assistant",
        timestamp: Date.now() - 40000,
      },
    ]);
  }, [saveCurrentConversation]);

  const handleModalClose = useCallback(() => {
    onClose();
    setSearchQuery("");
  }, [onClose]);

  const handleDrawerOpen = useCallback(() => {
    setDrawerVisible(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerVisible(false);
  }, []);

  const loadConversation = useCallback((conversation: Message[]) => {
    setMessages(conversation);
    setDrawerVisible(false);
  }, []);

  return (
    <DesktopBaseModal visible={visible} onClose={handleModalClose} width={1000}>
        <div
          className={cx(
            "max-h-[50vh] h-screen overflow-hidden",
            css`
              display: flex;
              flex-direction: column;
              position: relative;
            `
          )}
        >
          {/* 标题栏 */}
          <div
            className={cx(
              "bg-gray-50 rounded-lg",
              css`
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                position: relative;
                z-index: 1;
              `
            )}
          >
            <div
              className={css`
                display: flex;
                align-items: center;
                gap: 12px;
              `}
            >
              <RiRobot2Line size={24} style={{ color: "#667eea" }} />
              <Typography.Title level={4} style={{ margin: 0, color: "#667eea" }}>
                AI 网络搜索
              </Typography.Title>
            </div>

            <Space>
              <Button icon={<RiHistoryLine />} onClick={handleDrawerOpen} type="text" title="历史对话" />
              <Select
                role="combobox"
                value={selectedEngine}
                onChange={setSelectedEngine}
                style={{ width: 120 }}
                options={searchEngines.map((engine) => ({
                  value: engine.value,
                  label: (
                    <Space size={8}>
                      {engine.icon}
                      {engine.label}
                    </Space>
                  ),
                }))}
              />
              <Button onClick={clearMessages} type="text">
                清空对话
              </Button>
            </Space>
          </div>

          {/* 对话内容区域 */}
          <div
            className={cx(
              "bg-gray-50 my-4 rounded-lg",
              css`
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 0;
                position: relative;
                overflow-y: auto;
              `
            )}
          >
            <div
              className={css`
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                padding-bottom: 100px; /* 为底部输入框留出更多空间 */
              `}
            >
              {messages.map((message) => (
                <Bubble
                  key={message.id}
                  placement={message.role === "user" ? "end" : "start"}
                  content={message.content}
                  avatar={
                    message.role === "user"
                      ? undefined
                      : <RiRobot2Line size={16} />
                  }
                  variant={message.role === "user" ? "filled" : "borderless"}
                  loading={loading && message.id === messages[messages.length - 1]?.id && message.role === "assistant"}
                />
              ))}
            </div>
          </div>

          {/* 输入框固定在底部 */}
          <div className="shrink-0">
            <Sender
              className="bg-gray-50"
              placeholder={`使用 ${searchEngines.find((e) => e.value === selectedEngine)?.label} 搜索...`}
              onSubmit={handleSearch}
              onFocus={() => undefined}
              onBlur={() => undefined}
              onKeyUp={() => undefined}
              loading={loading}
              disabled={loading}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* 历史对话抽屉 - 放在modal内部 */}
          <Drawer
            title="历史对话"
            placement="right"
            onClose={handleDrawerClose}
            open={drawerVisible}
            width={400}
            getContainer={false}
            maskClassName={css`
              background-color: transparent !important;
            `}
          >
            {conversationHistory.length === 0 ? (
              <Typography.Text type="secondary" style={{ textAlign: "center", padding: "20px 0" }}>
                暂无历史对话
              </Typography.Text>
            ) : (
              <Conversations
                items={conversationHistory.map((conversation, index) => {
                  const firstUserMessage = conversation.find((msg) => msg.role === "user" && msg.id !== "example-2");
                  const preview = firstUserMessage?.content || "新对话";
                  const timestamp = conversation[conversation.length - 1]?.timestamp || Date.now();

                  return {
                    key: index.toString(),
                    label: preview.length > 30 ? preview.substring(0, 30) + "..." : preview,
                    timestamp: timestamp,
                    icon: <RiRobot2Line size={16} />,
                  };
                })}
                onActiveChange={(key) => {
                  const index = parseInt(key);
                  if (index >= 0 && index < conversationHistory.length) {
                    loadConversation(conversationHistory[index]);
                  }
                }}
              />
            )}
          </Drawer>
        </div>
      </DesktopBaseModal>
  );
};

export default AISearchModal;
