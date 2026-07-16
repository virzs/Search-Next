import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
} from "@/utils/axios";

export interface NoticeCover {
  _id?: string;
  name: string;
  key: string;
  mimetype: string;
  dir: string;
  size: number;
  url: string;
  service?: string;
}

export interface NoticeRequest {
  _id?: string;
  key: string;
  title: string;
  content: string;
  cover?: NoticeCover;
  effectiveStart?: string;
  effectiveEnd?: string;
  enable?: boolean;
}

export interface NoticeInboxItem {
  _id: string;
  title: string;
  content: string;
  effectiveStart?: string;
  effectiveEnd?: string;
  createdAt?: string;
  sourceKey?: string;
  sourceUrl?: string;
}

export const getNotice = async (params: any) => {
  return baseGetRequest("/system/notice")(params);
};

export const postNotice = async (data: NoticeRequest) => {
  return basePostRequest("/system/notice")(data);
};

export const putNotice = async (id: string, data: NoticeRequest) => {
  return basePutRequest("/system/notice")(id, data);
};

export const deleteNotice = async (id: string) => {
  return baseDeleteRequest("/system/notice")(id);
};

export const detailNotice = async (id: string) => {
  return baseDetailRequest("/system/notice")(id);
};

export const getNoticeInbox = async (key = "admin") => {
  return baseGetRequest<NoticeInboxItem[]>("/system/notice/inbox")({ key });
};
