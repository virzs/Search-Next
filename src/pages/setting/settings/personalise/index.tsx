/*
 * @Author: Vir
 * @Date: 2021-06-10 11:42:27
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-12 21:31:53
 */

import ContentHeader from '../components/contentHeader';
import allItems from './items/allItems';

const Personalise: React.FC = () => {
  return (
    <div>
      <ContentHeader title="自定义主页" />
      {allItems.map((i) => (
        <div key={i.id}>{i.component}</div>
      ))}
    </div>
  );
};

export default Personalise;
