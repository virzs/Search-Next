/*
 * @Author: Vir
 * @Date: 2021-06-11 09:16:33
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-18 11:45:55
 */

import BackgroundItem from './background';
import FeaturesItem from './features';

export default [
  {
    id: '77160560b36b44b5bf7178b8b37a9df2',
    name: '背景',
    component: <BackgroundItem />,
  },
  {
    id: 'eadcaa70b2cd40839fb759da88d552ba',
    name: '功能',
    component: <FeaturesItem />,
  },
] as {
  id: string;
  name: string;
  component: React.ReactNode | Element;
}[];
