/*
 * @Author: Vir
 * @Date: 2021-09-21 10:50:18
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-30 11:53:39
 */

import { css, cx } from '@emotion/css';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';

export interface ItemAccordionProps {
  icon?: any;
  title?: string;
  desc?: string;
  action?: React.ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onChange?:
    | ((event: React.SyntheticEvent<Element, Event>, expanded: boolean) => void)
    | undefined;
  children: any;
  disableDetailPadding?: boolean;
}

export interface AccordionDetailItemProps {
  title: string;
  action: React.ReactNode;
  disabledRightPadding?: boolean;
}

// 附带操作的项
export const AccordionDetailItem: React.FC<AccordionDetailItemProps> = ({
  title,
  action,
  disabledRightPadding = false,
}) => {
  return (
    <div className="flex justify-between items-center border-t px-4 py-2">
      <div>{title}</div>
      <div className={classNames({ 'mr-8': !disabledRightPadding })}>
        {action}
      </div>
    </div>
  );
};

export interface AccordionDetailTextProps {
  title: string;
  value?: string | Date;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
}

// key、value 格式的项，支持链接跳转
export const AccordionDetailText: React.FC<AccordionDetailTextProps> = ({
  title,
  value = '-',
  href,
  target = '_blank',
}) => {
  const formatValue = dayjs(value).isValid()
    ? dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    : value;
  return (
    <div className="px-6 grid grid-cols-3 py-1">
      <span className="col-span-1">{title}</span>
      <span className="col-span-2">
        {href ? (
          <a href={href} target={target}>
            {formatValue}
          </a>
        ) : (
          formatValue
        )}
      </span>
    </div>
  );
};

const ItemAccordion: React.FC<ItemAccordionProps> = ({
  icon,
  title,
  desc,
  action,
  expanded,
  defaultExpanded,
  onChange,
  children,
  disableDetailPadding = false,
}) => {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      expanded={expanded}
      onChange={onChange}
      className={classNames(
        'rounded border shadow-none bg-white my-0',
        css`
          &::before {
            background-color: transparent !important;
          }
        `,
      )}
    >
      <AccordionSummary
        className=" transition hover:bg-gray-100"
        expandIcon={<ExpandMore />}
      >
        <div className="flex items-center justify-between w-full mr-2">
          <div className="flex-grow flex items-center justify-start">
            {icon && <div className="mr-2">{icon}</div>}
            <div>
              {title && (
                <p className={cx('mb-0 text-sm', desc && 'font-bold')}>
                  {title}
                </p>
              )}
              {desc && <p className="mb-0 text-xs text-gray-700">{desc}</p>}
            </div>
          </div>
          <div className="flex items-center">{action}</div>
        </div>
      </AccordionSummary>
      <AccordionDetails className={classNames({ 'p-0': disableDetailPadding })}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default ItemAccordion;
