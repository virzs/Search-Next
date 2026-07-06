import { Tag } from "antd";

export const PERMISSION_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];

const methodColorMap: Record<string, string> = {
  GET: "blue",
  POST: "green",
  PUT: "orange",
  DELETE: "red",
  PATCH: "purple",
  OPTIONS: "cyan",
  HEAD: "geekblue",
};

export const getPermissionMethodColor = (method?: string | null) => {
  return methodColorMap[method?.toUpperCase() ?? ""] ?? "default";
};

export const PermissionMethodTag = ({ method }: { method?: string | null }) => {
  const value = method?.toUpperCase();

  if (!value) {
    return <>-</>;
  }

  return (
    <span style={{ display: "inline-flex", flex: "0 0 auto", width: "fit-content", maxWidth: "100%" }}>
      <Tag color={getPermissionMethodColor(value)} style={{ marginInlineEnd: 0 }}>
        {value}
      </Tag>
    </span>
  );
};

export const permissionMethodOptions = PERMISSION_METHODS.map((value) => ({
  label: <PermissionMethodTag method={value} />,
  value,
}));
