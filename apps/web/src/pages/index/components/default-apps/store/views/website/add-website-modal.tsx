import { DesktopNextBaseModal } from "zs_library";
import { Button, Form, Input, theme as antdTheme } from "antd";
import { RiGlobalLine } from "@remixicon/react";
import type { CSSProperties, FC } from "react";
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";
import useDesktopTheme from "@/hooks/useDesktopTheme";

export type AddWebsitePayload = {
  name: string;
  url: string;
  icon?: { url: string };
};

export interface AddWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (site: AddWebsitePayload) => void;
}

type AddWebsiteFormValues = {
  name: string;
  url: string;
  iconUrl?: string;
};

const AddWebsiteModal: FC<AddWebsiteModalProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const { t } = useI18n();
  const { resolvedColorScheme } = useDesktopTheme();
  const { token } = antdTheme.useToken();
  const [form] = Form.useForm<AddWebsiteFormValues>();
  const isDark = resolvedColorScheme === "dark";

  const handleClose = () => {
    (form as any).resetFields();
    onClose();
  };

  const modalThemeStyle = {
    "--website-modal-accent": token.colorPrimary,
    "--website-modal-text": isDark ? "#f5f5f7" : "#1d1d1f",
    "--website-modal-secondary": isDark ? "#aeaeb2" : "#6e6e73",
    "--website-modal-tertiary": "#8e8e93",
    "--website-modal-surface": isDark
      ? "rgba(255,255,255,0.07)"
      : "rgba(118,118,128,0.08)",
    "--website-modal-input": isDark
      ? "rgba(255,255,255,0.09)"
      : "rgba(255,255,255,0.88)",
    "--website-modal-separator": isDark
      ? "rgba(235,235,245,0.14)"
      : "rgba(60,60,67,0.13)",
  } as CSSProperties;

  return (
    <DesktopNextBaseModal
      visible={open}
      onClose={handleClose}
      width={468}
      destroyOnClose
      styles={{
        overlay: {
          background: isDark
            ? "rgba(0,0,0,0.42)"
            : "rgba(20,20,24,0.24)",
          backdropFilter: "blur(5px) saturate(1.04)",
        },
        panel: {
          overflow: "hidden",
          borderRadius: 22,
          border: isDark
            ? "1px solid rgba(235,235,245,0.16)"
            : "1px solid rgba(255,255,255,0.78)",
          background: isDark
            ? "rgba(28,28,30,0.94)"
            : "rgba(247,247,249,0.94)",
          backdropFilter: "blur(32px) saturate(1.32)",
          boxShadow: isDark
            ? "0 28px 80px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 28px 80px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.9)",
        },
        body: { padding: 0 },
        inner: {
          width: "100%",
          maxHeight: "calc(100dvh - 64px)",
          overflowY: "auto",
          overscrollBehavior: "contain",
        },
      }}
    >
      <div
        className={`w-full min-h-full ${appleFormModalClassName}`}
        style={modalThemeStyle}
      >
        <div className="apple-modal-heading">
          <div className="apple-modal-icon" aria-hidden="true">
            <RiGlobalLine size={21} />
          </div>
          <div className="min-w-0">
            <h2>{t("ui.addWebsite")}</h2>
            <p>{t("ui.addWebsiteDescription")}</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => {
            const site: AddWebsitePayload = {
              name: values.name,
              url: values.url,
              icon: values.iconUrl ? { url: values.iconUrl } : undefined,
            };
            onAdd?.(site);
            handleClose();
          }}
        >
          <Form.Item
            name="name"
            label={
              <span>
                {t("ui.name")}
                <b aria-hidden="true">*</b>
              </span>
            }
            rules={[{ required: true, message: t("ui.enterWebsiteName") }]}
          >
            <Input placeholder={t("ui.exampleMyFavoriteSite")} />
          </Form.Item>
          <Form.Item
            name="url"
            label={
              <span>
                {t("ui.uRL")}
                <b aria-hidden="true">*</b>
              </span>
            }
            rules={[
              { required: true, message: t("ui.enterWebsiteURL") },
              { type: "url", message: t("ui.enterValidWebsiteURL") },
            ]}
          >
            <Input placeholder={t("ui.exampleHttpExampleCom")} />
          </Form.Item>
          <Form.Item
            name="iconUrl"
            className="apple-last-field"
            label={
              <span>
                {t("ui.iconURL")}
                <em>{t("ui.optional")}</em>
              </span>
            }
            rules={[{ type: "url", message: t("ui.enterValidIconURL") }]}
          >
            <Input placeholder={t("ui.exampleHttpExampleComIconPng")} />
          </Form.Item>
          <div className="apple-modal-actions">
            <Button className="apple-secondary" onClick={handleClose}>
              {t("ui.cancel")}
            </Button>
            <Button
              type="primary"
              className="apple-primary"
              onClick={() => (form as any).submit()}
            >
              {t("ui.add")}
            </Button>
          </div>
        </Form>
      </div>
    </DesktopNextBaseModal>
  );
};

