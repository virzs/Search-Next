/*
 * @Author: Vir
 * @Date: 2022-05-10 17:05:36
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-11 18:01:01
 */
import { IndexPageWeatherSetting } from '@/apis/pages/index/interface';
import {
  QWeatherNow,
  QweatherNowParams,
  SaveWeatherData,
} from '@/apis/weather/interface';
import Loading from '@/components/global/loading/loading';
import SvgIcon from '@/components/global/svgIcon';
import { cx } from '@emotion/css';
import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { useInterval } from 'react-use';

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
  const { interval = 15 } = setting;
  const { city, weather, key, pluginKey, latlng } = localWeatherData ?? {};

  const [pluginLoading, setPluginLoading] = useState(false);
  const [qweatherPlugin, setQweatherPlugin] = useState<HTMLElement>();
  const [qweatherNow, setQweatherNow] = useState<QWeatherNow>();

  const [open, setOpen] = useState(false);

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
        key: pluginKey,
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
      // ! 修改和风天气插件 去掉切换城市按钮
      const timer = setInterval(() => {
        const pluginLocationEle = document.querySelector('.wv-lt-location');
        if (pluginLocationEle && pluginLocationEle.children.length == 2) {
          const eleChildren = pluginLocationEle.children;
          const cityNameEle = eleChildren[0];
          // @ts-ignore
          if (cityNameEle.title) {
            const divCityName = document.createElement('div');
            // @ts-ignore
            divCityName.innerHTML = cityNameEle.title;
            // @ts-ignore
            divCityName.style.color = cityNameEle.style.color;
            divCityName.style.fontSize = '16px';
            // ? 这里删除两次 0，每次删除后，数组都会变化
            pluginLocationEle.removeChild(eleChildren[0]);
            pluginLocationEle.removeChild(eleChildren[0]);
            pluginLocationEle.appendChild(divCityName);
            clearInterval(timer);
          }
        }
      }, 100);
    };
    const inHtml = document.getElementById('qweather-widget-script');
    inHtml && document.body.removeChild(inHtml);
    document.body.appendChild(script);
  };

  // 获取天气信息
  // const getWeatherInfo = (params: QweatherNowParams) => {
  //   setLoading(true);
  //   const { key } = params;
  //   qweatherNow(params).then((res) => {
  //     setWeather(key ? res : res.data);
  //     setLoading(false);
  //   });
  // };

  useEffect(() => {
    initQweatherPlugin();
  }, []);

  useEffect(() => {
    if (weather) setQweatherNow(weather);
  }, [weather]);

  useInterval(() => {}, interval * 60 * 1000);

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

  if (!qweatherNow) return <div></div>;

  return (
    <div
      className="h-10 flex items-center"
      onMouseEnter={() => {
        pluginKey && setOpen(true);
      }}
      onMouseLeave={() => {
        pluginKey && setOpen(false);
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
            'flex items-center px-2 gap-2 mx-2',
            pluginKey && 'cursor-pointer',
          )}
        >
          {<SvgIcon name={qweatherNow.now?.icon + '-fill'} />}
          <div className="flex gap-1 font-semibold">
            <span>{qweatherNow.now?.temp}</span>
            <span>℃</span>
          </div>
        </div>
      </NoMaxWidthTooltip>
    </div>
  );
};

export default Weather;
