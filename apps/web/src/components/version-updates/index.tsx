import { RiArrowRightUpLine } from "@remixicon/react";
import { SimpleEditorViewer } from "zs_library";
import { useI18n } from "@/i18n";
import type { VersionUpdateItem } from "@/services/system";
import { normalizeVersionUpdateContent } from "./format";
import { AppButton } from "@/components/ui";

export interface VersionUpdateBodyProps {
  update: VersionUpdateItem;
  className?: string;
  viewerClassName?: string;
  footerClassName?: string;
}

export const VersionUpdateBody = ({
  update,
  className,
  viewerClassName,
  footerClassName,
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
          <AppButton
            intent="primary"
            size="small"
            href={update.releaseUrl}
            target="_blank"
            rel="noreferrer"
            icon={<RiArrowRightUpLine size={15} />}
          >
            {t("ui.notice.viewRelease")}
          </AppButton>
        </footer>
      ) : null}
    </div>
  );
};
