import { baseDeleteRequest, baseDetailRequest, baseGetRequest, basePostRequest, basePutRequest } from "@/utils/axios";
import type { PermissionItem } from "@/contexts/AccessContext";

export interface CurrentUserInfo {
  _id?: string;
  username?: string;
  email?: string;
  nickname?: string;
  avatar?: any;
  type?: number;
  roles?: any[];
  permissions?: PermissionItem[];
  isSuperAdmin?: boolean;
}

export interface UserRoleRecord {
  _id?: string;
  code?: string;
  name?: string;
  isSuperAdmin?: boolean;
}

export interface LegalConfirmationRecord {
  documentType: "terms" | "privacy";
  revisionId: string;
  consentVersion: number;
  firstConfirmedAt: string;
  lastConfirmedAt: string;
  confirmationCount: number;
  firstSource: "register" | "login" | "in_app";
  lastSource: "register" | "login" | "in_app";
  locale?: "zh-CN" | "en-US";
}

export interface UserRecord {
  _id: string;
  username: string;
  email: string;
  nickname?: string;
  type?: number;
  status?: number;
  enable?: boolean;
  integral?: number;
  avatar?: any;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  roles?: UserRoleRecord[];
  legalConfirmations?: LegalConfirmationRecord[];
}

// /users/me get
export const getCurrentUser = () => baseGetRequest<CurrentUserInfo>("/users/me")();

// /users get
export const getUsers = (params: any) =>
  baseGetRequest<{ data: UserRecord[]; total: number }>("/users")(params);

// /users post
export const postUsers = (data: any) => basePostRequest("/users")(data);

// /users/:id get
export const putUsers = (id: string, data: any) =>
  basePutRequest("/users")(id, data);

// 启用/禁用
// /users/status/{id} put
export const putEnable = (id: string, data?: any) =>
  basePutRequest("/users/enable")(id, data);

// /users/:id detail
export const getUserDetail = (id: string) =>
  baseDetailRequest<UserRecord>("/users")(id);

// /users/:id delete
export const deleteUser = (id: string) => baseDeleteRequest("/users")(id);

// /users/invitation-code get
export const getInvitationCode = (params: any) =>
  baseGetRequest("/users/invitation-code")(params);

// /users/invitation-code/invited-users get
export interface InvitationCodeInvitedUsersParams {
  codeId?: string;
  code?: string;
}

export interface InvitationCodeInvitedUser {
  _id?: string;
  username?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  createdAt?: string;
  code?: string;
  usedCode?: string;
  invitationCodeId?: string;
  invitationCode?: string | {
    _id?: string;
    code?: string;
    status?: number;
    useCount?: number;
    maxUse?: number;
    expire?: string;
    createdAt?: string;
  };
  user?: {
    _id?: string;
    username?: string;
    email?: string;
    nickname?: string;
  };
}

export const getInvitationCodeInvitedUsers = (params: InvitationCodeInvitedUsersParams = {}) =>
  baseGetRequest<InvitationCodeInvitedUser[]>("/users/invitation-code/invited-users")(params);

export const getInvitedUsers = getInvitationCodeInvitedUsers;

// /users/invitation-code/forbidden ut
export const putForbidden = (id: string, data?: any) =>
  basePutRequest("/users/invitation-code/forbidden")(id, data);

// /users/invitation-code/:id delete
export const deleteInvitationCode = (id: string) =>
  baseDeleteRequest("/users/invitation-code")(id);

// /users/invitation-code post
export const postInvitationCode = (data: any) =>
  basePostRequest("/users/invitation-code")(data);

// /users/statistics get
export const getUsersStatistics = () => baseGetRequest("/users/statistics")();

export interface UserRequestParams {
  keyWords: string;
}

/**
 * 搜索用户
 * /users/search get
 */
export const searchUsers = (params: UserRequestParams) =>
  baseGetRequest("/users/search")(params);
