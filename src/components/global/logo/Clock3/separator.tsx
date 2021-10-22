/*
 * @Author: Vir
 * @Date: 2021-06-03 13:32:19
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 16:01:07
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
          'w-2.5 h-2.5 rounded-sm transition-all',
          refresh ? 'bg-var-main-10' : 'bg-var-main-1',
        )}
      />
      <i
        className={classNames(
          'w-2.5 h-2.5 rounded-sm transition-all',
          refresh ? 'bg-var-main-10' : 'bg-var-main-1',
        )}
      />
    </div>
  );
};
export default Separator;
