/*
 * @Author: Vir
 * @Date: 2021-12-02 09:16:49
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-08 23:02:12
 */

import dayjs from 'dayjs';

export interface Log {
  msgs: string[];
  styles: string[];
}

export const log: Log[] = [
  {
    msgs: [
      `
     _    _      _ _        __          __        _     _
    | |  | |    | | |       \\ \\        / /       | |   | |
    | |__| | ___| | | ___    \\ \\  /\\  / /__  _ __| | __| |
    |  __  |/ _ \\ | |/ _ \\    \\ \\/  \\/ / _ \\| '__| |/ _\` |
    | |  | |  __/ | | (_) |     \\  /\  / (_) | |  | | (_| |
    |_|  |_|\\___|_|_|\\___/      \\/  \\/ \\___/|_|  |_|\\__,_|
                                                          `,
    `
    ©2018-${dayjs().format('YYYY')} by Vir. All rights reserved.
    `,
    ],
    styles: [
      `
      color: green;
    `,
      `
      color: red;
    `,
    ],
  },
];

export const randomLog = (open: boolean = false) => {
  const count = Math.floor(Math.random() * log.length);
  const data = log[count];
  if (data) {
    const msgs = data.msgs.map((i) => `%c${i} \n `).join(' ');
    const styles = data.styles;
    if (open) {
      console.log(msgs, ...styles);
    }
  }
};
