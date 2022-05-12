/*
 * @Author: Vir
 * @Date: 2022-05-10 17:05:36
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-11 18:01:01
 */
import { IndexPageWeatherSetting } from '@/apis/pages/index/interface';
import { SaveWeatherData } from '@/apis/weather/interface';
import Loading from '@/components/global/loading/loading';
import SvgIcon from '@/components/global/svgIcon';
import { cx } from '@emotion/css';
import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';

export interface WeatherProps {
  setting: IndexPageWeatherSetting;
  weather: SaveWeatherData;
  className: string;
}

const Weather: FC<WeatherProps> = (props) => {
  const {
    setting = {} as IndexPageWeatherSetting,
    weather: localWeatherData = {} as SaveWeatherData,
    className,
  } = props;
  const { interval } = setting;
  const { city, weather, key, latlng } = localWeatherData;

  const [pluginLoading, setPluginLoading] = useState(false);
  const [qweatherPlugin, setQweatherPlugin] = useState<HTMLElement>();

  const [open, setOpen] = useState(true);

  const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 'none',
      width: '450px',
      height: '150px',
      padding: '0',
    },
  });

  const initQweatherPlugin = () => {
    // @ts-ignore
    window.WIDGET = {
      CONFIG: {
        layout: '1',
        width: '450',
        height: '150',
        background: '1',
        dataColor: 'FFFFFF',
        key: '30d4a4daf48546df9155c607b364f3a4',
      },
    };
    const hePluginStandardEleBox = document.createElement('div');
    const hePluginStandardEle = document.createElement('div');
    hePluginStandardEleBox.id = 'he-plugin-standard-box';
    hePluginStandardEle.id = 'he-plugin-standard';
    hePluginStandardEleBox.style.display = 'none';
    hePluginStandardEleBox.appendChild(hePluginStandardEle);
    const boxInHtml = document.getElementById('he-plugin-standard-box');
    boxInHtml && document.body.removeChild(boxInHtml);
    document.body.appendChild(hePluginStandardEleBox);
    const script = document.createElement('script');
    script.src =
      'https://widget.qweather.net/standard/static/js/he-standard-common.js?v=2.0';
    script.id = 'qweather-widget-script';
    script.onload = () => {
      setPluginLoading(false);
      console.log('load');
    };
    const inHtml = document.getElementById('qweather-widget-script');
    inHtml && document.body.removeChild(inHtml);
    document.body.appendChild(script);
  };

  useEffect(() => {
    initQweatherPlugin();
  }, []);

  useEffect(() => {
    if (open) {
      initQweatherPlugin();
      const hePluginStandardEleBox = document.getElementById(
        'he-plugin-standard-box',
      );
      if (hePluginStandardEleBox) {
        document.body.removeChild(hePluginStandardEleBox);
        hePluginStandardEleBox.style.display = 'block';
        setQweatherPlugin(hePluginStandardEleBox);
      }
    } else {
      setQweatherPlugin(undefined);
      setPluginLoading(true);
    }
  }, [open]);

  return (
    <div
      className="h-10 flex items-center"
      onMouseEnter={() => {
        setOpen(true);
      }}
      onMouseLeave={() => {
        setOpen(false);
      }}
    >
      <NoMaxWidthTooltip
        open={open}
        title={
          <Loading loading={pluginLoading} color="#fff" full>
            <div
              dangerouslySetInnerHTML={{
                __html: qweatherPlugin?.innerHTML ?? '',
              }}
            ></div>
          </Loading>
        }
      >
        <div
          className={cx(
            className,
            'flex items-center px-2 gap-2 mx-2  cursor-pointer',
          )}
        >
          {<SvgIcon name={weather.now?.icon + '-fill'} />}
          <div className="flex gap-1 font-semibold">
            <span>{weather.now?.temp}</span>
            <span>℃</span>
          </div>
        </div>
      </NoMaxWidthTooltip>
    </div>
  );
};

export default Weather;
