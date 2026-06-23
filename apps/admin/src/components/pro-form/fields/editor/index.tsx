import { ProForm } from "@ant-design/pro-components";
import { FC } from "react";
import MEditor, { EditorProps } from "./editor";

const ProFormEditor: FC<EditorProps> = (props) => {
  return (
    <ProForm.Item {...props}>
      <MEditor {...props} />
    </ProForm.Item>
  );
};

export default ProFormEditor;
