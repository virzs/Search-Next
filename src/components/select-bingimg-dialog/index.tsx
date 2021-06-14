/*
 * @Author: Vir
 * @Date: 2021-06-07 13:53:40
 * @Last Modified by:   Vir
 * @Last Modified time: 2021-06-07 13:53:40
 */

import { Dialog } from '@material-ui/core';
import DialogTitleCustom from '../material-ui-custom/dialog/dialog-title';
import { SelectBingImgDialogPropsType } from './interface';

const SelectBingImgDialog: React.FC<SelectBingImgDialogPropsType> = ({
  open,
}) => {
  return (
    <Dialog open={open}>
      <DialogTitleCustom>选择背景</DialogTitleCustom>
    </Dialog>
  );
};

export default SelectBingImgDialog;
