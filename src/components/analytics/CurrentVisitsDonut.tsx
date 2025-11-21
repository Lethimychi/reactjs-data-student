import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

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
        colors: "#6B7280",
      },
    },
    dataLabels: {
      enabled: false,
    },
    labels,
    colors: ["#5D5FEF", "#F7936F", "#0EA5E9", "#F9A8D4"],
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
      className={`rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
            Current visits
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            +43% than last year
          </p>
        </div>
      </header>

      <div className="mt-6 -mx-4">
        <Chart options={options} series={series} type="donut" height={280} />
      </div>
    </div>
  );
}
