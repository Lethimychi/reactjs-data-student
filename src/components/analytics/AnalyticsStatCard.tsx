import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { ArrowDownIcon, ArrowUpIcon } from "../../icons";

type TrendDirection = "up" | "down";

interface AnalyticsStatCardProps {
  title: string;
  value: string;
  change: string;
  changeLabel?: string;
  trendDirection: TrendDirection;
  accentColor: string;
  backgroundClassName: string;
  sparklineData: number[];
}

export default function AnalyticsStatCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  trendDirection,
  accentColor,
  backgroundClassName,
  sparklineData,
}: AnalyticsStatCardProps) {
  const icon =
    trendDirection === "up" ? (
      <ArrowUpIcon className="size-4" />
    ) : (
      <ArrowDownIcon className="size-4" />
    );

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        toolbar: { show: false },
        sparkline: { enabled: true },
      },
      stroke: {
        width: 3,
        curve: "smooth",
      },
      fill: {
        type: "gradient",
        gradient: {
          type: "vertical",
          shadeIntensity: 0.3,
          opacityFrom: 0.4,
          opacityTo: 0,
          stops: [0, 100],
        },
      },
      grid: {
        show: false,
      },
      tooltip: {
        x: {
          show: false,
        },
        marker: {
          show: false,
        },
      },
      markers: {
        size: 0,
      },
      colors: [accentColor],
      dataLabels: {
        enabled: false,
      },
    }),
    [accentColor]
  );

  const series = useMemo(
    () => [
      {
        name: title,
        data: sparklineData,
      },
    ],
    [sparklineData, title]
  );

  const changeColor =
    trendDirection === "up"
      ? "bg-white/15 text-white"
      : "bg-white/10 text-white";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 shadow-sm ${backgroundClassName}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${changeColor}`}
        >
          <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 text-white">
            {icon}
          </span>
          {change}
        </div>
      </div>

      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-white/70">
        {changeLabel}
      </p>

      <div className="mt-6 -mb-2 -ml-4 -mr-4">
        <Chart
          options={options}
          series={series}
          type="line"
          height={90}
          width="100%"
        />
      </div>
    </div>
  );
}
