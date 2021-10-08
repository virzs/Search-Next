/*
 * @Author: Vir
 * @Date: 2021-04-11 19:59:14
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-07 23:21:02
 */
import confirm from './confirm';
import PrivateDialog from './dialog';

type PrivateDialogType = typeof PrivateDialog;

interface DialogInterface extends PrivateDialogType {
  confirm: typeof confirm;
}

const Dialog = PrivateDialog as DialogInterface;

Dialog.confirm = confirm;

export { Dialog };
