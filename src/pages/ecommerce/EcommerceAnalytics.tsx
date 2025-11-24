//import PageMeta from "../../components/common/PageMeta";
//import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import AnalyticsStatCard from "../../components/analytics/AnalyticsStatCard";
import CurrentVisitsDonut from "../../components/analytics/CurrentVisitsDonut";
import WebsiteVisitsColumnChart from "../../components/analytics/WebsiteVisitsColumnChart";
// import ConversionRatesList from "../../components/analytics/ConversionRatesList";
// import SubjectPerformanceRadar from "../../components/analytics/SubjectPerformanceRadar";
// import LatestNewsCard from "../../components/analytics/LatestNewsCard";
// import OrderTimelineCard from "../../components/analytics/OrderTimelineCard";
import GpaTrendByStudents from "../../components/analytics/GpaTrendByStudents";

// import ScoreDetail from "../../components/analytics/ScoreDetail";
// charts used elsewhere kept in repo but not shown in this layout

const statCards = [
  {
    title: "GPA tích lũy",
    value: "714k",
    //change: "+2.6%",
    changeLabel: "vs last week",
    trendDirection: "up" as const,
    accentColor: "#8bb4ffff",
    backgroundClassName:
      "bg-gradient-to-br from-blue-600 to-blue-500 text-white",
  },
  {
    title: "Số tín chỉ đăng kí",
    value: "1.35m",
    //change: "-0.1%",
    changeLabel: "vs last month",
    trendDirection: "down" as const,
    accentColor: "#F7936F",
    backgroundClassName:
      "bg-gradient-to-br from-blue-500 to-blue-400 text-white",
  },
  {
    title: "Tỷ lệ qua môn ",
    value: "1.72m",
    //change: "+2.8%",
    changeLabel: "vs last month",
    trendDirection: "up" as const,
    accentColor: "#34D399",
    backgroundClassName:
      "bg-gradient-to-br from-blue-400 to-blue-300 text-white",
  },
  // {
  //   title: "Messages",
  //   value: "234",
  //   change: "+3.6%",
  //   changeLabel: "vs last day",
  //   trendDirection: "up" as const,
  //   accentColor: "#F472B6",
  //   backgroundClassName:
  //     "bg-gradient-to-br from-rose-400 via-rose-400/90 to-pink-500 text-white",
  //   sparklineData: [10, 14, 12, 16, 18, 15, 19, 22],
  // },
];

import { fetchSemesters } from "../../utils/ClassLecturerApi";
import { useLocation } from "react-router-dom";
import { fetchStudentInfo } from "../../utils/StudentsLectures";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { useRef } from "react";

export default function EcommerceAnalytics({
  selectedSemesterDisplayName: propSemester,
}: {
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
}) {
  const [semesters, setSemesters] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedSemesterDisplayName, setSelectedSemesterDisplayName] =
    useState<string | null>(propSemester ?? null);
  const [studentInfo, setStudentInfo] = useState<Record<
    string,
    unknown
  > | null>(null);

  const location = useLocation();
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const semBtnRef = useRef<HTMLButtonElement | null>(null);
  // extract masv query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const masv = params.get("masv");
    let mounted = true;
    if (!masv) {
      setStudentInfo(null);
      return;
    }
    const load = async () => {
      try {
        const info = await fetchStudentInfo(masv);
        if (!mounted) return;
        setStudentInfo(info);
      } catch (e) {
        console.error("Không thể tải thông tin sinh viên", e);
        if (mounted) setStudentInfo(null);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [location.search]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchSemesters();
        if (!mounted) return;
        setSemesters(data || []);
        // if no prop provided, set first semester as default
        if (!propSemester && data && data.length) {
          setSelectedSemesterDisplayName((prev) => prev || data[0].name);
        }
      } catch (e) {
        console.error("Không thể tải danh sách học kỳ", e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [propSemester]);
  return (
    <>
      {/* <PageMeta
        title="Advanced Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="Advanced ecommerce analytics dashboard highlighting KPIs, traffic insights, conversion performance, and order timeline."
      />
      <PageBreadcrumb pageTitle="Ecommerce Analytics" /> */}

      <div className="space-y-6 bg-white p-6 rounded-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-700 mt-1">
              {studentInfo ? (
                <>
                  {String(
                    studentInfo["masv"] ??
                      studentInfo["MaSinhVien"] ??
                      studentInfo["Ma SV"] ??
                      "-"
                  )}{" "}
                  -{" "}
                  {String(
                    studentInfo["hoTen"] ??
                      studentInfo["Ho Ten"] ??
                      studentInfo["ten"] ??
                      "-"
                  )}
                </>
              ) : (
                "Mã số sinh viên: (chưa chọn)"
              )}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {studentInfo
                ? `Lớp: ${String(
                    studentInfo["lop"] ?? studentInfo["Ten Lop"] ?? "-"
                  )} • Khoa: ${String(
                    studentInfo["khoa"] ?? studentInfo["Bo Mon"] ?? "-"
                  )}`
                : "Chọn sinh viên để xem chi tiết học tập và xu hướng GPA."}
            </p>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm text-slate-500 mb-1">Học kỳ</label>
            <div className="relative inline-block">
              <button
                ref={semBtnRef}
                type="button"
                onClick={() => setIsSemesterOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isSemesterOpen}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <span className="truncate max-w-[14rem]">
                  {selectedSemesterDisplayName ?? "Không có dữ liệu"}
                </span>
                <svg
                  className={`ml-1 h-4 w-4 text-gray-400 transition-transform duration-150 ${
                    isSemesterOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <Dropdown
                isOpen={isSemesterOpen}
                onClose={() => setIsSemesterOpen(false)}
                className="w-56 mt-1 text-sm"
              >
                {semesters && semesters.length ? (
                  semesters.map((s) => (
                    <DropdownItem
                      key={s.id}
                      onItemClick={() => {
                        setSelectedSemesterDisplayName(s.name);
                        setIsSemesterOpen(false);
                      }}
                    >
                      {s.name}
                    </DropdownItem>
                  ))
                ) : (
                  <DropdownItem onItemClick={() => setIsSemesterOpen(false)}>
                    Không có dữ liệu
                  </DropdownItem>
                )}
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Summary KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {statCards.map((card, idx) => (
              <div key={card.title ?? idx} className="h-full">
                <AnalyticsStatCard {...card} />
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <GpaTrendByStudents className="h-40" height={160} />
          </div>
        </div>

        {/* Large charts row: Pie (donut) + Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div className="h-full">
            <CurrentVisitsDonut className="h-full" />
          </div>

          <div className="h-full">
            <WebsiteVisitsColumnChart className="h-full" />
          </div>
        </div>
        {/* (other optional widgets were removed to simplify layout) */}
      </div>
    </>
  );
}
