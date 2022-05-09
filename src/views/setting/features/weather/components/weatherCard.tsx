/*
 * @Author: Vir
 * @Date: 2022-05-04 16:49:37
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-09 16:42:16
 */
import { Now, QWeatherCity, QWeatherNow } from '@/apis/weather/interface';
import { BorderCard } from '@/components/global/card/styleCard';
import Loading from '@/components/global/loading/loading';
import { Refresh } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import dayjs from 'dayjs';
import React, { FC, useMemo } from 'react';

export interface WeatherCardProps {
  weather: QWeatherNow;
  city: QWeatherCity;
  loading?: boolean;
  onRefresh?: () => void;
  apiKey: string;
}

const getWeatherIcon = (code: string): string => {
  return new URL(
    `/node_modules/qweather-icons/icons/${code}.svg`,
    import.meta.url,
  ).href;
};

const WeatherCard: FC<WeatherCardProps> = (props) => {
  const {
    weather = {} as QWeatherNow,
    city = {} as QWeatherCity,
    loading = false,
    onRefresh,
    apiKey,
  } = props;

  const extraList: {
    field: keyof Now;
    unit: string;
    label?: string;
    labelBuilder?: () => string;
  }[] = [
    {
      label: '体感',
      field: 'feelsLike',
      unit: '℃',
    },
    {
      labelBuilder: () => weather.now?.windDir,
      field: 'windScale',
      unit: '级',
    },
    {
      label: '湿度',
      field: 'humidity',
      unit: '%',
    },
    {
      label: '气压',
      field: 'pressure',
      unit: 'hPa',
    },
  ];

  const showLoading = useMemo(() => {
    if (loading) return loading;
    if (Object.keys(weather).length === 0 || Object.keys(city).length === 0)
      return true;
    return false;
  }, [loading, weather, city]);

  return (
    <BorderCard>
      <Loading loading={showLoading}>
        <a className="px-4 py-2 block" href={weather.fxLink} target="_blank">
          <div className="flex gap-1 font-semibold text-lg items-center">
            <div>{city.location?.[0].adm2}</div>
            <div>{city.location?.[0].name}</div>
            {apiKey && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  if (onRefresh) onRefresh();
                }}
              >
                <Refresh />
              </IconButton>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mb-2">
            <div className="flex items-center gap-3 mb-2">
              <div>
                {weather.now?.icon && (
                  <img
                    className="w-16 h-16"
                    src={getWeatherIcon(weather.now?.icon)}
                  />
                )}
              </div>
              <div>
                <div className="flex gap-1">
                  <div className="text-5xl font-semibold">
                    {weather.now?.temp}
                    <span className="text-sm align-top">℃</span>
                  </div>
                </div>
                <div>{weather.now?.text}</div>
              </div>
            </div>
            <div className="bg-gray-500 w-1 h-9"></div>
            <ul className="flex gap-4">
              {extraList.map((i, j) => (
                <li key={j}>
                  <div className="text-xl font-semibold mb-2">
                    {weather.now?.[i.field]}
                    {i.unit}
                  </div>
                  <div className="text-sm">
                    {i.labelBuilder ? i.labelBuilder() : i.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </a>
      </Loading>
    </BorderCard>
  );
};

export default WeatherCard;
