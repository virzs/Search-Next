/*
 * @Author: Vir
 * @Date: 2021-09-27 17:50:06
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-27 17:50:27
 */

// 验证是否为http/https链接
const pattern =
  /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;

export const isHttpLink = {
  test: (value: string) => {
    return pattern.test(value);
  },
  pattern,
};
