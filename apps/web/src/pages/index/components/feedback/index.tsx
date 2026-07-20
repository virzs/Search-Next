import { RiFeedbackFill } from "@remixicon/react";
import { Tooltip } from "antd";
import { useI18n } from "@/i18n";
import { AppIconButton } from "@/components/ui";

const Feedback = () => {
  const { t } = useI18n();
  return (
    <div>
      <Tooltip title={t("ui.feedback")}>
        <AppIconButton
          aria-label={t("ui.feedback")}
          intent="quiet"
          size="small"
          icon={
            <RiFeedbackFill className="mt-0.5 -mb-0.5" color="#fff" size={20} />
          }
          href="https://github.com/virzs/Search-Next/issues/new"
        />
      </Tooltip>
    </div>
  );
};

export default Feedback;
