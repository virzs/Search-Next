import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Input, Button, Space, Typography, Tag, AutoComplete, message } from "antd";
import { RiGlobalLine, RiRobot2Line, RiSearchLine, RiArrowLeftLine } from "@remixicon/react";
import { css } from "@emotion/css";
import { tryFetchRealSuggestions } from "../../services/search-suggestions";

interface SearchEngine {
  value: string;
  label: string;
  icon: React.ReactNode;
  searchUrl: string;
}

interface SearchComponentProps {
  onAISearchClick?: () => void;
  showAIButton?: boolean;
}

type SearchMode = "normal" | "ai";

const searchEngines: SearchEngine[] = [
  {
    value: "bing",
    label: "Bing",
    icon: <RiGlobalLine size={16} />,
    searchUrl: "https://www.bing.com/search?q=",
  },
  {
    value: "baidu",
    label: "百度",
    icon: <RiGlobalLine size={16} />,
    searchUrl: "https://www.baidu.com/s?wd=",
  },
  {
    value: "google",
    label: "Google",
    icon: <RiGlobalLine size={16} />,
    searchUrl: "https://www.google.com/search?q=",
  },
  {
    value: "duckduckgo",
    label: "DuckDuckGo",
    icon: <RiGlobalLine size={16} />,
    searchUrl: "https://duckduckgo.com/?q=",
  },
];

