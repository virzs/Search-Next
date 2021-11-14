/*
 * @Author: Vir
 * @Date: 2021-11-14 17:59:18
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-14 18:01:00
 */

// ! 引入第三方模块类型覆盖
// ! interface xxx extends Overwrite<baseProps, newProps> {}
export type Diff<T extends keyof any, U extends keyof any> = ({
  [P in T]: P;
} & {
  [P in U]: never;
} & { [x: string]: never })[T];
export type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;
