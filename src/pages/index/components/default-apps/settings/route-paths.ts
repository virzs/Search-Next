export const settingsRoute = {
  segment: {
    root: "settings",
    account: "account",
    thirdParty: "third-party",
    language: "language",
    backup: "backup",
    about: "about",
    wildcard: "*",
  },
  path: {
    root: "/settings",
    account: "/settings/account",
    thirdParty: "/settings/third-party",
    language: "/settings/language",
    backup: "/settings/backup",
    about: "/settings/about",
  },
} as const;

