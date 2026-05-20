import { FormLayout } from "antd/lib/form/Form";

export const getApiPrefix = (
  path: string,
  extra?: number | string | Array<number | string>
) => {
  const prefix = "/api";

  const mergedExtra = Array.isArray(extra)
    ? extra
    : extra || extra === 0
    ? [extra]
    : [];
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  if (!path.endsWith("/")) {
    path = `${path}/`;
  }
  if (mergedExtra?.length) {
    path += mergedExtra.map((item) => `${item}/`).join("");
  }
  path = `${prefix}${path}`;
  return path;
};

export const getBackendOrigin = () => {
  const configuredOrigin = import.meta.env.VITE_API_ORIGIN || import.meta.env.VITE_API_PROXY_TARGET;
  if (configuredOrigin) return configuredOrigin.replace(/\/+$/, "");

  if (import.meta.env.DEV) return "http://localhost:5151";
  return window.location.origin;
};

export const toBackendAssetUrl = (entry: string) => {
  if (!entry) return entry;
  if (entry.startsWith("http://") || entry.startsWith("https://")) return entry;
  if (entry.startsWith("//")) return `${window.location.protocol}${entry}`;

  const normalized = entry.startsWith("/") ? entry : `/${entry}`;
  if (normalized.startsWith("/static/") || normalized.startsWith("/uploads/")) {
    return new URL(normalized, getBackendOrigin()).href;
  }
  return new URL(normalized, window.location.origin).href;
};

// 默认表单布局
export const baseFormItemLayout: {
  [x: string]: any;
  layout: FormLayout;
} = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
  layout: "horizontal",
};

// 检查 path 开头是否包含 / 如果没有则添加
export const checkPath = (path: string) => {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return path;
};

/*
 * 判断是否为移动设备
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
};

// 递归函数，第一个参数为数组，第二个元素为 children 的 key
export const findChildren = (
  arr: any[],
  option?: {
    parentKey?: string;
    childrenKey?: string;
  }
) => {
  const { parentKey = "parent", childrenKey = "children" } = option || {};

  const map = new Map();
  arr.forEach((item) => {
    map.set(item._id, item);
  });
  const treeData: any[] = [];
  arr.forEach((item) => {
    const parent = map.get(item[parentKey]);
    if (parent) {
      if (!parent[childrenKey]) {
        parent[childrenKey] = [];
      }
      parent[childrenKey].push(item);
    } else {
      treeData.push(item);
    }
  });
  return treeData;
};
