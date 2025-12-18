import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { COLORS } from "../../utils/colors";
import { getSubjectGradeRatioGV } from "../../utils/classification/api";

interface CurrentVisitsDonutProps {
  className?: string;
  mssv?: string;
  semester?: string;
}

export default function CurrentVisitsDonut({
  className = "",
  semester = "HK2 - 2022 - 2023",
  mssv = "",
}: CurrentVisitsDonutProps) {
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<number[]>([]);
  const [labels] = useState(["Giỏi", "Khá", "TB", "Yếu"]);

  async function fetchData() {
    if (!mssv) return;

    setLoading(true);
    try {
      const data = await getSubjectGradeRatioGV(mssv);
      console.log("Data from API:", data);

      console.log(semester);
      if (!data || data.length === 0) {
        setSeries([0, 0, 0, 0]);
        return;
      }

      const [hocKy, namStart, namEnd] = semester.split(" - ");
      const filtered = data.filter(
        (d) =>
          d["Ten Hoc Ky"] === hocKy &&
          d["Ten Nam Hoc"] === namStart + " - " + namEnd
      );

      console.log("Filtered:", filtered);

      // If no match → empty chart
      if (filtered.length === 0) {
        setSeries([0, 0, 0, 0]);
        return;
      }

      // -----------------------------
      // 3) Sum up the values
      // -----------------------------
      let gioi = 0,
        kha = 0,
        tb = 0,
        yeu = 0;

      filtered.forEach((d) => {
        gioi += d.TyLe_Gioi;
        kha += d.TyLe_Kha;
        tb += d.TyLe_TB;
        yeu += d.TyLe_Yeu;
      });

      // -----------------------------
      // 4) Convert to percent
      // -----------------------------
      const total = gioi + kha + tb + yeu || 1;

      const result = [
        (gioi / total) * 100,
        (kha / total) * 100,
        (tb / total) * 100,
        (yeu / total) * 100,
      ];

      setSeries(result);
    } catch (err) {
      console.error("Lỗi tải dữ liệu donut:", err);
      setSeries([0, 0, 0, 0]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [mssv, semester]);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false },
    },

    stroke: { width: 0 },
    legend: {
      position: "bottom",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
      labels: { colors: COLORS[1] },
    },
    tooltip: {
      enabled: true,
      shared: false,
      followCursor: false,
      fillSeriesColor: false,
      theme: "light",

      style: {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },

      y: {
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },

      marker: {
        show: true,
      },
    },
    dataLabels: { enabled: false },
    labels,
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
              label: "Tổng",
              formatter: () => "100%",
            },
          },
        },
      },
    },
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}
    >
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-white/90">
            Tỷ lệ học lực theo môn
          </h3>
        </div>
      </header>

      <div className="mt-6 -mx-4">
        {loading ? (
          <div className="text-center py-10 text-blue-600">Đang tải...</div>
        ) : (
          <Chart options={options} series={series} type="donut" height={280} />
        )}
      </div>
    </div>
  );
}
