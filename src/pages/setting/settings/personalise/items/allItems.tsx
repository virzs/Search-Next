/*
 * @Author: Vir
 * @Date: 2021-06-11 09:16:33
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-11 10:08:59
 */

import BackgroundItem from './background';

export default [
  {
    id: '77160560b36b44b5bf7178b8b37a9df2',
    name: '背景',
    component: <BackgroundItem />,
  },
] as {
  id: string;
  name: string;
  component: React.ReactNode | Element;
}[];
