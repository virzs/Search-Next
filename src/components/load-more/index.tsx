/*
 * @Author: Vir
 * @Date: 2021-03-31 22:03:33
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-31 22:26:39
 */
import { CircularProgress } from '@material-ui/core';
import { useIntl } from 'react-intl';
import './style/index.less';

export interface LoadMorePropTypes {
  nomore: boolean;
}

const LoadMore = ({ nomore }: LoadMorePropTypes) => {
  const intl = useIntl();
  return (
    <div className="loading-more">
      {nomore ? (
        <span className="loading-content">
          {intl.formatMessage({ id: 'COMPONENT_LOADMORE_NOMORE_CONTENT' })}
        </span>
      ) : (
        <>
          <CircularProgress size={14} color="inherit" />
          <span className="loading-content">
            {intl.formatMessage({ id: 'COMPONENT_LOADMORE_LOADING_CONTENT' })}
          </span>
        </>
      )}
    </div>
  );
};

export default LoadMore;
