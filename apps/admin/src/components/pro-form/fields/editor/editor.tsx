import { resourceUpload } from "@/services/resource";
import { ProFormItemProps } from "@ant-design/pro-components";
import { Card } from "antd";
import { FC } from "react";
import { SimpleEditor, JSONContent } from "zs_library";

export interface EditorProps extends ProFormItemProps {
  value?: string;
  onChange?: (value: string | JSONContent) => void;
}
const MEditor: FC<EditorProps> = (props) => {
  const { value, onChange, fieldProps } = props;

  const { uploadDir = "editor" } = fieldProps ?? {};
  const aiApiKey = import.meta.env.VITE_EDITOR_AI_API_KEY ?? "";

  return (
    <Card styles={{ body: { padding: 0 } }}>
      <SimpleEditor
        value={value}
        onChange={onChange}
        {...fieldProps}
        features={{
          themeToggle: false,
          image: {
            configure: {
              customRequest: ({ file, onProgress, onSuccess, onError }) => {
                resourceUpload(uploadDir, file, (progressEvent) => {
                  if (progressEvent.total) {
                    const percent = Math.round(
                      (progressEvent.loaded * 100) / progressEvent.total,
                    );
                    onProgress({ percent });
                  }
                })
                  .then((response) => {
                    console.log("🚀 ~ MEditor ~ response:", response);

                    if (response.url) {
                      onSuccess(response.url);
                    } else {
                      throw new Error("Upload failed");
                    }
                  })
                  .catch((error) => {
                    console.error("Upload error:", error);
                    onError(error);
                  });
              },
            },
          },
          ai: {
            enabled: aiApiKey !== "",
            configure: { apiKey: aiApiKey },
          },
        }}
        output="markdown"
      />
    </Card>
  );
};

export default MEditor;
