import { useNavigate } from "react-router";
import { getToken } from "../../utils/token";
import { useEffect } from "react";
import { notification } from "antd";
import { AuthPaths } from "../auth/router";
import { getUserInfo } from "../../utils/userInfo";
import { isTauri } from "@/utils/utils";

const HomeView = () => {
  const navigate = useNavigate();
  const userInfo = getUserInfo();

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

  return <div>{JSON.stringify(userInfo)}</div>;
};

export default HomeView;
