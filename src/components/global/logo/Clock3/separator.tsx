/*
 * @Author: Vir
 * @Date: 2021-06-03 13:32:19
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-21 17:00:39
 */
import React from 'react';
import classNames from 'classnames';

export interface SeparatorProps {
  number: number;
}

const Separator: React.FC<SeparatorProps> = ({ number }) => {
  const [refresh, setRefresh] = React.useState<boolean>(true);

  React.useEffect(() => {
    setRefresh(!refresh);
  }, [number]);

  return (
    <div className="flex justify-around flex-col">
      <i
        className={classNames(
          'w-3 h-3 rounded-sm transition-all',
          refresh ? 'bg-var-main-10' : 'bg-var-main-2',
        )}
      />
      <i
        className={classNames(
          'w-3 h-3 rounded-sm transition-all',
          refresh ? 'bg-var-main-10' : 'bg-var-main-2',
        )}
      />
    </div>
  );
};
export default Separator;
