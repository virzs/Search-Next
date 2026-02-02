import { RiFeedbackFill } from "@remixicon/react";
import { Button, Tooltip } from "antd";

const Feedback = () => {
  return (
    <div>
      <Tooltip title="反馈">
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
