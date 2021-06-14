/*
 * @Author: Vir
 * @Date: 2021-06-10 16:55:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-10 17:03:39
 */

import { Card, CardProps } from '@material-ui/core';
import classNames from 'classnames';
import './styles/hover-card.style.less';

export interface HoverCardProps extends CardProps {
  selected?: boolean;
}

const HoverCard: React.FC<HoverCardProps> = ({
  selected = false,
  children,
  ...props
}) => {
  return (
    <div className="hover-card-root">
      <Card
        className={classNames('hover-card-container', { selected })}
        variant="outlined"
        {...props}
      >
        <div className="hover-card-content-root">{children}</div>
      </Card>
    </div>
  );
};

export default HoverCard;
