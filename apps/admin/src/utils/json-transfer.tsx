import { Modal } from "antd";

export interface ImportErrorItem {
  index: number;
  key?: string;
  message: string;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  restored: number;
  failed: number;
  errors?: ImportErrorItem[];
}

export const downloadJsonFile = (filename: string, data: unknown) => {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const readJsonFile = async (file: File) => {
  if (!file.name.toLowerCase().endsWith(".json")) {
    throw new Error("请选择 .json 文件");
  }

  const text = await file.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("JSON 文件格式不正确");
  }
};

export const showImportResult = (title: string, result: ImportResult) => {
  const errors = result.errors ?? [];

  Modal.info({
    title,
    width: 640,
    content: (
      <div>
        <div>
          总数 {result.total}，新增 {result.created}，更新 {result.updated}，恢复 {result.restored}，失败{" "}
          {result.failed}
        </div>
        {errors.length > 0 && (
          <div className="mt-3 max-h-72 overflow-auto">
            {errors.map((item) => (
              <div key={`${item.index}-${item.key ?? ""}`} className="mb-2">
                第 {item.index} 条{item.key ? `（${item.key}）` : ""}：{item.message}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  });
};
