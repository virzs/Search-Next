import { resourceUpload } from "@/services/resource";
import { UploadOutlined } from "@ant-design/icons";
import { App, Button, ColorPicker, Form, Modal, Radio, Slider, Spin, Switch, Upload } from "antd";
import type { UploadProps } from "antd";
import { FC, useEffect, useMemo, useRef, useState } from "react";

type MaskType = "none" | "circle" | "rounded";

export interface IconEditorModalProps {
  open: boolean;
  initialUrl?: string | null;
  onOpenChange: (open: boolean) => void;
  onUploaded: (resource: any) => void;
}

const CANVAS_SIZE = 256;
const OUTPUT_SIZE = 64;
const MASK_STROKE_WIDTH = 10;
const MASK_STROKE_COLOR = "rgba(0,0,0,0.10)";

const drawRoundedRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

const IconEditorModal: FC<IconEditorModalProps> = ({ open, initialUrl, onOpenChange, onUploaded }) => {
  const { message } = App.useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceObjectUrlRef = useRef<string | null>(null);

  const [loadingSource, setLoadingSource] = useState(false);
  const [saving, setSaving] = useState(false);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [maskType, setMaskType] = useState<MaskType>("rounded");
  const [roundedRadius, setRoundedRadius] = useState(48);
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const canExport = useMemo(() => !!img && !!canvasRef.current, [img, open]);

  const cleanupObjectUrl = () => {
    if (sourceObjectUrlRef.current) {
      URL.revokeObjectURL(sourceObjectUrlRef.current);
      sourceObjectUrlRef.current = null;
    }
  };

  const resetState = () => {
    setMaskType("rounded");
    setRoundedRadius(48);
    setBackgroundEnabled(true);
    setBackgroundColor("#ffffff");
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setImg(null);
    setSourceUrl(null);
    cleanupObjectUrl();
  };

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    if (!initialUrl) return;

    let cancelled = false;
    setLoadingSource(true);
    (async () => {
      try {
        cleanupObjectUrl();
        const resp = await fetch(initialUrl);
        if (!resp.ok) throw new Error(String(resp.status));
        const blob = await resp.blob();
        const objectUrl = URL.createObjectURL(blob);
        sourceObjectUrlRef.current = objectUrl;
        if (!cancelled) setSourceUrl(objectUrl);
      } catch (e) {
        if (!cancelled) setSourceUrl(initialUrl);
      } finally {
        if (!cancelled) setLoadingSource(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, initialUrl]);

  useEffect(() => {
    if (!sourceUrl) {
      setImg(null);
      return;
    }
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!cancelled) setImg(image);
    };
    image.onerror = () => {
      if (!cancelled) {
        setImg(null);
        message.error("图片加载失败，请尝试上传本地图标再编辑");
      }
    };
    image.src = sourceUrl;
    return () => {
      cancelled = true;
    };
  }, [sourceUrl]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    const image = img;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.save();
    if (maskType === "circle" || maskType === "rounded") {
      if (maskType === "circle") {
        ctx.beginPath();
        ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
        ctx.closePath();
      } else {
        drawRoundedRectPath(ctx, 0, 0, CANVAS_SIZE, CANVAS_SIZE, roundedRadius);
      }
      ctx.clip();
    }

    if (backgroundEnabled) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    if (image) {
      const fitScale = Math.min(CANVAS_SIZE / image.width, CANVAS_SIZE / image.height);
      const drawScale = fitScale * scale;
      const drawW = image.width * drawScale;
      const drawH = image.height * drawScale;
      const drawX = (CANVAS_SIZE - drawW) / 2 + offsetX;
      const drawY = (CANVAS_SIZE - drawH) / 2 + offsetY;
      ctx.drawImage(image, drawX, drawY, drawW, drawH);
    }
    ctx.restore();

    if (maskType === "circle" || maskType === "rounded") {
      ctx.save();
      ctx.lineWidth = MASK_STROKE_WIDTH;
      ctx.strokeStyle = MASK_STROKE_COLOR;
      const inset = MASK_STROKE_WIDTH / 2;
      if (maskType === "circle") {
        ctx.beginPath();
        ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - inset, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
      } else {
        drawRoundedRectPath(ctx, inset, inset, CANVAS_SIZE - inset * 2, CANVAS_SIZE - inset * 2, Math.max(0, roundedRadius - inset));
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [open, img, maskType, roundedRadius, backgroundEnabled, backgroundColor, scale, offsetX, offsetY]);

  const uploadProps: UploadProps = {
    accept: "image/*",
    showUploadList: false,
    beforeUpload: (file) => {
      cleanupObjectUrl();
      const objectUrl = URL.createObjectURL(file);
      sourceObjectUrlRef.current = objectUrl;
      setSourceUrl(objectUrl);
      return false;
    },
  };

  const exportBlob = async (): Promise<Blob> => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("no canvas");
    const outCanvas = document.createElement("canvas");
    outCanvas.width = OUTPUT_SIZE;
    outCanvas.height = OUTPUT_SIZE;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) throw new Error("no out ctx");
    outCtx.imageSmoothingEnabled = true;
    // @ts-ignore
    outCtx.imageSmoothingQuality = "high";
    outCtx.drawImage(canvas, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    return await new Promise<Blob>((resolve, reject) => {
      outCanvas.toBlob((blob) => {
        if (!blob) reject(new Error("toBlob failed"));
        else resolve(blob);
      }, "image/png");
    });
  };

  const handleSave = async () => {
    if (!canExport) {
      message.error("请先选择图片");
      return;
    }
    setSaving(true);
    try {
      const blob = await exportBlob();
      const file = new File([blob], `website_icon_${OUTPUT_SIZE}x${OUTPUT_SIZE}_${Date.now()}.png`, { type: "image/png" });
      const resource = await resourceUpload("website_icon", file);
      onUploaded(resource);
      onOpenChange(false);
      message.success("图标已保存");
    } catch (e) {
      message.error("保存失败，请尝试上传本地图标后再编辑");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="图标编辑器"
      open={open}
      onCancel={() => onOpenChange(false)}
      destroyOnClose
      okText="保存并上传"
      onOk={handleSave}
      confirmLoading={saving}
      width={860}
    >
      <div className="flex gap-4">
        <div className="shrink-0">
          <div
            className="w-[320px] h-[320px] flex items-center justify-center border border-solid border-gray-200 rounded"
            style={{
              backgroundImage:
                "linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.08) 75%)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
              backgroundColor: "#fff",
            }}
          >
            {loadingSource ? (
              <Spin />
            ) : (
              <div className="relative" style={{ width: 280, height: 280 }}>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  style={{ width: 280, height: 280, imageRendering: "auto", touchAction: "none" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 8,
                    border: "2px dashed rgba(0,0,0,0.25)",
                    pointerEvents: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传图标再编辑</Button>
            </Upload>
            <Button
              onClick={() => {
                setScale(1);
                setOffsetX(0);
                setOffsetY(0);
              }}
            >
              重置位置
            </Button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <Form
            layout="horizontal"
            labelCol={{ flex: "0 0 88px" }}
            wrapperCol={{ flex: "1 1 auto" }}
            labelAlign="left"
            colon={false}
            style={{ width: "100%" }}
          >
            <Form.Item label="遮罩" style={{ marginBottom: 12 }}>
              <Radio.Group value={maskType} onChange={(e) => setMaskType(e.target.value)}>
                <Radio.Button value="none">无</Radio.Button>
                <Radio.Button value="rounded">圆角</Radio.Button>
                <Radio.Button value="circle">圆形</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {maskType === "rounded" && (
              <Form.Item label="圆角" style={{ marginBottom: 12 }}>
                <Slider
                  style={{ width: "100%" }}
                  min={0}
                  max={128}
                  value={roundedRadius}
                  onChange={(v) => setRoundedRadius(v as number)}
                />
              </Form.Item>
            )}

            <Form.Item label="背景" style={{ marginBottom: 12 }}>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">开启后可设置背景色</div>
                <Switch checked={backgroundEnabled} onChange={setBackgroundEnabled} />
              </div>
            </Form.Item>

            {backgroundEnabled && (
              <Form.Item label="背景色" style={{ marginBottom: 12 }}>
                <ColorPicker value={backgroundColor} onChange={(c) => setBackgroundColor(c.toHexString())} showText />
              </Form.Item>
            )}

            <Form.Item label="缩放" style={{ marginBottom: 12 }}>
              <Slider
                style={{ width: "100%" }}
                min={0.2}
                max={3}
                step={0.01}
                value={scale}
                onChange={(v) => setScale(v as number)}
              />
            </Form.Item>

            <Form.Item label="水平偏移" style={{ marginBottom: 12 }}>
              <Slider
                style={{ width: "100%" }}
                min={-160}
                max={160}
                step={1}
                value={offsetX}
                onChange={(v) => setOffsetX(v as number)}
              />
            </Form.Item>

            <Form.Item label="垂直偏移" style={{ marginBottom: 12 }}>
              <Slider
                style={{ width: "100%" }}
                min={-160}
                max={160}
                step={1}
                value={offsetY}
                onChange={(v) => setOffsetY(v as number)}
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default IconEditorModal;
