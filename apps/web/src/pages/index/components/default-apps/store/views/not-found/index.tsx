import { Empty } from "antd";
import { useLocation, useNavigate } from "react-router";
import { storeRoute } from "../../route-paths";
import { useI18n } from "@/i18n";
import { AppButton } from "@/components/ui";

const StoreNotFoundRoute = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Empty description={t("ui.pageNotFound")} />
        <div className="mt-4 flex justify-center">
          <AppButton
            intent="primary"
            size="default"
            onClick={() => navigate(storeRoute.path.website.root, { replace: true })}
          >
            {t("ui.backToAppStore")}
          </AppButton>
        </div>
        <div className="mt-3 text-center text-xs text-gray-500 break-all">
          {location.pathname}
        </div>
      </div>
    </div>
  );
};

export default StoreNotFoundRoute;
