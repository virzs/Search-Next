const widgetBaseConfig = {
  layouts: [
    {
      w: 1,
      h: 1,
    },
    {
      w: 1,
      h: 2,
    },
    {
      w: 2,
      h: 1,
    },
    {
      w: 2,
      h: 2,
    },
    {
      w: 2,
      h: 4,
    },
  ],
  contextMenus: [
    {
      label: "在新标签页打开",
      icon: "bi bi-box-arrow-up-right",
      key: "openInNewTab",
    },
    {
      label: "在新窗口打开",
      icon: "bi bi-box-arrow-up-right",
      key: "openInNewWindow",
    },
    {
      label: "分享",
      icon: "bi bi-share",
      key: "share",
    },
    {
      label: "布局",
      icon: "bi bi-grid-1x2",
      key: "layout",
    },
    {
      label: "编辑",
      icon: "bi bi-pencil",
      key: "edit",
    },
    {
      label: "删除",
      icon: "bi bi-trash",
      key: "delete",
    },
  ],
};

export default widgetBaseConfig;
