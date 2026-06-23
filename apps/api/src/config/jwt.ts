import type { StringValue } from 'ms';

type ExpireValue = number | StringValue;

export const jwtConfig: {
  accessToken: {
    secret: string;
    expiresIn: ExpireValue;
  };
  refreshToken: {
    expiresIn: ExpireValue;
    maxDevices: number;
  };
} = {
  accessToken: {
    secret: 'xxxx',
    expiresIn: '10m',
  },
  refreshToken: {
    expiresIn: '7d',
    maxDevices: 3, // 最大设备数
  },
};
