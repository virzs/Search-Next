/*
 * @Author: Vir
 * @Date: 2021-09-21 10:50:18
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-24 14:18:31
 */

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import classNames from 'classnames';
import React from 'react';

export interface ItemAccordionProps {
  title?: string;
  desc?: string;
  action?: React.ReactNode;
  expanded?: boolean;
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

const ItemAccordion: React.FC<ItemAccordionProps> = ({
  title,
  desc,
  action,
  expanded,
  onChange,
  children,
  disableDetailPadding = false,
}) => {
  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      className="rounded border shadow-none bg-white my-0"
    >
      <AccordionSummary
        className=" transition hover:bg-gray-100"
        expandIcon={<ExpandMore />}
      >
        <div className="flex items-center justify-between w-full mr-2">
          <div>
            {title && <p className="mb-0 text-sm font-semibold">{title}</p>}
            {desc && <p className="mb-0 text-xs">{desc}</p>}
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
