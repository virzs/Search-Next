import { Button, Card, Image } from "antd";
import { FC, useEffect, useRef } from "react";
import { RiExternalLinkLine } from "@remixicon/react";
import { DefaultAppView, useAppRouteContext } from "@/components";
import { useLocation, useNavigate } from "react-router";
import { storeRoute } from "../../route-paths";

type StoreOutletContext = {
  onAddWebsite?: (site: any) => void;
};

const WebsiteDetailView: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onAddWebsite } = useAppRouteContext<StoreOutletContext>();
  const stateItem = (location.state as any)?.item ?? null;
  const itemRef = useRef<any>(stateItem);
  if (!itemRef.current && stateItem) itemRef.current = stateItem;
  const item = itemRef.current;

  useEffect(() => {
    if (!item) navigate(storeRoute.path.website.root, { replace: true });
  }, [item, navigate]);

  if (!item) return null;

  const iconUrl = item.icon?.url;

  return (
    <DefaultAppView className="h-full" animate>
      <Card className="min-h-full">
        <div className="flex items-center text-center mb-8 gap-4">
          <div className="relative mb-6">
            {iconUrl ? (
              <Image
                className="w-24! h-24! rounded-3xl shadow-xl border-4 border-black/10 bg-white dark:border-white/10 dark:bg-white/10"
                src={iconUrl}
                preview={false}
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl shadow-xl border-4 border-black/10 bg-gray-100 flex items-center justify-center text-5xl font-bold text-gray-400 dark:border-white/10 dark:bg-white/10 dark:text-white/60">
                {item.name}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
            <p className="text-sm mb-6 max-w-md break-all">{item.url}</p>
            <div className="flex gap-4 w-full max-w-xs">
              <Button type="primary" onClick={() => onAddWebsite?.(item)}>
                获取
              </Button>
              <Button
                icon={<RiExternalLinkLine size={20} />}
                onClick={() => window.open(item.url, "_blank")}
              />
            </div>
          </div>
        </div>
        <div className="border-pt-4">
          <h3 className="text-lg font-bold  mb-4">关于此应用</h3>
          <div>
            <p className=" leading-relaxed">{item.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {item?.tags?.map((tag: any) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs"
                >
                  {typeof tag === "string" ? tag : tag.name || tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </DefaultAppView>
  );
};

export default WebsiteDetailView;
