import { ProForm, ProFormItemProps } from "@ant-design/pro-components";
import { UploadFile, Upload, Button, UploadProps as AntdUploadProps } from "antd";
import { FC, useEffect, useState } from "react";
import { UploadChangeParam } from "antd/es/upload";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { resourceUpload } from "@/services/resource";

const { Dragger } = Upload;

export interface UploadProps extends ProFormItemProps {
  name?: ProFormItemProps["name"];
  value?: any;
  onChange?: (fileList: UploadFile[]) => void;
  /**
   * 是否显示为拖拽上传，实际使用时放在 fieldProps 里
   */
  dragger?: boolean;
  /**
   * 是否手动上传，实际使用时放在 fieldProps 里
   */
  manually?: boolean;
}

const MUpload: FC<UploadProps> = (props) => {
  const { value, fieldProps, onChange: fOnChange } = props;
  const {
    dir = "default",
    multiple = false,
    maxCount,
    disabled,
    listType = "picture",
    dragger = false,
    manually = false,
    ...rest
  } = fieldProps ?? {};

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (value === undefined || value === null) {
      setFileList([]);
      return;
    }
    if (Array.isArray(value)) {
      const filteredValue = value.filter((item) => item !== undefined && item !== null);
      setFileList(filteredValue);
      return;
    }
    if (typeof value === "string") {
      setFileList([]);
      return;
    }
    setFileList([value]);
  }, [value]);

  // 向上层组件返回fileList
  const sendFileList = (nf: UploadFile[]) => {
    const filtered = nf
      .filter((file) => file !== undefined && file !== null)
      .map((i: any) => i?.response ?? i?.originFileObj ?? i);

    if (maxCount > 1 || maxCount === undefined) {
      fOnChange?.(filtered);
    } else {
      fOnChange?.(filtered[0]);
    }
  };

  const onChange = (info: UploadChangeParam<UploadFile>) => {
    let newFileList = [...info.fileList];
    // 过滤掉undefined和null值，并处理文件响应
    newFileList = newFileList
      .filter((file) => file !== undefined && file !== null)
      .map((file) => {
        if (file.response) {
          file.url = file.response.url;
        }
        return file;
      });
    setFileList(newFileList);
    if (info.file.status !== "uploading") {
      sendFileList(newFileList);
    }
  };

  const onRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid);
    setFileList(newFileList);
    sendFileList(newFileList);
  };

  const customRequest: NonNullable<AntdUploadProps["customRequest"]> = ({
    file,
    onError,
    onProgress,
    onSuccess,
  }) => {
    if (!(file instanceof File)) {
      onError?.(new Error("Only File uploads are supported"));
      return;
    }

    resourceUpload(dir, file, (progressEvent) => {
      if (progressEvent.total) {
        onProgress?.({
          percent: Math.round((progressEvent.loaded * 100) / progressEvent.total),
        });
      }
    })
      .then((response) => {
        onSuccess?.(response);
      })
      .catch((error) => {
        onError?.(error instanceof Error ? error : new Error("Upload failed"));
      });
  };

  const uploadProps = {
    customRequest,
    fileList,
    maxCount,
    onChange,
    onRemove,
    listType,
    disabled,
    multiple,
    beforeUpload: (file: UploadFile) => {
      if (manually) {
        const newFileList = [...fileList, file];
        setFileList(newFileList);
        sendFileList(newFileList);
      }
      return !manually;
    },
    ...rest,
  };

  if (dragger) {
    return (
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">单击或将文件拖到此区域以上传</p>
        <p className="ant-upload-hint">支持单次或批量上传。</p>
      </Dragger>
    );
  }

  return (
    <Upload {...uploadProps}>
      {((maxCount && fileList?.length < maxCount) || [null, undefined].includes(maxCount)) &&
        (listType === "picture-card" ? (
          <button style={{ border: 0, background: "none" }} type="button">
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </button>
        ) : (
          <Button disabled={disabled} icon={<UploadOutlined />}>
            上传
          </Button>
        ))}
    </Upload>
  );
};

const ProFormUpload: FC<UploadProps> = (props) => {
  return (
    <ProForm.Item {...props}>
      <MUpload {...props} />
    </ProForm.Item>
  );
};

export default ProFormUpload;
