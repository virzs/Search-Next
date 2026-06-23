import { Resource, resourceDownload } from "@/services/resource";
import { useRequest, useSessionStorageState } from "ahooks";
import { Image, ImageProps, Modal } from "antd";
import { FC, useEffect, useMemo, useState } from "react";

export interface PrivateImageProps extends Omit<ImageProps, "src" | "resource"> {
  resource?: Resource;
}

const PrivateImage: FC<PrivateImageProps> = (props) => {
  const { resource, ...rest } = props;
  const { preview: previewProp, onClick, ...imageRest } = rest;

  const [isRemoved, setIsRemoved] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data, run } = useRequest(resourceDownload, {
    manual: true,
    onError: () => {
      setIsRemoved(true);
    },
  });

  const [url, setUrl] = useSessionStorageState<string | undefined>(resource?._id ?? "");

  useEffect(() => {
    if (data) {
      setUrl(data);
    }
  }, [data, setUrl]);

  useEffect(() => {
    if (!resource?._id) return;
    const src = url ?? data ?? resource?.url;
    if (src) return;
    run(resource._id);
  }, [data, resource?._id, resource?.url, run, url]);

  const src = url ?? data ?? resource?.url;
  const previewDisabled = previewProp === false;

  const previewCfg = useMemo(() => {
    if (!previewProp || typeof previewProp !== "object") return undefined;
    return previewProp as Exclude<ImageProps["preview"], boolean>;
  }, [previewProp]);

  const triggerOpenChange = (open: boolean) => {
    const onOpenChange = (previewCfg as any)?.onOpenChange;
    const onVisibleChange = (previewCfg as any)?.onVisibleChange;
    if (typeof onOpenChange === "function") {
      onOpenChange(open, !open);
    }
    if (typeof onVisibleChange === "function") {
      onVisibleChange(open, !open);
    }
  };

  const handleImageClick: NonNullable<ImageProps["onClick"]> = (e) => {
    onClick?.(e);
    if (previewDisabled || !src) return;
    setPreviewOpen(true);
    triggerOpenChange(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    triggerOpenChange(false);
  };

  return (
    <>
      <Image
        src={src}
        preview={false}
        onClick={handleImageClick}
        onError={() => {
          if (resource && !isRemoved) {
            setUrl(undefined);
            run(resource._id);
          }
        }}
        {...imageRest}
      />

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={closePreview}
        destroyOnHidden
        maskClosable
        centered
        width="auto"
        styles={{
          body: {
            padding: 0,
            background: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxHeight: "calc(100vh - 120px)",
          },
        }}
      >
        {src ? (
          <img
            src={src}
            alt={(imageRest.alt as string) || "preview"}
            style={{
              maxWidth: "calc(100vw - 120px)",
              maxHeight: "calc(100vh - 120px)",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : null}
      </Modal>
    </>
  );
};

export default PrivateImage;
