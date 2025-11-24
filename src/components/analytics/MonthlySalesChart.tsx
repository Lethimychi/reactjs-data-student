import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { MoreDotIcon } from "../../icons";
import { COLORS } from "../../utils/colors";

export default function MonthlySalesChart() {
  const options: ApexOptions = {
    colors: [COLORS[1]],
    chart: {
      fontFamily: "Inter, sans-serif",
      type: "bar",
      height: 200,
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 0,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#64748B", fontSize: "12px", fontFamily: "Inter" },
      },
    },
    legend: { show: false },
    yaxis: {
      title: { text: undefined },
      labels: { style: { colors: "#64748B", fontSize: "12px" } },
    },
    grid: {
      show: true,
      borderColor: "#E2E8F0",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
      style: { fontSize: "12px" },
    },
  };
  const series = [
    {
      name: "Sales",
      data: [168, 385, 201, 298, 187],
    },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            GPA của sinh viên trong lớp
          </h3>
          <p className="text-sm text-slate-500 mt-1">Analysis</p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <MoreDotIcon className="size-5" />
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <Chart options={options} series={series} type="bar" height={200} />
      </div>
    </div>
  );
}
