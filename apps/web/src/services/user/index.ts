import type { UserInfo } from "@/types/auth";
import {
  baseDeleteRequestNoId,
  basePutRequestNoId,
} from "@/utils/axios";

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  currentPassword: string;
  confirmation: string;
}

export const updateMyProfile = (username: string) =>
  basePutRequestNoId<UserInfo>("/users/me/profile")({ username });

export const changeMyPassword = (data: ChangePasswordRequest) =>
  basePutRequestNoId<{ success: boolean }>("/users/me/password")(data);

export const deleteMyAccount = (data: DeleteAccountRequest) =>
  baseDeleteRequestNoId<{ success: boolean }>("/users/me")(data);
