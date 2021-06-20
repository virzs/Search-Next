/*
 * @Author: Vir
 * @Date: 2021-06-20 18:42:57
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-20 21:41:22
 */

import {
  createStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemProps,
  ListItemSecondaryAction,
  ListItemText,
  ListProps,
  makeStyles,
} from '@material-ui/core';
import React from 'react';

export interface ContentListItemProps extends ListItemProps {
  icon?: React.ReactNode;
  text?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export interface ContentListProps extends ListProps {
  dataMap?: any[]; //数据源
  itemBuilder?: (item: any, index: number) => React.FC; //自定义item
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      paddingLeft: 0,
    },
  }),
);

export const ContentListItem: React.FC<ContentListItemProps> = ({
  children,
  icon,
  text,
  secondaryAction,
  ...props
}) => {
  const classes = useStyles();
  console.log(props);
  return (
    // @ts-ignore 忽略ListItem button类型问题
    <ListItem className={classes.root} {...props}>
      {children ? (
        children
      ) : (
        <>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText>{text}</ListItemText>
          <ListItemSecondaryAction>{secondaryAction}</ListItemSecondaryAction>
        </>
      )}
    </ListItem>
  );
};

export const ContentList: React.FC<ContentListProps> = ({
  dataMap,
  itemBuilder,
  children,
  disablePadding = true,
  ...props
}) => {
  return (
    <List disablePadding={disablePadding} {...props}>
      {children}
    </List>
  );
};
