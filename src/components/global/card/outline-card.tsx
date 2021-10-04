/*
 * @Author: Vir
 * @Date: 2021-06-10 16:55:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-04 16:20:27
 */

import { Tooltip } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import classNames from 'classnames';
import React from 'react';

export interface OutlineCardProps {
  label?: React.ReactNode; //标题
  id?: string; //当前值
  value?: string; //选中值
  onChange?: (val: string) => void; //change事件，选中返回id，否则返回空
  tip?: string; //提示tooltip文案
  disabled?: boolean; //是否禁用
  loading?: boolean; //是否加载中，显示skeleton
}

const OutlineCard: React.FC<OutlineCardProps> = ({
  label,
  id,
  value,
  tip,
  disabled = false,
  loading = false,
  children,
  onChange,
}) => {
  const [radioChecked, setChecked] = React.useState<boolean>(id === value);

  React.useEffect(() => {
    value && setChecked(value === id);
  }, [value]);

  React.useEffect(() => {
    if (radioChecked) {
      if (onChange && id) onChange(id);
    }
  }, [radioChecked]);

  const radio = () => {
    return (
      <input
        className={classNames(
          'rounded w-full cursor-pointer h-full m-0 p-0 z-10 overflow-hidden absolute appearance-none bg-transparent transition-all border',
          !loading && radioChecked ? 'border-primary shadow-inner' : 'border-gray-200 shadow-sm',
        )}
        type="radio"
        id={id}
        name={value}
        checked={radioChecked}
        onChange={() => {}}
        onClick={() => setChecked(true)}
        disabled={disabled}
      />
    );
  };

  return (
    <div className="p-0 mb-0 h-full transition-all rounded">
      <div className="inline-block relative min-w-min min-h-full items-stretch justify-start h-full">
        {tip ? <Tooltip title={tip}>{radio()}</Tooltip> : radio()}
        <label
          slot="label"
          htmlFor={id}
          className="inline-block p-0 text-sm leading-5 text-primary"
        >
          <div className="px-2 pt-2 pb-1">
            <div className="border border-gray-300 rounded">
              {loading ? (
                <Skeleton variant="rectangular" width={136} height={76} />
              ) : (
                children
              )}
            </div>
            {label && (
              <div>
                <label className="mt-1 overflow-hidden max-w-full whitespace-nowrap overflow-ellipsis text-xs leading-4 inline-block p-0 text-primary">
                  {loading ? (
                    <Skeleton variant="text" width={100} height={16} />
                  ) : (
                    label
                  )}
                </label>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default OutlineCard;
