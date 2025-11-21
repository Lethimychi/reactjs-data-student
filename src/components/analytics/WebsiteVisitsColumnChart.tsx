import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface WebsiteVisitsColumnChartProps {
  className?: string;
}

const series = [
  {
    name: "Team A",
    data: [38, 32, 35, 52, 41, 45, 55, 48, 60],
  },
  {
    name: "Team B",
    data: [55, 45, 60, 40, 72, 60, 34, 40, 30],
  },
];

export default function WebsiteVisitsColumnChart({
  className = "",
}: WebsiteVisitsColumnChartProps) {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Inter, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "36%",
        borderRadius: 8,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "13px",
      fontFamily: "Inter, sans-serif",
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
    },
    fill: {
      opacity: 1,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    colors: ["#5D5FEF", "#F7936F"],
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 6,
      yaxis: {
        lines: { show: true },
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
      ],
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}k`,
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
            Website visits
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            +43% than last year
          </p>
        </div>
      </header>

      <div className="mt-6 -mx-4">
        <Chart options={options} series={series} type="bar" height={280} />
      </div>
    </div>
  );
}
