/*
 * @Author: Vir
 * @Date: 2021-04-10 21:52:45
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-11 22:44:20
 */

import {
  Dialog,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@material-ui/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { DialogTitle } from '../material-ui-custom/dialog';
import './styles/dialog.less';

// 网址 新增、编辑弹窗

export type SiteDialogType = 'add' | 'edit' | 'del';

interface SiteDialogPropTypes {
  open: boolean;
  type: SiteDialogType;
  onClose: () => void;
}

const SiteDialog: React.FC<SiteDialogPropTypes> = ({ open, type, onClose }) => {
  const { formatMessage } = useIntl();

  const addContent = () => {
    return (
      <form autoComplete="off">
        <TextField
          variant="outlined"
          fullWidth
          required
          size="small"
          style={{ margin: '5px 0' }}
          label={formatMessage({ id: 'app.component.sitedialog.form.name' })}
          placeholder={formatMessage({
            id: 'app.component.sitedialog.placeholder.name',
          })}
        ></TextField>
        <TextField
          variant="outlined"
          fullWidth
          required
          size="small"
          style={{ margin: '5px 0' }}
          label={formatMessage({ id: 'app.component.sitedialog.form.url' })}
          placeholder={formatMessage({
            id: 'app.component.sitedialog.placeholder.url',
          })}
        ></TextField>
      </form>
    );
  };

  const editContent = () => {
    return <></>;
  };

  const delContent = () => {
    return <></>;
  };

  React.useEffect(() => {}, [open]);

  return (
    <Dialog className="top-site-dialog" open={open} onClose={onClose}>
      <DialogTitle onClose={onClose}>
        {type === 'add' &&
          formatMessage({ id: 'app.component.sitedialog.title.add' })}
        {type === 'edit' &&
          formatMessage({ id: 'app.component.sitedialog.title.edit' })}
        {type === 'del' &&
          formatMessage({ id: 'app.component.sitedialog.title.del' })}
      </DialogTitle>
      <DialogContent>
        {type === 'add' && addContent()}
        {type === 'edit' && editContent()}
        {type === 'del' && delContent()}
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button variant="contained">取消</Button>
        <Button variant="contained" color="primary">
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SiteDialog;
