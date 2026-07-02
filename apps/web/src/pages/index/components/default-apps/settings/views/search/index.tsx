import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { App as AntdApp, Button, Popconfirm, Switch } from "antd";
import {
  RiApps2Line,
  RiCommandLine,
  RiDeleteBinLine,
  RiGlobalLine,
  RiHistoryLine,
  RiKeyboardLine,
  RiSearchLine,
  RiSettings3Line,
} from "@remixicon/react";
import {
  createUnifiedSearchShortcutFromEvent,
  defaultUnifiedSearchPreferences,
  formatUnifiedSearchShortcut,
  getSystemShortcutModifierName,
  getUnifiedSearchShortcutParts,
  hasRequiredShortcutModifier,
  isShortcutModifierOnlyKey,
  type SearchHistoryItem,
  useUnifiedSearchHistory,
  useUnifiedSearchPreferences,
} from "@/components/unified-search";
import {
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsView,
} from "../../components/macos-settings";

const SearchSettingsView = () => {
  const { preferences, setPreference } = useUnifiedSearchPreferences();
  const { history, removeHistoryItem, clearHistory } =
    useUnifiedSearchHistory();
  const { message } = AntdApp.useApp();
  const [recordingShortcut, setRecordingShortcut] = useState(false);

  const finishRecording = useCallback(() => {
    setRecordingShortcut(false);
  }, []);

  const resetShortcut = useCallback(() => {
    setPreference(
      "spotlightShortcut",
      defaultUnifiedSearchPreferences.spotlightShortcut,
    );
    finishRecording();
  }, [finishRecording, setPreference]);

  useEffect(() => {
    if (!recordingShortcut) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        finishRecording();
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        resetShortcut();
        return;
      }

      const shortcut = createUnifiedSearchShortcutFromEvent(event);
      if (!shortcut) {
        if (
          !isShortcutModifierOnlyKey(event) &&
          !hasRequiredShortcutModifier(event)
        ) {
          message.warning("快捷键需要包含 Command/Ctrl/Alt");
        }
        return;
      }

      setPreference("spotlightShortcut", shortcut);
      finishRecording();
    };
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("[data-unified-search-shortcut-editor]")
      ) {
        return;
      }
      finishRecording();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("mousedown", handleMouseDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("mousedown", handleMouseDown, true);
    };
  }, [
    finishRecording,
    message,
    recordingShortcut,
    resetShortcut,
    setPreference,
  ]);

  const shortcutDescription = recordingShortcut
    ? "按新的组合键，Esc 取消，Delete/Backspace 恢复默认"
    : `点击右侧输入框修改，当前系统默认修饰键为 ${getSystemShortcutModifierName()}`;

  return (
    <MacSettingsView>
      <MacSettingsSection title="搜索">
        <MacSettingsRow
          icon={<RiSearchLine size={16} />}
          iconTone="blue"
          title="桌面搜索框"
          description="在桌面顶部显示整行搜索入口"
          extra={
            <Switch
              checked={preferences.showDesktopSearchBar}
              onChange={(checked) =>
                setPreference("showDesktopSearchBar", checked)
              }
            />
          }
        />
        <MacSettingsRow
          icon={<RiKeyboardLine size={16} />}
          iconTone="purple"
          title="键盘呼出"
          description={`通过 ${formatUnifiedSearchShortcut(
            preferences.spotlightShortcut,
          )} 打开聚焦搜索`}
          extra={
            <Switch
              checked={preferences.enableSpotlightShortcut}
              onChange={(checked) =>
                setPreference("enableSpotlightShortcut", checked)
              }
            />
          }
        />
        <MacSettingsRow
          icon={<RiCommandLine size={16} />}
          iconTone="gray"
          title={recordingShortcut ? "输入新的快捷键" : "快捷键"}
          description={shortcutDescription}
          extra={
            <ShortcutEditorControl
              recording={recordingShortcut}
              parts={getUnifiedSearchShortcutParts(
                preferences.spotlightShortcut,
              )}
              onStart={() => setRecordingShortcut(true)}
            />
          }
        />
      </MacSettingsSection>
      <MacSettingsSection
        title={
          <span className="flex w-full items-center justify-between gap-3">
            <span>最近使用</span>
            {history.length ? (
              <Popconfirm
                title="清空最近使用记录？"
                okText="清空"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={clearHistory}
              >
                <Button size="small" type="text" danger>
                  清空
                </Button>
              </Popconfirm>
            ) : null}
          </span>
        }
      >
        {history.length ? (
          history.map((item) => (
            <MacSettingsRow
              key={item.id}
              icon={renderSearchHistoryIcon(item)}
              iconTone={getSearchHistoryIconTone(item)}
              title={item.title}
              description={item.description || getSearchHistoryKindLabel(item)}
              extra={
                <Button
                  type="text"
                  danger
                  size="small"
                  shape="circle"
                  aria-label={`删除 ${item.title}`}
                  icon={<RiDeleteBinLine size={15} />}
                  onClick={() => removeHistoryItem(item.id)}
                />
              }
            />
          ))
        ) : (
          <MacSettingsRow
            icon={<RiHistoryLine size={16} />}
            iconTone="gray"
            title="暂无最近使用"
            description="聚焦搜索打开过的搜索、网站、应用、页面和设置会显示在这里"
          />
        )}
      </MacSettingsSection>
    </MacSettingsView>
  );
};

