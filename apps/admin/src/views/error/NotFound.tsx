import { Button } from "antd";
import { useNavigate } from "react-router";
import { HomeOutlined, RollbackOutlined } from "@ant-design/icons";
import FullPageContainer from "@/components/containter/full";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <FullPageContainer showBackButton={false}>
      <div className="flex flex-col items-center justify-center h-full px-4">
        {/* 自定义404图标 */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-gray-300 mb-4 select-none">404</div>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* 错误信息 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-700 mb-2">页面未找到</h1>
          <p className="text-gray-500 text-base max-w-md">
            抱歉，您访问的页面不存在或已被移动。请检查URL是否正确，或返回首页继续浏览。
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 flex-wrap justify-center">
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate("/")} className="px-6 py-2 h-auto">
            返回首页
          </Button>
          <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)} className="px-6 py-2 h-auto">
            返回上页
          </Button>
        </div>

        {/* 装饰元素 */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-400 rounded-full opacity-80 animate-pulse delay-500"></div>
      </div>
    </FullPageContainer>
  );
};

export default NotFound;
