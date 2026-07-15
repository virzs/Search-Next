import FullPageContainer from "@/components/containter/full";
import { Button } from "antd";
import { HomeOutlined, RollbackOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <FullPageContainer showBackButton={false}>
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 text-8xl font-bold text-gray-300 select-none">403</div>
        <h1 className="mb-2 text-2xl font-semibold text-gray-800">没有权限</h1>
        <p className="mb-8 max-w-md text-base text-gray-500">
          当前账号无权访问该页面或执行该操作，请联系管理员调整角色权限。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate("/")}>
            返回首页
          </Button>
          <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)}>
            返回上页
          </Button>
        </div>
      </div>
    </FullPageContainer>
  );
};

export default Forbidden;
