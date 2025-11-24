import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { COLORS } from "../../utils/colors";

interface WebsiteVisitsColumnChartProps {
  className?: string;
}

const series = [
  {
    name: "Team A",
    type: "column",
    data: [38, 32, 35, 52, 41, 45, 55, 48, 60],
  },
  {
    name: "Target",
    type: "line",
    data: [30, 34, 33, 50, 45, 43, 50, 52, 58],
  },
];

export default function WebsiteVisitsColumnChart({
  className = "",
}: WebsiteVisitsColumnChartProps) {
  const options: ApexOptions = {
    chart: {
      // mixed chart (column + line) - default type kept as 'bar' but series types override
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
        size: 10,
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
      // width per series: 0 for columns, 3 for the line
      width: [0, 3],
      curve: "smooth",
    },
    colors: [COLORS[1], COLORS[0]],
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
      className={`rounded-2xl border border-blue-100  p-6 dark:border-sky-800 dark:bg-white/[0.03] ${className}`}
    >
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-white/90">
            Điểm trung bình theo môn
          </h3>
          <p className="text-sm text-blue-600 dark:text-gray-400">
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
