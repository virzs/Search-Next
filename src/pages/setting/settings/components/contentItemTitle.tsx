/*
 * @Author: Vir
 * @Date: 2021-06-12 21:35:35
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-12 21:41:04
 */

export interface ContentItemTitleProps {
  title: string;
  desc?: string;
}

const ContentItemTitle: React.FC<ContentItemTitleProps> = ({ title, desc }) => {
  return (
    <div className="content-item-title-root">
      <p className="item-title">{title}</p>
      {desc && <p className="item-title-desc">{desc}</p>}
    </div>
  );
};

export default ContentItemTitle;
