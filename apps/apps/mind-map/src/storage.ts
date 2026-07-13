import type { AppSDK } from "./types";
import { createStore, DEFAULT_SETTINGS, validateDocument } from "./model";
import type { MindMapStoreV1 } from "./model";

export const STORE_KEY = "mindMapStore.v1";

export async function readStore(sdk?: AppSDK): Promise<MindMapStoreV1> {
  const language = sdk?.getLocale?.().language || sdk?.locale?.language || "zh-CN";
  let raw: unknown;
  try { raw = sdk?.storage ? await sdk.storage.get(STORE_KEY) : localStorage.getItem(`search-next:${STORE_KEY}`); } catch { return createStore(language); }
  if (!raw) return createStore(language);
  try {
    const value = (typeof raw === "string" ? JSON.parse(raw) : raw) as Partial<MindMapStoreV1>;
    if (value.schemaVersion !== 1 || !Array.isArray(value.documents)) return createStore(language);
    const documents = value.documents.map(validateDocument).filter((item): item is NonNullable<typeof item> => Boolean(item));
    if (!documents.length) return createStore(language);
    const activeDocumentId = documents.some((item) => item.id === value.activeDocumentId) ? value.activeDocumentId! : documents[0].id;
    return { schemaVersion: 1, activeDocumentId, documents, settings: { ...DEFAULT_SETTINGS, ...(value.settings || {}) } };
  } catch { return createStore(language); }
}

export async function writeStore(store: MindMapStoreV1, sdk?: AppSDK) {
  const serialized = JSON.stringify(store);
  if (sdk?.storage) return sdk.storage.set(STORE_KEY, serialized);
  localStorage.setItem(`search-next:${STORE_KEY}`, serialized);
}
