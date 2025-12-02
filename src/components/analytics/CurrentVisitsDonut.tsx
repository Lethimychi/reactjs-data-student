import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { COLORS } from "../../utils/colors";

interface CurrentVisitsDonutProps {
  className?: string;
}

const series = [43.8, 35.3, 18.8, 6.3];
const labels = ["America", "Asia", "Europe", "Africa"];

export default function CurrentVisitsDonut({
  className = "",
}: CurrentVisitsDonutProps) {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false },
    },
    stroke: {
      width: 0,
    },
    legend: {
      position: "bottom",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
      labels: {
        colors: COLORS[1],
      },
    },
    dataLabels: {
      enabled: false,
    },
    labels,
    // use shared blue palette (first 4 colors)
    colors: COLORS.slice(0, 4),
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 600,
              formatter: (val: string) => `${parseFloat(val).toFixed(1)}%`,
            },
            total: {
              show: true,
              label: "Visits",
              formatter: () => "100%",
            },
          },
        },
      },
    },
  };

  return (
    <div
      className={`rounded-2xl border border-blue-100  p-6 dark:border-sky-800 dark:bg-white ${className}`}
    >
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-white/90">
            Tỷ lệ học lực theo môn
          </h3>
        </div>
      </header>

      <div className="mt-6 -mx-4">
        <Chart options={options} series={series} type="donut" height={280} />
      </div>
    </div>
  );
}
