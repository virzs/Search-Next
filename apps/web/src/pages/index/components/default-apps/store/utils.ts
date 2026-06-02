export const getWebsiteId = (item: any) => item?._id ?? item?.id ?? item?.name ?? item?.url ?? Math.random().toString(36);

export const getWebsiteName = (item: any) => item?.name ?? item?.title ?? "未命名";

export const getWebsiteIconUrl = (item: any) => item?.iconEdited?.url ?? item?.icon?.url ?? item?.iconUrl ?? item?.icon;

export const getWebsiteUrl = (item: any) => item?.url ?? item?.link ?? item?.href;

export type WebsiteCategory = {
  key: string;
  label: string;
  filter?: { classify?: string; tags?: string[] };
};

export const buildCategoriesFromItems = (items: any[]): WebsiteCategory[] => {
  const categories: WebsiteCategory[] = [];
  const existed = new Set<string>();

  const pushCategory = (cat: WebsiteCategory) => {
    if (!cat.key || existed.has(cat.key)) return;
    existed.add(cat.key);
    categories.push(cat);
  };

  for (const item of items) {
    const rawClassify =
      item?.classify ?? item?.classifyId ?? item?.category ?? item?.categoryId ?? item?.websiteClassify;

    if (rawClassify) {
      if (typeof rawClassify === "string") {
        pushCategory({
          key: `classify:${rawClassify}`,
          label: item?.classifyName ?? item?.categoryName ?? rawClassify,
          filter: { classify: rawClassify },
        });
      } else if (typeof rawClassify === "object") {
        const classifyId = rawClassify?._id ?? rawClassify?.id ?? rawClassify?.value ?? rawClassify?.key ?? rawClassify?.name;
        const classifyName = rawClassify?.name ?? rawClassify?.title ?? rawClassify?.label ?? classifyId;
        if (classifyId) {
          pushCategory({
            key: `classify:${String(classifyId)}`,
            label: String(classifyName ?? classifyId),
            filter: { classify: String(classifyId) },
          });
        }
      }
    }

    const tags = item?.tags;
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        if (typeof tag === "string" && tag.trim()) {
          pushCategory({ key: `tag:${tag}`, label: tag, filter: { tags: [tag] } });
        } else if (typeof tag === "object" && tag) {
          const tagId = tag?._id ?? tag?.id ?? tag?.value ?? tag?.key ?? tag?.name;
          const tagName = tag?.name ?? tag?.title ?? tag?.label ?? tagId;
          if (tagId) {
            pushCategory({ key: `tag:${String(tagId)}`, label: String(tagName ?? tagId), filter: { tags: [String(tagId)] } });
          }
        }
      }
    }
  }

  return categories;
};

export const fallbackCategories: WebsiteCategory[] = [
  { key: "classify:productivity", label: "效率", filter: { classify: "productivity" } },
  { key: "classify:dev", label: "开发", filter: { classify: "dev" } },
  { key: "classify:ai", label: "AI", filter: { classify: "ai" } },
  { key: "classify:design", label: "设计", filter: { classify: "design" } },
  { key: "classify:news", label: "资讯", filter: { classify: "news" } },
  { key: "classify:video", label: "视频", filter: { classify: "video" } },
];
