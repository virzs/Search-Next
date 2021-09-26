/*
 * @Author: Vir
 * @Date: 2021-06-10 16:55:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-23 15:22:18
 */

import { Tooltip } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import classNames from 'classnames';
import React from 'react';
import './styles/outline-card.style.less';

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
    console.log('radioChecked', value, id, radioChecked);
  }, [radioChecked]);

  const radio = () => {
    return (
      <input
        className={classNames('outline-card-radio', {
          checked: !loading && radioChecked,
        })}
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
    <div className="outline-card-root">
      <div className="outline-card-container-flex">
        {tip ? <Tooltip title={tip}>{radio()}</Tooltip> : radio()}
        <label slot="label" htmlFor={id} className="outline-card-label">
          <div className="outline-card-label-content">
            <div className="outline-card-content">
              {loading ? (
                <Skeleton variant="rectangular" width={136} height={76} />
              ) : (
                children
              )}
            </div>
            {label && (
              <div>
                <label className="outline-card-title">
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
