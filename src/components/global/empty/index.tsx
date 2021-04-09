/*
 * @Author: Vir
 * @Date: 2021-04-08 17:38:42
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-08 17:48:25
 */

import React from 'react';
import { useIntl } from 'react-intl';

type EmptyType = 'table' | 'list' | '' | undefined;

export interface EmptyPropTypes {
  image?: React.ReactNode; //图片
  type?: EmptyType; //类型
  description?: React.ReactNode; //无数据文本
  children?: React.ReactNode;
}

const Empty: React.FC<EmptyPropTypes> = ({
  image,
  type,
  description,
  children,
}) => {
  const { formatMessage } = useIntl();
  const typeImage = new Map([
    [
      'table',
      <svg
        className="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="7798"
        width="128"
        height="128"
      >
        <path
          d="M743.68 176.61952h-448l-220.16 240.52736v345.6c0 56.54528 45.85472 102.4 102.4 102.4h683.52c56.54528 0 102.4-45.85472 102.4-102.4v-345.6l-220.16-240.52736z m-416.43008 71.68h384.8704l176.52736 192.8704h-193.87392c0 0.28672 0.04096 0.57344 0.04096 0.84992 0 94.57664-76.94336 171.52-171.52 171.52-94.5664 0-171.52-76.94336-171.52-171.52 0-0.27648 0.04096-0.5632 0.0512-0.84992h-201.12384l176.54784-192.8704z m534.19008 545.16736h-683.52c-16.93696 0-30.72-13.78304-30.72-30.72v-249.89696h143.4112c30.33088 99.75808 123.02336 172.36992 232.69376 172.36992 109.68064 0 202.36288-72.61184 232.69376-172.36992h136.17152v249.89696a30.7712 30.7712 0 0 1-30.73024 30.72z"
          fill="#3E3A39"
          p-id="7799"
        ></path>
      </svg>,
    ],
    [
      'list',
      <svg
        className="icon"
        viewBox="0 0 1152 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="10485"
        width="128"
        height="128"
      >
        <path
          d="M1030.848 250.496L889.152 108.8c-4-4-9.248-5.952-14.528-5.952s-10.464 1.952-14.496 5.952L490.688 478.336v170.656h170.656L1030.848 279.456a20.512 20.512 0 0 0 0-28.96zM541.856 597.76v-83.264l83.264 83.264h-83.264z m129.024-26.624l-102.4-102.4 236.864-236.864 102.4 102.4-236.864 236.864z m273.056-273.056l-102.4-102.4 33.088-33.088 102.4 102.4-33.088 33.088z m-478.848 85.952h-307.2v51.2h307.2v-51.2zM704 230.432V110.944c0-18.848-15.264-34.144-34.144-34.144H89.632c-18.848 0-34.144 15.296-34.144 34.144V742.4c0 18.848 15.296 34.144 34.144 34.144h580.224c18.848 0 34.144-15.264 34.144-34.144v-51.168h-51.2v34.144l-546.112-0.032V128.032H652.8v102.432H704z m-119.52 0H157.856V281.6h426.624V230.432zM157.888 588.8h307.2v-51.168h-307.2V588.8z m682.656 136.544a34.144 34.144 0 1 1-68.32 0 34.144 34.144 0 0 1 68.32 0z m136.544 0a34.144 34.144 0 1 1-68.32 0 34.144 34.144 0 0 1 68.32 0z m119.456 0a34.144 34.144 0 1 1-68.32 0 34.144 34.144 0 0 1 68.32 0z"
          p-id="10486"
        ></path>
      </svg>,
    ],
  ]);
  const typeDesc = new Map([
    ['table', formatMessage({ id: 'app.component.empty.table_description' })],
    ['list', formatMessage({ id: 'app.component.empty.list.description' })],
  ]);
  const defaultSvg = (
    <svg
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="7798"
      width="128"
      height="128"
    >
      <path
        d="M743.68 176.61952h-448l-220.16 240.52736v345.6c0 56.54528 45.85472 102.4 102.4 102.4h683.52c56.54528 0 102.4-45.85472 102.4-102.4v-345.6l-220.16-240.52736z m-416.43008 71.68h384.8704l176.52736 192.8704h-193.87392c0 0.28672 0.04096 0.57344 0.04096 0.84992 0 94.57664-76.94336 171.52-171.52 171.52-94.5664 0-171.52-76.94336-171.52-171.52 0-0.27648 0.04096-0.5632 0.0512-0.84992h-201.12384l176.54784-192.8704z m534.19008 545.16736h-683.52c-16.93696 0-30.72-13.78304-30.72-30.72v-249.89696h143.4112c30.33088 99.75808 123.02336 172.36992 232.69376 172.36992 109.68064 0 202.36288-72.61184 232.69376-172.36992h136.17152v249.89696a30.7712 30.7712 0 0 1-30.73024 30.72z"
        fill="#3E3A39"
        p-id="7799"
      ></path>
    </svg>
  );
  const defaultDesc = formatMessage({ id: 'app.component.empty.description' });
  return (
    <div className="v-empty">
      <div className="empty-image">
        {image
          ? image
          : type
          ? typeImage.get(type)
            ? typeImage.get(type)
            : defaultSvg
          : defaultSvg}
      </div>
      <div className="empty-description">
        {description
          ? description
          : type
          ? typeDesc.get(type)
            ? typeDesc.get(type)
            : defaultDesc
          : defaultDesc}
      </div>
      {children}
    </div>
  );
};

export default Empty;
