import ReactECharts from "echarts-for-react";
import { EChartsOption } from "echarts/types/dist/shared";
import { FC, useMemo } from "react";

export interface LineChartProps {
  data?: any;
  useData?: (data: any) => any[];
  xField?: string;
  yField?: string;
  xAxisLabelFormatter?: (value: any) => string;
  options?: EChartsOption;
}

const LineChart: FC<LineChartProps> = (props) => {
  const {
    data = [],
    useData,
    xField = "date",
    yField = "value",
    xAxisLabelFormatter,
    options: propOptions = {},
  } = props;

  const chartData = useMemo(() => {
    if (useData) {
      return useData(data);
    }
    return data;
  }, [data, useData]);

  const xAxisData = useMemo(() => {
    return chartData.map((item: any) => item[xField]);
  }, [chartData, xField]);

  const seriesData = useMemo(() => {
    return chartData.map((item: any) => item[yField]);
  }, [chartData, yField]);

  const { xAxis, yAxis, tooltip, ...rest } = propOptions;

  if (xAxis && !Array.isArray(xAxis)) {
    delete xAxis.type;
    delete xAxis.axisLabel;
  }

  const options: EChartsOption = {
    grid: {
      left: "3%",
      right: "3%",
    },
    xAxis: {
      // @ts-ignore
      type: "category",
      data: xAxisData,
      // @ts-ignore
      axisLabel: {
        formatter: function (value: any) {
          if (xAxisLabelFormatter) {
            return xAxisLabelFormatter(value);
          }
          return value;
        },
        color: "#9d9ea1",
      },
      axisLine: {
        lineStyle: {
          color: "#ededee",
        },
      },
      ...xAxis,
    },
    yAxis: {
      type: "value",
      splitLine: {
        lineStyle: {
          color: "#ededee",
        },
      },
      axisLabel: {
        color: "#9d9ea1",
      },
      ...yAxis,
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const item = params[0];
        return `${
          xAxisLabelFormatter
            ? xAxisLabelFormatter(item.axisValueLabel)
            : item.axisValueLabel
        }<br />${item.marker} ${item.seriesName}: ${item.value}`;
      },
      ...tooltip,
    },
    series: [
      {
        name: "数量",
        data: seriesData,
        type: "line",
        smooth: true,
      },
    ],
    ...rest,
  };

  return <ReactECharts option={options} />;
};

export default LineChart;
