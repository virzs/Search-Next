export const accountRoute = {
  segment: {
    root: "account",
    login: "login",
    register: "register",
    profile: "profile",
    wildcard: "*",
  },
  path: {
    root: "/account",
    login: "/account/login",
    register: "/account/register",
    profile: "/account/profile",
  },
} as const;
