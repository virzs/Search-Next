/*
 * @Author: Vir
 * @Date: 2022-05-12 16:33:16
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-12 16:47:44
 */

export interface GetCurrentPositionResult {
  latitude: number;
  longitude: number;
}

/**
 * 判断 geolocation api 是否可用
 * @returns boolean
 */
export const checkGeolocation = navigator.geolocation;

/**
 * GeoLocation API 获取当前位置
 * @returns Promise<{ latitude, longitude }>
 */
export const getCurrentPosition = (): Promise<GetCurrentPositionResult> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!position) reject();
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      (err) => {
        reject(err);
      },
    );
  });
};

/**
 * 查询 geolocation 权限状态
 * @returns status
 */
export const getPermissionStatus = (): Promise<PermissionState> => {
  return new Promise((resolve, reject) => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          resolve(status.state);
        })
        .catch((err) => reject(err));
    } else {
      reject('navigator.permissions.query is undefined');
    }
  });
};

const geolocation = {
  checkGeolocation,
  getCurrentPosition,
  getPermissionStatus,
};

export default geolocation;
