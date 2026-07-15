import FullPageContainer from "@/components/containter/full";
import { SmileOutlined } from "@ant-design/icons";
import { notification, Result } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { isTauri } from "@/utils/utils";
import { getToken } from "../../utils/token";
import { AuthPaths } from "../auth/router";

const HomeView = () => {
  const navigate = useNavigate();

  const checkIsLogin = () => {
    const token = getToken();
    if (!token && !isTauri()) {
      notification.error({
        message: "You are not logged in",
        description: "Please login to continue",
      });
      navigate(AuthPaths.login);
    }
  };

  useEffect(() => {
    checkIsLogin();
  }, []);

  return (
    <FullPageContainer
      showBackButton={false}
      cardProps={{
        bodyStyle: { padding: 0 },
      }}
    >
      <div className="flex h-full min-h-[420px] items-center justify-center px-6 text-center">
        <Result
          icon={<SmileOutlined style={{ color: "var(--ant-color-primary)" }} />}
          title="欢迎回来"
          subTitle="请从左侧菜单选择功能开始。"
        />
      </div>
    </FullPageContainer>
  );
};

export default HomeView;
