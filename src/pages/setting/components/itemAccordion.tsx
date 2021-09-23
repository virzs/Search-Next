/*
 * @Author: Vir
 * @Date: 2021-09-21 10:50:18
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-21 21:11:59
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
  children: any;
  disableDetailPadding?: boolean;
}

export interface AccordionDetailItemProps {
  title: string;
  action: React.ReactNode;
}

export const AccordionDetailItem: React.FC<AccordionDetailItemProps> = ({
  title,
  action,
}) => {
  return (
    <div className="flex justify-between items-center border-t px-4 py-2">
      <div>{title}</div>
      <div>{action}</div>
    </div>
  );
};

const ItemAccordion: React.FC<ItemAccordionProps> = ({
  title,
  children,
  disableDetailPadding = false,
}) => {
  return (
    <Accordion className="rounded border shadow-none bg-white my-0">
      <AccordionSummary
        className=" transition hover:bg-gray-100"
        expandIcon={<ExpandMore />}
      >
        {title}
      </AccordionSummary>
      <AccordionDetails className={classNames({ 'p-0': disableDetailPadding })}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default ItemAccordion;
