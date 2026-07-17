import { Button } from "antd";
import { RiArrowRightUpLine } from "@remixicon/react";
import { SimpleEditorViewer } from "zs_library";
import { useI18n } from "@/i18n";
import type { VersionUpdateItem } from "@/services/system";
import { normalizeVersionUpdateContent } from "./format";

export interface VersionUpdateBodyProps {
  update: VersionUpdateItem;
  className?: string;
  viewerClassName?: string;
  footerClassName?: string;
  buttonClassName?: string;
}

export const VersionUpdateBody = ({
  update,
  className,
  viewerClassName,
  footerClassName,
  buttonClassName,
}: VersionUpdateBodyProps) => {
  const { t } = useI18n();
  const content = normalizeVersionUpdateContent(
    update,
    t("ui.notice.whatsNew"),
  );

  return (
    <div className={className}>
      <SimpleEditorViewer
        value={content}
        sanitize
        className={viewerClassName}
      />
      {update.releaseUrl ? (
        <footer className={footerClassName}>
          <Button
            className={buttonClassName}
            type="primary"
            shape="round"
            href={update.releaseUrl}
            target="_blank"
            rel="noreferrer"
            icon={<RiArrowRightUpLine size={15} />}
          >
            {t("ui.notice.viewRelease")}
          </Button>
        </footer>
      ) : null}
    </div>
  );
};
