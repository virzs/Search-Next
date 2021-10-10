/*
 * @Author: Vir
 * @Date: 2021-09-27 17:50:06
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-10 14:31:41
 */

// 验证是否为http/https链接
const isHttpLinkPattern =
  /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;

export const isHttpLink = {
  test: (value: string) => {
    return isHttpLinkPattern.test(value);
  },
  isHttpLinkPattern,
};

// 验证指定字符中的内容
export const isEmojiPattern = /:(\S*):/;

export const isEmoji = {
  test: (value: string) => {
    return isEmojiPattern.test(value);
  },
  match: (value: string) => {
    return value.match(isEmojiPattern);
  },
  isEmojiPattern,
};
