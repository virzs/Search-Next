import { DefaultAppView } from "@/components";
import { useMemo, useState, useEffect } from "react";
import { Button, Empty } from "antd";
import { RiAddLine } from "@remixicon/react";
import { useLocation, useNavigate } from "react-router";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import PreviewCard from "../components/PreviewCard";
import { MY_WALLPAPERS_STORAGE_KEY } from "@/utils/storage";
import { themeRoute } from "../route-paths";

type MyWallpaperItem =
  | {
      id: string;
      type: "gradient";
      name: string;
      css: string;
      createdAt: string;
    }
  | {
      id: string;
      type: "image";
      name: string;
      url: string;
      createdAt: string;
    };

const parseMyWallpapersStorage = (raw: string | null): MyWallpaperItem[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object") return [];
  const record = parsed as Record<string, unknown>;
  if (record.version !== 1) return [];
  const items = record.items;
  if (!Array.isArray(items)) return [];
  return items.filter(Boolean) as MyWallpaperItem[];
};

const ThemeMyView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { personalization } = useDesktopTheme();
  const [items, setItems] = useState<MyWallpaperItem[]>([]);

  const reload = () => {
    try {
      setItems(
        parseMyWallpapersStorage(
          localStorage.getItem(MY_WALLPAPERS_STORAGE_KEY),
        ),
      );
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    reload();
  }, [location.key]);

  useEffect(() => {
    const handler = () => reload();
    window.addEventListener("storage", handler);
    window.addEventListener("search-next:my-wallpapers-changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("search-next:my-wallpapers-changed", handler);
    };
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return tb - ta;
    });
  }, [items]);

  const isActive = (item: MyWallpaperItem) => {
    if (item.type === "gradient") {
      return (
        personalization.wallpaper.type === "gradient" &&
        personalization.wallpaper.css === item.css
      );
    }
    return (
      personalization.wallpaper.type === "image" &&
      personalization.wallpaper.url === item.url
    );
  };

  return (
    <DefaultAppView
      title="我的"
      headerRight={
        <Button
          type="primary"
          shape="round"
          icon={<RiAddLine size={16} />}
          onClick={() => navigate(themeRoute.path.myCreate)}
        >
          添加
        </Button>
      }
      contentClassName="overflow-y-auto px-1 pb-4"
    >
      {sortedItems.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map((item) => {
            const active = isActive(item);
            const cover = (() => {
              if (item.type === "gradient") {
                const coverBackground = item.css
                  ? item.css
                  : "rgba(0,0,0,0.06)";
                return (
                  <div className="aspect-video">
                    <div
                      className="h-full w-full"
                      style={{ background: coverBackground }}
                    />
                  </div>
                );
              }
              const safeUrl = (item.url || "").replace(/"/g, '\\"');
              return (
                <div className="aspect-video">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.06)",
                      backgroundImage: `url("${safeUrl}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>
              );
            })();

            return (
              <PreviewCard
                key={item.id}
                active={active}
                title={item.name}
                description={
                  item.type === "gradient"
                    ? `${active ? "渐变 · 已应用" : "渐变"}`
                    : `${active ? "图片 · 已应用" : "图片"}`
                }
                onClick={() => navigate(themeRoute.path.myEdit(item.id))}
                cover={cover}
              />
            );
          })}
        </div>
      ) : (
        <div className="h-[240px] w-full flex items-center justify-center">
          <Empty description="暂无数据" />
        </div>
      )}
    </DefaultAppView>
  );
};

export default ThemeMyView;
