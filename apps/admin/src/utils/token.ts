export const getToken = () => {
  return localStorage.getItem("token");
};

export const setToken = (token: string) => {
  return localStorage.setItem("token", token);
};

export const removeToken = () => {
  return localStorage.removeItem("token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

export const setRefreshToken = (refreshToken: string) => {
  return localStorage.setItem("refreshToken", refreshToken);
};

export const removeRefreshToken = () => {
  return localStorage.removeItem("refreshToken");
};
