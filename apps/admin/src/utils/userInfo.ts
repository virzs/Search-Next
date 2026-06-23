export const getUserInfo = () => {
  return JSON.parse(localStorage.getItem("userInfo") ?? "{}");
};

export const setUserInfo = (userInfo: any) => {
  return localStorage.setItem("userInfo", JSON.stringify(userInfo));
};

export const removeUserInfo = () => {
  return localStorage.removeItem("userInfo");
};
