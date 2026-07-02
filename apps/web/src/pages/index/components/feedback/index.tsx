import { RiFeedbackFill } from "@remixicon/react";
import { Button, Tooltip } from "antd";
import { useI18n } from "@/i18n";

const Feedback = () => {
  const { t } = useI18n();
  return (
    <div>
      <Tooltip title={t("ui.feedback")}>
        <Button
          type="text"
          icon={
            <RiFeedbackFill className="mt-0.5 -mb-0.5" color="#fff" size={20} />
          }
          href="https://github.com/virzs/Search-Next/issues/new"
        ></Button>
      </Tooltip>
    </div>
  );
};

export default Feedback;
