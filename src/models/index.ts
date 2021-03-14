/*
 * @Author: Vir
 * @Date: 2021-03-14 19:59:19
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-14 20:13:29
 */

export default {
  namespace: '1',
  state: 1,
  reducers: {
    add(state: any, action: { payload: any }) {
      return state + action.payload;
    },
  },
};
