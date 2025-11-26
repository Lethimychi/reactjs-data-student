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
import RecentOrders from "../../components/analytics/RecentOrders";

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
      "bg-gradient-to-br from-blue-600 to-blue-400 text-white",
  },
  {
    title: "Số tín chỉ đăng kí",
    value: "20",
    //change: "-0.1%",
    changeLabel: "vs last month",
    trendDirection: "down" as const,
    accentColor: "#F7936F",
    backgroundClassName:
      "bg-gradient-to-br from-blue-500 to-blue-400 text-white",
  },
  {
    title: "Tỷ lệ qua môn",
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
import {
  fetchStudentInfo,
  fetchStudentAccumulatedGPA,
  fetchStudentPassRate,
  fetchStudentGpaTrend,
  fetchStudentRegisteredCredits,
} from "../../utils/StudentsLectures";
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
  const [gpaData, setGpaData] = useState<unknown>(null);
  const [passRateData, setPassRateData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [gpaTrendData, setGpaTrendData] = useState<unknown>(null);
  const [creditsData, setCreditsData] = useState<unknown>(null);

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
        const info = await fetchStudentInfo(
          masv,
          selectedSemesterDisplayName ?? undefined
        );
        if (!mounted) return;
        setStudentInfo(info);
      } catch (e) {
        console.error("Không thể tải thông tin sinh viên", e);
        if (mounted) setStudentInfo(null);
      }
      try {
        // Accumulated GPA should represent the student's overall GPA
        // (not filtered by the currently-selected semester). Do not
        // pass `selectedSemesterDisplayName` here so the backend
        // returns the overall accumulated GPA.
        const gpa = await fetchStudentAccumulatedGPA(masv);
        if (!mounted) return;
        setGpaData(gpa);
      } catch (e) {
        console.error("Không thể tải GPA tích lũy", e);
        if (mounted) setGpaData(null);
      }
      try {
        const pass = await fetchStudentPassRate(
          masv,
          selectedSemesterDisplayName ?? undefined
        );
        if (!mounted) return;
        // API client returns `unknown`; coerce to the state type expected
        // by the component. If the API shape differs, downstream code
        // already handles alternate shapes.
        setPassRateData(pass as Record<string, unknown> | null);
      } catch (e) {
        console.error("Không thể tải tỷ lệ qua môn", e);
        if (mounted) setPassRateData(null);
      }
      try {
        // Fetch GPA trend (all semesters)
        const trend = await fetchStudentGpaTrend(masv);
        if (!mounted) return;
        setGpaTrendData(trend);
      } catch (e) {
        console.error("Không thể tải xu hướng GPA", e);
        if (mounted) setGpaTrendData(null);
      }
      try {
        // Fetch registered credits (all semesters)
        const credits = await fetchStudentRegisteredCredits(masv);
        if (!mounted) return;
        setCreditsData(credits);
      } catch (e) {
        console.error("Không thể tải số tín chỉ đăng kí", e);
        if (mounted) setCreditsData(null);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [location.search, selectedSemesterDisplayName]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchSemesters();
        if (!mounted) return;

        // Sort semesters: Year DESC, Term DESC
        // Format expected: "HK1 - 2023-2024" or similar
        const sorted = (data || []).sort((a, b) => {
          const parse = (name: string) => {
            const parts = name.split(" - ");
            let year = 0;
            let term = 0;
            if (parts.length === 2) {
              // "HK1", "2023-2024"
              const tStr = parts[0].trim(); // HK1
              const yStr = parts[1].trim(); // 2023-2024
              const tMatch = tStr.match(/\d+/);
              if (tMatch) term = parseInt(tMatch[0], 10);
              const yMatch = yStr.match(/^(\d+)/); // take start year
              if (yMatch) year = parseInt(yMatch[1], 10);
            } else {
              // fallback if format differs
              return 0;
            }
            return year * 10 + term;
          };
          return parse(b.name) - parse(a.name);
        });

        setSemesters(sorted);
        // if no prop provided, set first semester (latest) as default
        if (!propSemester && sorted.length > 0) {
          setSelectedSemesterDisplayName((prev) => prev || sorted[0].name);
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
            <h2 className="text-2xl font-semibold text-slate-700 mt-1 d-">
              {studentInfo ? (
                <>
                  {String(
                    studentInfo["Ma Sinh Vien"] ??
                      studentInfo["masv"] ??
                      studentInfo["MaSinhVien"] ??
                      studentInfo["Ma SV"] ??
                      "-"
                  )}{" "}
                  -{" "}
                  {String(
                    studentInfo["Ho Ten"] ??
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
              {studentInfo ? (
                <>
                  Lớp:{" "}
                  {String(
                    studentInfo["Ten Lop"] ??
                      studentInfo["lop"] ??
                      studentInfo["Ten Lop"] ??
                      "-"
                  )}
                  {studentInfo["Ten Khu Vuc"] && (
                    <>
                      {" | Khu vực: "}
                      {String(studentInfo["Ten Khu Vuc"])}
                    </>
                  )}
                </>
              ) : (
                "Chọn sinh viên để xem chi tiết học tập và xu hướng GPA."
              )}
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
                <span className="text-sm text-gray-700">
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
            {statCards.map((card, idx) => {
              // compute display values for KPI cards using fetched payloads
              let displayValue = card.value;
              let displayChange = card.changeLabel ?? "";
              const displayTrend = card.trendDirection;

              if (card.title === "GPA tích lũy") {
                // prefer gpaData (fetchStudentAccumulatedGPA)
                let gpaValue: number | null = null;
                let rank: string | null = null;
                try {
                  if (gpaData !== null && gpaData !== undefined) {
                    if (typeof gpaData === "number") {
                      gpaValue = Number(gpaData);
                    } else if (typeof gpaData === "string") {
                      const parsed = Number(gpaData.trim());
                      gpaValue = Number.isFinite(parsed) ? parsed : null;
                    } else if (Array.isArray(gpaData) && gpaData.length > 0) {
                      const first = gpaData[0] as Record<string, unknown>;
                      gpaValue = Number(
                        first["GPA_ToanKhoa"] ??
                          first["GPA"] ??
                          first["gpa"] ??
                          first["DiemTB"] ??
                          null
                      );
                      if (Number.isNaN(gpaValue)) gpaValue = null;
                      rank = (first["Loai_Hoc_Luc_ToanKhoa"] ??
                        first["HocLuc"] ??
                        null) as string | null;
                    } else if (typeof gpaData === "object") {
                      const obj = gpaData as Record<string, unknown>;
                      gpaValue = Number(
                        obj["GPA_ToanKhoa"] ??
                          obj["GPA"] ??
                          obj["gpa"] ??
                          obj["DiemTB"] ??
                          null
                      );
                      if (Number.isNaN(gpaValue)) gpaValue = null;
                      rank = (obj["Loai_Hoc_Luc_ToanKhoa"] ??
                        obj["HocLuc"] ??
                        null) as string | null;
                    }
                  }
                } catch (e) {
                  console.debug("parse gpaData failed", e);
                }

                if (gpaValue !== null && !Number.isNaN(gpaValue)) {
                  // round GPA to 2 decimal places
                  displayValue = Number(gpaValue).toFixed(2);
                  displayChange = rank ? `Học lực: ${rank}` : "";
                } else {
                  displayValue = "7.0";
                  displayChange = "Toàn khóa";
                }
              }

              if (card.title === "Số tín chỉ đăng kí") {
                // Try to find credit info from creditsData based on selected semester
                let credits: number | null = null;
                if (
                  creditsData &&
                  Array.isArray(creditsData) &&
                  selectedSemesterDisplayName
                ) {
                  // Format of selectedSemesterDisplayName: "HK1 - 2024-2025"
                  // Format of API data: { "Ten Nam Hoc": "2024-2025", "Ten Hoc Ky": "HK1", "TongTinChi": 4 }
                  const parts = selectedSemesterDisplayName.split(" - ");
                  if (parts.length === 2) {
                    const term = parts[0].trim();
                    const year = parts[1].trim();
                    const match = (
                      creditsData as Record<string, unknown>[]
                    ).find(
                      (r) =>
                        String(r["Ten Hoc Ky"]).trim() === term &&
                        String(r["Ten Nam Hoc"]).trim() === year
                    );
                    if (match) {
                      credits = Number(match["TongTinChi"]);
                    }
                  } else {
                    // Fallback if format is just "HK1" or similar
                    const term = selectedSemesterDisplayName.trim();
                    const match = (
                      creditsData as Record<string, unknown>[]
                    ).find((r) => String(r["Ten Hoc Ky"]).trim() === term);
                    if (match) {
                      credits = Number(match["TongTinChi"]);
                    }
                  }
                }

                // Fallback to studentInfo if not found in creditsData
                if (credits === null && studentInfo) {
                  const raw =
                    studentInfo["SoTinChi"] ??
                    studentInfo["TongSoTinChi"] ??
                    studentInfo["Credits"];
                  if (raw !== undefined && raw !== null) {
                    credits = Number(raw);
                  }
                }
                // If not in studentInfo, check gpaData if it's an object
                if (
                  credits === null &&
                  gpaData &&
                  typeof gpaData === "object" &&
                  !Array.isArray(gpaData)
                ) {
                  const obj = gpaData as Record<string, unknown>;
                  const raw =
                    obj["SoTinChi"] ??
                    obj["TongSoTinChi"] ??
                    obj["Credits"] ??
                    obj["SoTC"];
                  if (raw !== undefined && raw !== null) {
                    credits = Number(raw);
                  }
                }

                if (credits !== null && !Number.isNaN(credits)) {
                  displayValue = String(credits);
                  displayChange = "Trên học kỳ"; // clear "vs last month" if real data
                }
              }

              if (card.title === "Tỷ lệ qua môn") {
                let rateStr = "50.00%";
                try {
                  if (passRateData) {
                    if (
                      Array.isArray(passRateData) &&
                      passRateData.length > 0
                    ) {
                      let totalPassed = 0;
                      let totalTaken = 0;
                      const arr = passRateData as Array<
                        Record<string, unknown>
                      >;
                      arr.forEach((item) => {
                        const pass =
                          Number(
                            item["So_Mon_Dau"] ??
                              item["SoMonDau"] ??
                              item["SoMonDa"] ??
                              0
                          ) || 0;
                        const total =
                          Number(
                            item["Tong_Mon"] ??
                              item["TongMon"] ??
                              item["Tong_Mon_Hoc"] ??
                              0
                          ) || 0;
                        totalPassed += pass;
                        totalTaken += total;
                      });
                      if (totalTaken > 0)
                        rateStr = `${((totalPassed / totalTaken) * 100).toFixed(
                          2
                        )}%`;
                      else rateStr = "0.00%";
                    } else if (typeof passRateData === "object") {
                      const obj = passRateData as Record<string, unknown>;
                      const raw =
                        obj["Ty_Le_Dau"] ??
                        obj["TiLe_Dau"] ??
                        obj["TyLeDau"] ??
                        null;
                      if (raw !== null && raw !== undefined) {
                        const num = Number(raw);
                        if (!Number.isNaN(num))
                          rateStr =
                            num <= 1
                              ? `${(num * 100).toFixed(2)}%`
                              : `${Number(num).toFixed(2)}%`;
                      }
                    }
                  }
                } catch (e) {
                  console.debug("parse passRateData failed", e);
                }

                displayValue = rateStr === "50.00%" ? "50.00%" : rateStr;
                displayChange =
                  displayValue === "50.00%" ? "50.00%" : "với học kỳ";
              }

              return (
                <div key={card.title ?? idx} className="h-full">
                  <AnalyticsStatCard
                    {...card}
                    value={displayValue}
                    changeLabel={displayChange}
                    trendDirection={displayTrend}
                  />
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <GpaTrendByStudents
              className="h-40"
              height={160}
              data={
                Array.isArray(gpaTrendData)
                  ? (
                      gpaTrendData as {
                        "Ten Nam Hoc": string;
                        "Ten Hoc Ky": string;
                        GPA: number;
                      }[]
                    ).map((item) => ({
                      semester: `${item["Ten Hoc Ky"]} - ${item["Ten Nam Hoc"]}`,
                      gpa: item.GPA,
                    }))
                  : undefined
              }
              useMock={!gpaTrendData}
            />
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
        <div>
          <RecentOrders
            selectedSemesterDisplayName={selectedSemesterDisplayName}
          />
        </div>
      </div>
    </>
  );
}
