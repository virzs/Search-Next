/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-26 15:22:42
 */

import { latestImg, SetBackgroundParams } from '@/apis/setting/background';
import Copyright from '@/components/global/copyright';
import { SearchEngineValueTypes } from '@/data/engine';
import { PageProps } from '@/typings';
import { getAccount } from '@/views/setting/auth/utils/acount';
import { IconButton, Tooltip } from '@material-ui/core';
import { Bookmarks, Settings } from '@material-ui/icons';
import classNames from 'classnames';
import React from 'react';
import SearchInput from './components/search-input';
import Sites from './components/sites';
import { useTranslation } from 'react-i18next';
import { setTheme } from '@/utils/theme';
import { AuthLogo } from '@/data/account/interface';
import { logoSetting } from '@/apis/auth';
import { ClockData } from '@/data/logo';

const IndexPage: React.FC<PageProps> = ({ history, ...props }) => {
  const { t, i18n } = useTranslation();
  const logoRef = React.useRef<HTMLDivElement>(null);

  const [bg, setBg] = React.useState<SetBackgroundParams>();

  const [zoom, setZoom] = React.useState<boolean>(false);
  const [logoData, setLogoData] = React.useState<AuthLogo>({
    type: 'clock',
    show: true,
  } as AuthLogo);

  const handleSearch = (value: string, engine: SearchEngineValueTypes) => {
    window.open(`${engine.href}${value}`);
  };

  // 获取并设置logo
  const setLogoSetting = () => {
    const id = localStorage.getItem('account');
    if (!id) return;
    const logoData = logoSetting(id);
    setLogoData(logoData);
  };

  // 渲染时钟样式logo
  const renderClockLogo = () => {
    const clockType = logoData?.config?.clock?.type || 'clock1';
    const logo = ClockData.find((i) => i.value === clockType);
    return (
      <div
        className={classNames(
          'delay-75 transform duration-300',
          zoom ? 'scale-50' : 'scale-100',
        )}
      >
        {React.createElement(logo ? logo.component : ClockData[0].component)}
      </div>
    );
  };

  const setBackground = () => {
    const user = getAccount();
    const background = user.background;
    if (user && background) {
      switch (background.type) {
        case 'random':
          setTheme(true, 'inverse');
          setBg(user.background.data);
          break;
        case 'everyday':
          setTheme(true, 'inverse');
          latestImg().then((res) => {
            setBg(res.data.data[0]);
          });
          break;
        case 'link':
          setTheme(true, 'inverse');
          setBg(user.background.data);
          break;
        case 'color':
          setTheme(false);
          break;
      }
    } else {
    }
  };

  React.useEffect(() => {
    setBackground();
    setLogoSetting();
  }, []);

  return (
    <div
      id="IndexPage"
      className="index-page flex flex-col h-screen bg-cover bg-center bg-secondary"
      style={{ backgroundImage: bg ? `url('${bg?.url}')` : undefined }}
    >
      <div className="index-navbar-box flex-grow max-h-12 text-right align-middle">
        <Tooltip title="网址导航">
          <IconButton onClick={() => history.push('/navigation')}>
            <Bookmarks
              className={classNames({
                'text-var-main-10': !!bg,
              })}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="设置">
          <IconButton onClick={() => history.push('/setting')}>
            <Settings
              className={classNames({
                'text-var-main-10': !!bg,
              })}
            />
          </IconButton>
        </Tooltip>
      </div>
      <div
        ref={logoRef}
        className={classNames(
          'index-logo-box items-center flex justify-center transition-all duration-300',
          zoom && logoData.show ? 'flex-grow-0' : 'flex-grow',
          logoData.show ? 'max-h-48 sm:max-h-72' : 'max-h-32',
        )}
        style={{
          height:
            zoom && logoRef && logoRef.current
              ? `${logoRef.current.clientHeight * 0.5}px`
              : '100%',
        }}
      >
        {logoData.show && logoData.type === 'clock' && renderClockLogo()}
      </div>
      <div className="index-input-box flex-grow max-h-20 flex justify-center items-center">
        <SearchInput
          placeholder={t('placeholder.qing-shu-ru-sou-suo-nei-rong')}
          onPressEnter={handleSearch}
          onBtnClick={handleSearch}
          onFocus={() => setZoom(true)}
          onBlur={() => setZoom(false)}
        />
      </div>
      <div className="index-content-box flex-grow">
        <Sites />
      </div>
      <div className="index-copyright-box flex-grow max-h-8 text-center leading-8">
        <Copyright />
      </div>
    </div>
  );
};

export default IndexPage;
