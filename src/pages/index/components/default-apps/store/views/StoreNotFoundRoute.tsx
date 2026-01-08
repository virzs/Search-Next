import { Button, Empty } from "antd";
import { useLocation, useNavigate } from "react-router";

const StoreNotFoundRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Empty description="页面不存在" />
        <div className="mt-4 flex justify-center">
          <Button
            type="primary"
            onClick={() => navigate("/store/website", { replace: true })}
          >
            返回应用商店
          </Button>
        </div>
        <div className="mt-3 text-center text-xs text-gray-500 break-all">
          {location.pathname}
        </div>
      </div>
    </div>
  );
};

export default StoreNotFoundRoute;
