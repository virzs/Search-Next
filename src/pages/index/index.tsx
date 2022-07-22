/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-10 17:53:54
 */

import Copyright from '@/components/global/copyright';
import { PageProps } from '@/typings';
import { IconButton, Tooltip } from '@mui/material';
import { Bookmarks, Settings } from '@mui/icons-material';
import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import SearchInput from './components/search-input';
import Sites from './components/sites';
import { useTranslation } from 'react-i18next';
import { setTheme } from '@/utils/theme';
import { AuthLogo } from '@/data/account/interface';
import { getAuthDataByKey } from '@/apis/auth';
import { ClockData } from '@/data/logo';
import NavDrawer from './components/nav-drawer';
import { useNavigate } from 'react-router-dom';
import Weather from './components/weather';
import { SaveWeatherData } from '@/apis/weather/interface';
import { usePreview } from '@/hooks/settings/background/preview';
import useNavigation from '@/hooks/settings/navigation/navigation';

const IndexPage: React.FC<PageProps> = (props) => {
  const history = useNavigate();
  const { t, i18n } = useTranslation();
  const [{ css, isImage, url: bgUrl }] = usePreview();
  const [{ type: NavType, cols: NavCols }] = useNavigation();

  const logoRef = React.useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = React.useState<boolean>(false);
  const [logoData, setLogoData] = React.useState<AuthLogo>({
    type: 'clock',
    show: true,
  } as AuthLogo);
  const [navOpen, setNavOpen] = React.useState(false);
  const [weather, setWeather] = useState<SaveWeatherData>(
    {} as SaveWeatherData,
  );

  // 获取并设置logo
  const setLogoSetting = () => {
    const id = localStorage.getItem('account');
    if (!id) return;
    const logoData = getAuthDataByKey(id, 'logo');
    setLogoData(logoData);
  };

  // 渲染时钟样式logo
  const renderClockLogo = () => {
    const clockType = logoData?.config?.clock?.type || 'clock1';
    const logo = ClockData.find((i) => i.value === clockType);
    return (
      <div
        className={classNames(
          'delay-75 transform duration-300 max-w-full',
          zoom ? 'scale-50' : 'scale-100',
        )}
      >
        {React.createElement(logo ? logo.component : ClockData[0].component)}
      </div>
    );
  };

  React.useEffect(() => {
    setLogoSetting();
  }, []);

  useEffect(() => {
    isImage ? setTheme(true, 'inverse') : setTheme(false);
  }, [isImage]);

  return (
    <div
      id="IndexPage"
      className="index-page flex flex-col h-screen bg-cover bg-center bg-secondary"
      style={{
        backgroundImage: isImage
          ? `radial-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%), radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%), url('${bgUrl}')`
          : undefined,
      }}
    >
      <div className="index-navbar-box flex flex-grow max-h-12 text-right align-middle">
        <Weather
          className={classNames({
            'text-var-main-10': isImage,
          })}
        />
        <div className="flex-1"></div>
        <Tooltip title="网址导航">
          <IconButton
            onClick={() => {
              const type = NavType ?? 'page';
              switch (type) {
                case 'drawer':
                  setNavOpen(true);
                  break;
                case 'page':
                default:
                  history('/navigation/*');
                  break;
              }
            }}
          >
            <Bookmarks
              className={classNames({
                'text-var-main-10': isImage,
              })}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="设置">
          <IconButton onClick={() => history('/setting')}>
            <Settings
              className={classNames({
                'text-var-main-10': isImage,
              })}
            />
          </IconButton>
        </Tooltip>
      </div>
      <div
        ref={logoRef}
        className={classNames(
          'index-logo-box items-center flex justify-center transition-all duration-300 max-w-full',
          zoom && logoData.show ? 'grow-0' : 'flex-grow',
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
        />
      </div>
      <div className="index-content-box flex-grow">
        <Sites />
      </div>
      <div className="index-copyright-box flex-grow max-h-8 text-center leading-8">
        <Copyright />
      </div>
      <NavDrawer
        open={navOpen}
        cols={NavCols}
        onClose={() => setNavOpen(false)}
      />
    </div>
  );
};

export default IndexPage;
