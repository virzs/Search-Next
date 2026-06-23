// 0:未验证邮箱 1:正常 2:禁用 用户状态
export const UserStatusMap: {
  [x: number]: {
    label: string;
    color: string;
  };
} = {
  0: {
    label: "未验证邮箱",
    color: "orange",
  },
  1: {
    label: "正常",
    color: "green",
  },
  2: {
    label: "禁用",
    color: "red",
  },
};

export const getUserStatusLabel = (status: number) => {
  return UserStatusMap[status]?.label;
};

export const getUserStatusColor = (status: number) => {
  return UserStatusMap[status]?.color;
};

export const InvitationCodeStatusMap: {
  [x: number]: {
    label: string;
    color: string;
  };
} = {
  0: {
    label: "生效中",
    color: "green",
  },
  1: {
    label: "已失效",
    color: "red",
  },
  2: {
    label: "已禁用",
    color: "",
  },
};

export const getInvitationCodeStatusLabel = (status: number) => {
  return InvitationCodeStatusMap[status]?.label;
};

export const getInvitationCodeStatusColor = (status: number) => {
  return InvitationCodeStatusMap[status]?.color;
};
