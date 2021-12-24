/*
 * @Author: Vir
 * @Date: 2021-10-08 21:27:04
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-09 17:26:45
 */
import { latest } from '@/apis/github';
import { LatestType } from '@/apis/github/interface';
import { Router } from '@/config/router';
import ContentList from '@/pages/setting/components/contentList';
import ItemAccordion, {
  AccordionDetailText,
} from '@/pages/setting/components/itemAccordion';
import ItemCard from '@/pages/setting/components/itemCard';

import { PageProps } from '@/typings';
import { getUA } from '@/utils/info';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const About: React.FC<PageProps> = ({ route, children, ...props }) => {
  const history = useNavigate();
  const location = useLocation();
  const [list, setList] = React.useState<Router[]>([]);
  const [ua, setUA] = React.useState({} as Bowser.Parser.ParsedResult);
  const [lastData, setLastData] = React.useState({} as LatestType);

  const getLast = () => {
    latest().then((res) => {
      setLastData(res.data);
    });
  };

  React.useEffect(() => {
    setList(route?.routes || []);
    setUA(getUA());
    getLast();
  }, []);

  return (
    <div>
      <ContentList>
        <ItemAccordion title="设备信息">
          <AccordionDetailText title="浏览器" value={ua.browser?.name} />
          <AccordionDetailText title="版本" value={ua.browser?.version} />
          <AccordionDetailText title="系统" value={ua.os?.name} />
        </ItemAccordion>
        <ItemAccordion title="版本信息">
          <AccordionDetailText
            title="版本"
            value={lastData.tag_name}
            href={lastData.html_url}
          />
          <AccordionDetailText title="更新日期" value={lastData.created_at} />
          <AccordionDetailText
            title="发布者"
            value={lastData.author?.login}
            href={lastData.author?.html_url}
          />
        </ItemAccordion>
      </ContentList>
      <ContentList title="更多">
        {list.map((i) => (
          <ItemCard
            key={i.path}
            title={i.title}
            icon={i.icon}
            onClick={() => history(i.path)}
          ></ItemCard>
        ))}
      </ContentList>
    </div>
  );
};

export default About;
