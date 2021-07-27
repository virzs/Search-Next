/*
 * @Author: Vir
 * @Date: 2021-07-26 13:55:44
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-26 17:23:00
 */

import { css } from '@emotion/css';
import { Avatar, Card, CardHeader, IconButton } from '@material-ui/core';
import classNames from 'classnames';

const WebsiteCardStyle = () => {
  return css`
    cursor: pointer;
    .MuiCardHeader-root {
      height: 100%;
      align-items: flex-start;
    }
  `;
};

const WebsiteCard: React.FC<any> = ({ title, intro, color, url, ...props }) => {
  return (
    <Card className={classNames(WebsiteCardStyle())}>
      <a href={url} target="_blank">
        <CardHeader
          avatar={
            <Avatar style={{ backgroundColor: color }} aria-label={title}>
              {title.split('')[0].toUpperCase()}
            </Avatar>
          }
          title={title}
          subheader={intro}
        />
      </a>
    </Card>
  );
};

export default WebsiteCard;
