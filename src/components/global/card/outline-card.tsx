/*
 * @Author: Vir
 * @Date: 2021-06-10 16:55:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-15 13:57:09
 */

import { Tooltip } from '@material-ui/core';
import classNames from 'classnames';
import React from 'react';
import './styles/outline-card.style.less';

export interface OutlineCardProps {
  label?: string; //标题
  id?: string; //当前值
  value?: string; //选中值
  onChange?: (val: string) => void; //change事件，选中返回id，否则返回空
  tip?: string;
}

const OutlineCard: React.FC<OutlineCardProps> = ({
  label,
  id,
  value,
  tip,
  children,
  onChange,
}) => {
  const [radioChecked, setChecked] = React.useState<boolean>(id === value);

  React.useEffect(() => {
    if (value !== id && value) setChecked(false);
  }, [value]);

  React.useEffect(() => {
    if (radioChecked) {
      if (onChange && id) onChange(id);
    }
  }, [radioChecked]);

  const radio = () => {
    return (
      <input
        className={classNames('outline-card-radio', {
          checked: radioChecked,
        })}
        type="radio"
        id={id}
        name={value}
        checked={radioChecked}
        onChange={() => {}}
        onClick={() => setChecked(true)}
      />
    );
  };

  return (
    <div className="outline-card-root">
      <div className="outline-card-container">
        <div className="outline-card-container-flex">
          {tip ? <Tooltip title={tip}>{radio()}</Tooltip> : radio()}
          <label slot="label" htmlFor={id} className="outline-card-label">
            <div className="outline-card-label-content">
              <div className="outline-card-content">{children}</div>
              {label && (
                <div>
                  <label className="outline-card-title">{label}</label>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default OutlineCard;
