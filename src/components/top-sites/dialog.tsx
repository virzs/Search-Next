/*
 * @Author: Vir
 * @Date: 2021-04-10 21:52:45
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-10 22:20:08
 */

import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { useIntl } from 'react-intl';

// 网址 新增、编辑弹窗

type SiteDialogType = 'add' | 'edit' | 'del';

interface SiteDialogPropTypes {
  open: boolean;
  type: SiteDialogType;
  onClose: () => void;
}

const SiteDialog: React.FC<SiteDialogPropTypes> = ({ open, type, onClose }) => {
  const { formatMessage } = useIntl();
  const showTitleByType = new Map([
    ['add', formatMessage({ id: 'app.component.sitedialog.title.add' })],
    ['edit', formatMessage({ id: 'app.component.sitedialog.title.edit' })],
    ['del', formatMessage({ id: 'app.component.sitedialog.title.del' })],
  ]);

  const addContent = () => {};

  const editContent = () => {};

  const delContent = () => {};

  const showContentByType = new Map([
    ['add', addContent],
    ['edit', editContent],
    ['del', delContent],
  ]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{showTitleByType.get(type)}</DialogTitle>
      <DialogContent>{showContentByType.get(type)}</DialogContent>
    </Dialog>
  );
};

export default SiteDialog;
