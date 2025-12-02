import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import StudentsLectures from "../../utils/StudentsLectures";
import { COLORS } from "../../utils/config/colors";

interface WebsiteVisitsColumnChartProps {
  className?: string;
  masv?: string;
  semesterDisplayName?: string;
}

export default function WebsiteVisitsColumnChart({
  className = "",
  masv,
  semesterDisplayName,
}: WebsiteVisitsColumnChartProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [series, setSeries] = useState<any[]>([
    { name: "Sinh viên", type: "column", data: [] },
    { name: "Lớp", type: "line", data: [] },
  ]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!masv) {
        // no student id -> show placeholder
        setCategories(["Chưa có sinh viên"]);
        setSeries([
          { name: "Sinh viên", type: "column", data: [0] },
          { name: "Lớp", type: "line", data: [0] },
        ]);
        return;
      }

      try {
        const data = await StudentsLectures.fetchStudentCompareScores(
          masv,
          semesterDisplayName as string | undefined
        );
        if (!mounted) return;
        if (Array.isArray(data)) {
          const arr = data as Record<string, unknown>[];

          // If a semester is provided, filter results to that semester (term + year)
          let filtered = arr;
          if (semesterDisplayName) {
            const parts = String(semesterDisplayName).split(" - ");
            const term = parts[0]?.trim();
            const year =
              parts.length > 1 ? parts.slice(1).join(" - ").trim() : undefined;

            if (term && year) {
              const exact = arr.filter(
                (d) =>
                  String(d["Ten Hoc Ky"] ?? d["TenHocKy"] ?? "").trim() ===
                    term &&
                  String(d["Ten Nam Hoc"] ?? d["TenNamHoc"] ?? "").trim() ===
                    year
              );
              if (exact.length) filtered = exact;
              else {
                const termOnly = arr.filter(
                  (d) =>
                    String(d["Ten Hoc Ky"] ?? d["TenHocKy"] ?? "").trim() ===
                    term
                );
                if (termOnly.length) filtered = termOnly;
              }
            } else if (term) {
              filtered = arr.filter(
                (d) =>
                  String(d["Ten Hoc Ky"] ?? d["TenHocKy"] ?? "").trim() === term
              );
            }
          }

          const cats = filtered.map((d) =>
            String(d["Ten Mon Hoc"] ?? d["ten"] ?? "-")
          );
          const sv = filtered.map((d) => Number(d["DTB_SV"]) || 0);
          const all = filtered.map((d) => Number(d["DTB_ALL"]) || 0);
          setCategories(cats.length ? cats : ["Không có dữ liệu"]);
          setSeries([
            { name: "Sinh viên", type: "column", data: sv.length ? sv : [0] },
            { name: "Lớp", type: "line", data: all.length ? all : [0] },
          ]);
        } else {
          setCategories(["Không có dữ liệu"]);
          setSeries([
            { name: "Sinh viên", type: "column", data: [0] },
            { name: "Lớp", type: "line", data: [0] },
          ]);
        }
      } catch (e) {
        console.error("Error loading compare scores", e);
        setCategories(["Không có dữ liệu"]);
        setSeries([
          { name: "Sinh viên", type: "column", data: [0] },
          { name: "Lớp", type: "line", data: [0] },
        ]);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [masv, semesterDisplayName]);

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
      markers: { size: 10 },
    },
    fill: { opacity: 1 },
    dataLabels: { enabled: false },
    stroke: { show: true, width: [0, 3], curve: "smooth" },
    colors: [COLORS.BAR.AVERAGE, COLORS.BAR.GOOD],
    grid: { borderColor: "#E5E7EB", strokeDashArray: 6 },
    xaxis: {
      categories,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
        rotate: -45,
        rotateAlways: true,
        hideOverlappingLabels: false,
        formatter: function (val: string) {
          // shorten long subject names to avoid overlap
          try {
            return val.length > 18 ? val.slice(0, 18) + "..." : val;
          } catch (err) {
            return String(val);
          }
        },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#6B7280" },
        formatter: function (val: number) {
          // show one decimal place
          return Number(val).toFixed(1);
        },
      },
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      // custom HTML tooltip to show subject + both series values with one decimal
      custom: function ({ series, dataPointIndex, w }) {
        const cats = (w.config.xaxis && w.config.xaxis.categories) || [];
        const subject = cats[dataPointIndex] || "";
        const sv =
          series && series[0] ? Number(series[0][dataPointIndex] ?? 0) : 0;
        const all =
          series && series[1] ? Number(series[1][dataPointIndex] ?? 0) : 0;
        const markStudent = `<span style="display:inline-block;width:10px;height:10px;background:${COLORS.BAR.AVERAGE};border-radius:50%;margin-right:8px"></span>`;
        const markClass = `<span style="display:inline-block;width:10px;height:10px;background:${COLORS.BAR.GOOD};border-radius:50%;margin-right:8px"></span>`;
        return `
          <div style="padding:10px;background:#0f172a;color:#fff;border-radius:8px;min-width:160px">
            <div style="font-size:13px;margin-bottom:8px">${String(
              subject
            )}</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:13px">${markStudent}<div>Sinh viên: <strong>${sv.toFixed(
          1
        )}</strong></div></div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px;font-size:13px">${markClass}<div>Lớp: <strong>${all.toFixed(
          1
        )}</strong></div></div>
          </div>
        `;
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
            So sánh điểm sinh viên vs lớp
          </p>
        </div>
      </header>

      <div className="mt-6 -mx-4">
        <Chart options={options} series={series} type="bar" height={280} />
      </div>
    </div>
  );
}
