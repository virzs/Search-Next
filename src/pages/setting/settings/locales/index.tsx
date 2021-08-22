/*
 * @Author: Vir
 * @Date: 2021-06-16 14:36:35
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-16 14:47:58
 */

import ContentHeader from '@/components/global/menu-layout/contentHeader';
import LocalesItem from './locales';

const Locales: React.FC = () => {
  return (
    <div>
      <ContentHeader title="语言" />
      <div>
        <LocalesItem />
      </div>
    </div>
  );
};

export default Locales;