const SearchComponent: React.FC<SearchComponentProps> = ({ onAISearchClick, showAIButton = true }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEngines, setSelectedEngines] = useState<string[]>(["bing"]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode>("normal");

  // 获取搜索建议
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      // 如果选择了多个搜索引擎，使用第一个引擎的建议
      const primaryEngine = selectedEngines[0] || "bing";
      console.log(`Fetching suggestions for query: "${query}" using engine: ${primaryEngine}`);

      try {
        const suggestions = await tryFetchRealSuggestions(query, primaryEngine);
        console.log(`Received suggestions:`, suggestions);
        setSuggestions(suggestions);
      } catch (error) {
        console.warn("Failed to fetch suggestions:", error);
        setSuggestions([]);
      }
    },
    [selectedEngines]
  );

  // 防抖处理搜索建议
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  // 自动完成选项
  const autoCompleteOptions = useMemo(() => {
    const options = suggestions.map((suggestion) => ({ value: suggestion, label: suggestion }));
    console.log(`AutoComplete options:`, options);
    return options;
  }, [suggestions]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      message.warning("请输入搜索内容");
      return;
    }

    if (selectedEngines.length === 0) {
      message.warning("请选择至少一个搜索引擎");
      return;
    }

    // 为每个选中的搜索引擎打开新窗口
    selectedEngines.forEach((engineValue) => {
      const engine = searchEngines.find((e) => e.value === engineValue);
      if (engine) {
        const searchUrl = engine.searchUrl + encodeURIComponent(searchQuery);
        window.open(searchUrl, "_blank");
      }
    });

    message.success(`已在 ${selectedEngines.length} 个搜索引擎中搜索"${searchQuery}"`);
  }, [searchQuery, selectedEngines]);

  const handleEngineToggle = useCallback((engineValue: string) => {
    setSelectedEngines((prev) => {
      if (prev.includes(engineValue)) {
        if (prev.length === 1) {
          message.warning("请至少选择一个搜索引擎");
          return prev;
        }
        return prev.filter((v) => v !== engineValue);
      } else {
        return [...prev, engineValue];
      }
    });
  }, []);

  const handleAISearchClick = useCallback(() => {
    if (searchMode === "normal") {
      setSearchMode("ai");
      onAISearchClick?.();
    }
  }, [searchMode, onAISearchClick]);

  const handleBackToNormal = useCallback(() => {
    setSearchMode("normal");
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      `}
    >
      {/* 主搜索框 */}
      <div
        className={css`
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 600px;
          gap: 12px;
        `}
      >
        {searchMode === "ai" && (
          <Button
            type="text"
            icon={<RiArrowLeftLine size={18} />}
            onClick={handleBackToNormal}
            className={css`
              color: #666;
              &:hover {
                color: #1890ff;
                background-color: rgba(24, 144, 255, 0.1);
              }
            `}
          />
        )}

        <AutoComplete
          value={searchQuery}
          onChange={setSearchQuery}
          options={autoCompleteOptions}
          style={{ flex: 1 }}
          placeholder={
            searchMode === "ai"
              ? "使用 AI 搜索..."
              : `在 ${selectedEngines.map((v) => searchEngines.find((e) => e.value === v)?.label).join("、")} 中搜索...`
          }
          filterOption={false}
          notFoundContent={null}
          allowClear
        >
          <Input
            size="large"
            prefix={
              searchMode === "ai" ? (
                <RiRobot2Line size={20} style={{ color: "#667eea" }} />
              ) : (
                <RiSearchLine size={20} style={{ color: "#999" }} />
              )
            }
            className={css`
              border-radius: 25px;
              height: 50px;
              font-size: 16px;
              ${searchMode === "ai" ? "border-color: #667eea;" : ""}
            `}
            onKeyDown={handleKeyPress}
          />
        </AutoComplete>

        <Button
          type="primary"
          size="large"
          onClick={searchMode === "ai" ? onAISearchClick : handleSearch}
          className={css`
            border-radius: 25px;
            height: 50px;
            padding: 0 24px;
            ${searchMode === "ai" ? "background-color: #667eea; border-color: #667eea;" : ""}
          `}
        >
          {searchMode === "ai" ? "AI 搜索" : "搜索"}
        </Button>
      </div>

      {/* 搜索引擎选择器 - 仅在普通搜索模式下显示 */}
      {searchMode === "normal" && (
        <div
          className={css`
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
          `}
        >
          <Typography.Text type="secondary">搜索引擎：</Typography.Text>

          <Space wrap>
            {searchEngines.map((engine) => (
              <Tag.CheckableTag
                key={engine.value}
                checked={selectedEngines.includes(engine.value)}
                onChange={() => handleEngineToggle(engine.value)}
                className={css`
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  padding: 4px 12px;
                  border-radius: 16px;
                  cursor: pointer;
                  transition: all 0.2s;

                  &.ant-tag-checkable {
                    border: 1px solid #d9d9d9;
                    background-color: #fff;
                  }

                  &.ant-tag-checkable-checked {
                    background-color: #1890ff;
                    border-color: #1890ff;
                    color: #fff;
                  }

                  &:hover {
                    border-color: #1890ff;
                    color: #1890ff;
                  }

                  &.ant-tag-checkable-checked:hover {
                    background-color: #40a9ff;
                    border-color: #40a9ff;
                    color: #fff;
                  }
                `}
              >
                {engine.icon}
                {engine.label}
              </Tag.CheckableTag>
            ))}
          </Space>
        </div>
      )}

      {/* AI搜索按钮 - 仅在普通搜索模式下显示 */}
      {showAIButton && searchMode === "normal" && (
        <div
          className={css`
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
          `}
        >
          <Typography.Text type="secondary">或者</Typography.Text>
          <Button
            type="dashed"
            icon={<RiRobot2Line />}
            onClick={handleAISearchClick}
            className={css`
              border-color: #667eea;
              color: #667eea;
              border-radius: 20px;
              &:hover {
                border-color: #667eea;
                color: #667eea;
                background-color: rgba(102, 126, 234, 0.1);
              }
            `}
          >
            使用 AI 搜索
          </Button>
        </div>
      )}

      {/* AI搜索模式提示 */}
      {searchMode === "ai" && (
        <div
          className={css`
            display: flex;
            align-items: center;
            gap: 8px;
            color: #667eea;
            font-size: 14px;
          `}
        >
          <RiRobot2Line size={16} />
          <Typography.Text style={{ color: "#667eea" }}>AI 搜索模式</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