const getSearchHistoryKindLabel = (item: SearchHistoryItem) => {
  if (item.kind === "website") return "网站";
  if (item.kind === "app") return "应用";
  if (item.kind === "route") return "页面";
  if (item.kind === "setting") return "设置";
  if (item.kind === "shortcut") return "快捷命令";
  return "网页搜索";
};

const getSearchHistoryIconTone = (
  item: SearchHistoryItem,
): "blue" | "green" | "orange" | "red" | "purple" | "gray" => {
  if (item.kind === "app") return "purple";
  if (item.kind === "route") return "green";
  if (item.kind === "setting") return "gray";
  if (item.kind === "website") return "blue";
  if (item.kind === "shortcut") return "orange";
  return "blue";
};

const renderSearchHistoryIcon = (item: SearchHistoryItem) => {
  if (item.kind === "app") return <RiApps2Line size={16} />;
  if (item.kind === "route") return <RiApps2Line size={16} />;
  if (item.kind === "setting") return <RiSettings3Line size={16} />;
  if (item.kind === "website") return <RiGlobalLine size={16} />;
  if (item.kind === "shortcut") return <RiCommandLine size={16} />;
  return <RiSearchLine size={16} />;
};

const ShortcutEditorControl = ({
  recording,
  parts,
  onStart,
}: {
  recording: boolean;
  parts: ReactNode[];
  onStart: () => void;
}) => {
  return (
    <button
      type="button"
      data-unified-search-shortcut-editor
      className={
        recording
          ? "inline-flex h-8 min-w-[236px] cursor-text items-center gap-3 rounded-lg border border-[#007aff] bg-[#f5faff] px-2 text-left shadow-[0_0_0_3px_rgba(0,122,255,0.14)] outline-none transition dark:bg-[#0a84ff]/10"
          : "inline-flex h-8 w-fit cursor-text items-center rounded-lg border border-[rgba(60,60,67,0.18)] bg-white px-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition hover:border-[#007aff]/55 hover:bg-[#f8fbff] focus-visible:border-[#007aff] focus-visible:shadow-[0_0_0_3px_rgba(0,122,255,0.14)] dark:border-white/15 dark:bg-white/[0.07] dark:hover:border-[#64a9ff]/55 dark:hover:bg-white/[0.1]"
      }
      onClick={(event) => {
        event.stopPropagation();
        if (!recording) onStart();
      }}
    >
      {recording ? (
        <>
          <span className="text-[13px] font-semibold text-[#007aff] dark:text-[#64a9ff]">
            按下快捷键
          </span>
          <span className="ml-auto text-[11px] font-medium text-[#8e8e93] dark:text-[#aeaeb2]">
            Esc 取消 · Del 默认
          </span>
        </>
      ) : (
        <ShortcutKeycaps parts={parts} />
      )}
    </button>
  );
};

const ShortcutKeycaps = ({
  active,
  parts,
}: {
  active?: boolean;
  parts: ReactNode[];
}) => (
  <span className="flex items-center gap-1.5">
    {parts.map((part, index) => (
      <kbd
        key={`${part}-${index}`}
        className={
          active
            ? "grid h-6 min-w-6 place-items-center rounded-md bg-[#007aff]/10 px-1.5 text-[12px] font-bold not-italic text-[#007aff] dark:bg-[#0a84ff]/20 dark:text-[#64a9ff]"
            : "grid h-6 min-w-6 place-items-center rounded-md border border-[rgba(60,60,67,0.12)] bg-[#f5f5f7] px-1.5 text-center text-[12px] font-bold not-italic text-[#424245] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-white/10 dark:bg-white/10 dark:text-[#f5f5f7]"
        }
      >
        {part}
      </kbd>
    ))}
  </span>
);

export default SearchSettingsView;
