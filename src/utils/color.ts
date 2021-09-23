/*
 * @Author: Vir
 * @Date: 2021-08-01 18:32:30
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-01 18:34:10
 */

//  hex颜色转rgba颜色
export const hexToRgba = (hex: string, opacity: number) => {
  let RGBA =
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')';
  return {
    red: parseInt('0x' + hex.slice(1, 3)),
    green: parseInt('0x' + hex.slice(3, 5)),
    blue: parseInt('0x' + hex.slice(5, 7)),
    rgba: RGBA,
  };
};
