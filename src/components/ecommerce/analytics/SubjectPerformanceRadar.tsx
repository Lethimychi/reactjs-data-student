import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface SubjectPerformanceRadarProps {
  className?: string;
}

const series = [
  {
    name: "Series 1",
    data: [80, 50, 30, 40, 100, 20],
  },
  {
    name: "Series 2",
    data: [20, 30, 40, 80, 20, 80],
  },
  {
    name: "Series 3",
    data: [44, 76, 78, 13, 43, 10],
  },
];

const categories = [
  "English",
  "History",
  "Physics",
  "Geography",
  "Chinese",
  "Math",
];

export default function SubjectPerformanceRadar({
  className = "",
}: SubjectPerformanceRadarProps) {
  const options: ApexOptions = {
    chart: {
      type: "radar",
      toolbar: { show: false },
    },
    labels: categories,
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontFamily: "Outfit, sans-serif",
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
    },
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.2,
    },
    colors: ["#5D5FEF", "#F7936F", "#34D399"],
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: "#E5E7EB",
          connectorColors: "#E5E7EB",
          fill: {
            colors: ["transparent"],
          },
        },
      },
    },
    yaxis: {
      show: false,
    },
  };

  return (
    <div
      className={`rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <header>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
          Current subject
        </h3>
      </header>

      <div className="mt-6 -mx-4">
        <Chart options={options} series={series} type="radar" height={290} />
      </div>
    </div>
  );
}