export default AddWebsiteModal;

const appleFormModalClassName = css`
  padding: 28px;
  color: var(--website-modal-text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "PingFang SC", "Helvetica Neue", sans-serif;
  letter-spacing: 0;

  .apple-modal-heading {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
  }

  .apple-modal-icon {
    display: grid;
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--website-modal-accent) 18%, transparent);
    border-radius: 12px;
    background: color-mix(in srgb, var(--website-modal-accent) 12%, transparent);
    color: var(--website-modal-accent);
  }

  h2 {
    margin: 0;
    color: var(--website-modal-text);
    font-size: 21px;
    font-weight: 650;
    line-height: 26px;
    letter-spacing: -0.012em;
  }

  .apple-modal-heading p {
    margin: 3px 0 0;
    color: var(--website-modal-secondary);
    font-size: 13px;
    line-height: 19px;
  }

  .ant-form-item {
    margin-bottom: 17px;
  }

  .apple-last-field {
    margin-bottom: 0;
  }

  .ant-form-item-label > label {
    height: auto;
    color: var(--website-modal-text);
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
  }

  .ant-form-item-label > label > span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .ant-form-item-label b {
    color: var(--website-modal-accent);
    font-size: 13px;
  }

  .ant-form-item-label em {
    color: var(--website-modal-tertiary);
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
  }

  .ant-input {
    height: 42px;
    border-color: var(--website-modal-separator);
    border-radius: 11px;
    background: var(--website-modal-input);
    color: var(--website-modal-text);
    font-size: 14px;
    line-height: 20px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    transition:
      border-color 140ms ease,
      box-shadow 140ms ease,
      background-color 140ms ease;
  }

  .ant-input::placeholder {
    color: var(--website-modal-tertiary);
  }

  .ant-input:hover,
  .ant-input:focus {
    border-color: color-mix(in srgb, var(--website-modal-accent) 54%, transparent);
    background: var(--website-modal-input);
  }

  .ant-input:focus,
  .ant-input-focused {
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--website-modal-accent) 16%, transparent);
  }

  .ant-form-item-explain-error {
    padding-top: 3px;
    font-size: 12px;
    line-height: 17px;
  }

  .apple-modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px solid var(--website-modal-separator);
  }

  .apple-modal-actions .ant-btn {
    min-width: 74px;
    height: 36px;
    border-radius: 10px;
    padding-inline: 17px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: none;
    transition:
      transform 100ms ease-out,
      background-color 140ms ease,
      border-color 140ms ease;
  }

  .apple-modal-actions .ant-btn:active {
    transform: scale(0.97);
  }

  .apple-secondary {
    border-color: var(--website-modal-separator) !important;
    background: var(--website-modal-surface) !important;
    color: var(--website-modal-text) !important;
  }

  .apple-primary {
    border-color: var(--website-modal-accent) !important;
    background: var(--website-modal-accent) !important;
    color: #fff !important;
  }

  @media (max-width: 520px) {
    padding: 24px 20px 20px;

    .apple-modal-heading {
      align-items: flex-start;
      margin-bottom: 22px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ant-input,
    .apple-modal-actions .ant-btn {
      transition: none;
    }
  }
`;
