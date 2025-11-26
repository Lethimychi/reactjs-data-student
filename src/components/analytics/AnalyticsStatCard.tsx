//import Chart from "react-apexcharts";
//import { ArrowDownIcon, ArrowUpIcon } from "../../icons";

type TrendDirection = "up" | "down";

interface AnalyticsStatCardProps {
  title: string;
  value: string;
  change?: string;
  changeLabel?: string;
  // make change and sparkline optional so callers can omit them
  trendDirection: TrendDirection;
  accentColor: string;
  backgroundClassName: string;
  sparklineData?: number[];
}

export default function AnalyticsStatCard(props: AnalyticsStatCardProps) {
  const { title, value, backgroundClassName } = props;
  const changeLabel = props.changeLabel ?? "";
  // const icon =
  //   trendDirection === "up" ? (
  //     <ArrowUpIcon className="size-4" />
  //   ) : (
  //     <ArrowDownIcon className="size-4" />
  //   );

  // sparkline options were removed to avoid unused variable warnings; re-enable when the sparkline chart is needed

  // const series = useMemo(
  //   () => [
  //     {
  //       name: title,
  //       data: sparklineData,
  //     },
  //   ],
  //   [sparklineData, title]
  // );

  // const changeColor =
  //   trendDirection === "up"
  //     ? "bg-white/15 text-white"
  //     : "bg-white/10 text-white";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg h-44 ${backgroundClassName} ring-1 ring-white/10`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-black/85">
            <b>{title}</b>
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-white drop-shadow-sm">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-white/70">
        {changeLabel}
      </p>

      {/* <div className="mt-6 -mb-2 -ml-4 -mr-4">
        <Chart
          options={options}
          series={series}
          type="line"
          height={90}
          width="100%"
        />
      </div> */}
    </div>
  );
}
