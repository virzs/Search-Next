/*
 * @Author: Vir
 * @Date: 2022-04-02 11:53:01
 * @Last Modified by: Vir
 * @Last Modified time: 2022-04-02 16:31:42
 */
import React, { FC } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import FeedbackIcon from '@mui/icons-material/Feedback';

type LinkIconType = 'link' | 'feedback';

interface LinkProps {
  icon?: LinkIconType;
  text: string;
  href: string;
}

const Link: FC<LinkProps> = (props) => {
  const { icon, text, href } = props;

  const renderIcon = () => {
    switch (icon) {
      case 'link':
        return <LinkIcon />;
      case 'feedback':
        return <FeedbackIcon />;
      default:
        return null;
    }
  };

  return (
    <p className="mb-2">
      <span className="mr-2">{renderIcon()}</span>
      <a className="text-sm hover:text-blue-700 text-blue-900 transition-all" href={href}>
        <span>{text}</span>
      </a>
    </p>
  );
};

export default Link;
