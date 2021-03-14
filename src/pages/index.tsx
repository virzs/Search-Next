import {
  getAllLocales,
  getLocale,
  setLocale,
} from '@/.umi/plugin-locale/localeExports';
import { useIntl } from 'react-intl';
import styles from './index.less';

export default function IndexPage() {
  const intl = useIntl();
  return (
    <div>
      <h1 className={styles.title}>
        Page index
        {intl.formatMessage({ id: 'SEARCH' })}
      </h1>
      {getAllLocales()}
      {getLocale()}
      <button
        onClick={() => {
          setLocale('en-US', false);
          console.log('切换');
        }}
      >
        切换
      </button>
    </div>
  );
}
