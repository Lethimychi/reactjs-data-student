import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
//import ChartTab from "../common/ChartTab";

export default function StatisticsChart() {
  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3B82F6"],
    chart: {
      fontFamily: "Inter, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0,
        colorStops: [
          {
            offset: 0,
            color: "#3B82F6",
            opacity: 0.4,
          },
          {
            offset: 100,
            color: "#3B82F6",
            opacity: 0,
          },
        ],
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category",
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
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      labels: {
        style: {
          fontSize: "12px",
          colors: "#64748B",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: "#64748B",
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "GPA",
      data: [7.2, 7.5, 7.1, 7.0, 7.3, 7.2, 7.4, 7.8, 8.0, 7.9, 8.2, 8.1],
    },
  ];
  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-slate-800">
            GPA của sinh viên trong lớp
          </h3>
          <p className="mt-1 text-slate-500 text-sm">Biểu đồ GPA theo tháng</p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
