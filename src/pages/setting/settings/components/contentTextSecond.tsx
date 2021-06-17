/*
 * @Author: Vir
 * @Date: 2021-06-17 13:54:46
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-17 14:26:27
 */

import styled from 'styled-components';

const P = styled.p`
  font-size: 12px;
  color: #717171;
  margin: 0;
  padding-top: 4px;
`;

export interface ContentTextSecondProps {
  style?: React.CSSProperties;
}

const ContentTextSecond: React.FC<ContentTextSecondProps> = ({
  children,
  style,
  ...props
}) => {
  return <P style={style}>{children}</P>;
};

export default ContentTextSecond;
