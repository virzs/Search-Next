import { Button, Empty } from "antd";
import { FC, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppRouteContext } from "@/components";
import WebsiteDetailView from "./WebsiteDetailView";

type StoreOutletContext = {
  onAddWebsite?: (site: any) => void;
};

const WebsiteDetailRoute: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onAddWebsite } = useAppRouteContext<StoreOutletContext>();
  const stateItem = (location.state as any)?.item ?? null;
  const itemRef = useRef<any>(stateItem);
  if (!itemRef.current && stateItem) itemRef.current = stateItem;
  const item = itemRef.current;

  const handleBack = () => navigate(-1);
  const handleAdd = (site: any) => onAddWebsite?.(site);

  return (
    <>
      {item ? (
        <WebsiteDetailView item={item} onBack={handleBack} onAdd={handleAdd} />
      ) : (
        <div className="h-full flex flex-col">
          <div className="shrink-0 p-4">
            <Button onClick={handleBack}>返回</Button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Empty description="未找到该网站" />
          </div>
        </div>
      )}
    </>
  );
};

export default WebsiteDetailRoute;
