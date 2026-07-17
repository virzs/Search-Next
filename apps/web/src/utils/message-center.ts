export type MessageCenterTab = "notifications" | "versions";

export interface OpenWebMessageCenterDetail {
  tab?: MessageCenterTab;
  recordId?: string;
}

export const OPEN_WEB_MESSAGE_CENTER_EVENT =
  "search-next:open-web-message-center";

export const openWebMessageCenter = (
  detail: OpenWebMessageCenterDetail = {},
) => {
  window.dispatchEvent(
    new CustomEvent<OpenWebMessageCenterDetail>(
      OPEN_WEB_MESSAGE_CENTER_EVENT,
      { detail },
    ),
  );
};
