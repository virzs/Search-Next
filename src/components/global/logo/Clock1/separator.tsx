/*
 * @Author: Vir
 * @Date: 2021-06-03 13:32:19
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 14:22:17
 */
import React from 'react';
import classNames from 'classnames';

export interface SeparatorProps {
  number: number
}

const Separator: React.FC<SeparatorProps> = ({ number }) => {
  const [refresh, setRefresh] = React.useState<boolean>(true);

  React.useEffect(() => {
    setRefresh(!refresh);
  }, [number]);

  return (
    <div className="h-25 flex flex-col justify-around">
      <i className={classNames("w-1.5 h-1.5 block rounded transition-all",
        refresh ? 'bg-var-main-10' : 'bg-var-main-2')} />
      <i className={classNames("w-1.5 h-1.5 block rounded transition-all",
        refresh ? 'bg-var-main-10' : 'bg-var-main-2')} />
    </div>
  );
};
export default Separator;
