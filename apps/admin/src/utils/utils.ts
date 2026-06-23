import { FormLayout } from "antd/lib/form/Form";
import { isDate } from "date-fns";
import dayjs from "dayjs";

export interface FormatTextOptionsPropsType {
  dateFormat?: string;
  arrayJoin?: string;
}

export const isTauri = (): boolean => {
  return false;
};

export const getApiPrefix = (path: string, extra?: number | string | Array<number | string>) => {
  const prefix = "/api";

  const mergedExtra = Array.isArray(extra) ? extra : extra || extra === 0 ? [extra] : [];
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
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
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

export const formatDateString = (value?: string, format = "YYYY-MM-DD HH:mm:ss") => {
  if (!value || !isDateString(value)) {
    return "-";
  }

  return dayjs(value).format(format);
};

export const isDateString = (value: string | number) => {
  if (typeof value === "number") {
    return false;
  }
  const reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})/;
  return !isNaN(Date.parse(value)) && value.match(reg) !== null;
};

export const formatText = (value: any, options?: FormatTextOptionsPropsType): any => {
  const { dateFormat = "YYYY-MM-DD HH:mm", arrayJoin = ", " } = options ?? {};

  if (isDate(value)) {
    return dayjs(value).format(dateFormat);
  }

  if (dayjs.isDayjs(value)) {
    return value.format(dateFormat);
  }

  if (value instanceof Object && !Array.isArray(value)) {
    if (value.username) {
      return value.username;
    }
    throw new Error("RenderText: Param `value` can not be a Object");
  }

  if (Array.isArray(value)) {
    return value.map((v) => formatText(v, options)).join(arrayJoin);
  }

  if (isDateString(value)) {
    return formatDateString(value, dateFormat);
  }

  return value;
};
