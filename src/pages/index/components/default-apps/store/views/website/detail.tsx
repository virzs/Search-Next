import { Button, Image } from "antd";
import { FC, useEffect, useRef } from "react";
import { RiExternalLinkLine } from "@remixicon/react";
import { getWebsiteIconUrl, getWebsiteName, getWebsiteUrl } from "../../utils";
import { AppContentContainer, useAppRouteContext } from "@/components";
import { useLocation, useNavigate } from "react-router";

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
    if (!item) navigate("/store/website", { replace: true });
  }, [item, navigate]);

  if (!item) return null;

  const iconUrl = getWebsiteIconUrl(item);
  const name = getWebsiteName(item);
  const url = getWebsiteUrl(item);

  return (
    <AppContentContainer className="h-full" animate onBack={() => navigate(-1)}>
      <div className="max-w-3xl mx-auto p-6 pt-0">
        <div className="flex flex-col items-center text-center mb-8 pt-8">
          <div className="relative mb-6">
            {iconUrl ? (
              <Image
                className="w-32! h-32! rounded-3xl shadow-xl border-4 border-black/10 bg-white dark:border-white/10 dark:bg-white/10"
                src={iconUrl}
                preview={false}
              />
            ) : (
              <div className="w-32 h-32 rounded-3xl shadow-xl border-4 border-black/10 bg-gray-100 flex items-center justify-center text-5xl font-bold text-gray-400 dark:border-white/10 dark:bg-white/10 dark:text-white/60">
                {name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold  mb-2">{name}</h1>
          <p className=" text-sm mb-6 max-w-md break-all">{url}</p>

          <div className="flex gap-4 w-full max-w-xs">
            <Button
              type="primary"
              size="large"
              className="flex-1 rounded-full! h-12! text-base! font-semibold! shadow-lg shadow-orange-500/20 bg-[rgb(250,84,28)]!"
              onClick={() => onAddWebsite?.(item)}
            >
              获取
            </Button>
            <Button
              size="large"
              className="rounded-full! w-12! h-12! flex items-center justify-center ! ! hover:!"
              icon={<RiExternalLinkLine size={20} />}
              onClick={() => window.open(url, "_blank")}
            />
          </div>
        </div>

        <div className="border-t  pt-8">
          <h3 className="text-lg font-bold  mb-4">关于此应用</h3>
          <div className=" rounded-2xl p-6 border ">
            <p className=" leading-relaxed">
              这是一个简单快捷的网站快捷方式。添加到桌面后，您可以快速访问此网站。我们致力于为您提供最优质的网页应用体验。
            </p>

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

        <div className="mt-8">
          <h3 className="text-lg font-bold  mb-4">预览</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-64 h-40 shrink-0 rounded-2xl  border  flex items-center justify-center "
              >
                预览图 {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppContentContainer>
  );
};

export default WebsiteDetailView;
