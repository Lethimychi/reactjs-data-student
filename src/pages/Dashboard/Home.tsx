import { useEffect, useState } from "react";
import type { JSX } from "react";

import PageMeta from "../../components/common/PageMeta";
import AcademicPerformanceRate from "../../components/ecommerce/AcademicPerformanceRate";
import ClassAverageComparisonChart from "../../components/ecommerce/ClassAverageComparisonChart";
//import DemographicCard from "../../components/ecommerce/DemographicCard";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import GPAAvageClass from "../../components/ecommerce/GPA_avage_class";
import HighestLowestScoreChart from "../../components/ecommerce/HighestLowestScoreChart"; // legacy (not used now)

//import PassFailRateChart from "../../components/ecommerce/PassFailRateChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import GradeDistributionChart from "../../components/ecommerce/GradeDistributionChart";
//import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import GPA_Conduct from "../../components/ecommerce/GPA_Conduct";
import {
  Semester,
  ClassItem,
  fetchSemesters,
  fetchAllClasses,
  fetchStudentCount,
} from "../../utils/ClassLecturerApi";
import ChatBot from "../../components/chat/ChatBox";
// Note: dashboard data is loaded per-component via React Query to enable dedupe by queryKey

type LoadingState = "idle" | "loading" | "error" | "success";

export default function Home(): JSX.Element {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(
    null
  );
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(
    null
  );

  // Mặc định: lớp & học kỳ khi khởi tạo
  const DEFAULT_CLASS_NAME = "14DHBM02";
  const DEFAULT_SEMESTER_NAME = "HK2 - 2024-2025";
  const [semesterStatus, setSemesterStatus] = useState<LoadingState>("idle");
  const [classStatus, setClassStatus] = useState<LoadingState>("idle");
  const [semesterError, setSemesterError] = useState<string | null>(null);
  const [classError, setClassError] = useState<string | null>(null);
  const [studentTotal, setStudentTotal] = useState<number | null>(null);

  // Load semesters once (auto-select mặc định nếu tồn tại, fallback chọn đầu tiên)
  useEffect(() => {
    let cancelled = false;
    const loadSemesters = async () => {
      setSemesterStatus("loading");
      setSemesterError(null);
      try {
        const data = await fetchSemesters();
        if (cancelled) return;
        setSemesters(data);
        // Nếu đã có lớp mặc định hoặc lớp đã chọn thì chọn học kỳ mặc định nếu tìm thấy
        if (data.length > 0) {
          const defaultSem = data.find((s) => s.name === DEFAULT_SEMESTER_NAME);
          if (defaultSem) {
            setSelectedSemesterId(defaultSem.id);
          } else {
            // Fallback: chọn phần tử đầu tiên để không để trống
            setSelectedSemesterId(data[0].id);
          }
        } else {
          setSelectedSemesterId(null);
        }
        setSemesterStatus("success");
      } catch (error) {
        if (cancelled) return;
        setSemesters([]);
        setSelectedSemesterId(null);
        setSemesterStatus("error");
        setSemesterError(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách học kỳ."
        );
      }
    };
    void loadSemesters();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load all classes once (không lọc theo học kỳ) + chọn lớp mặc định nếu tồn tại
  useEffect(() => {
    let cancelled = false;
    const loadAllClasses = async () => {
      setClassStatus("loading");
      setClassError(null);
      try {
        const data = await fetchAllClasses();
        if (cancelled) return;
        setClasses(data);
        if (data.length > 0) {
          // Tìm lớp mặc định trước
          const defaultClass = data.find(
            (c) =>
              c.name.trim().toLowerCase() === DEFAULT_CLASS_NAME.toLowerCase()
          );
          const chosen = defaultClass || data[0];
          setSelectedClassId(chosen.id);
          setSelectedClassName(chosen.name);
        } else {
          setSelectedClassId(null);
          setSelectedClassName(null);
        }
        setClassStatus("success");
      } catch (error) {
        if (cancelled) return;
        setClasses([]);
        setSelectedClassId(null);
        setSelectedClassName(null);
        setClassStatus("error");
        setClassError(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách lớp phụ trách."
        );
      }
    };
    void loadAllClasses();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load student total when selected class changes
  useEffect(() => {
    let cancelled = false;
    const loadCount = async () => {
      if (!selectedClassName) {
        setStudentTotal(null);
        return;
      }
      try {
        const count = await fetchStudentCount(selectedClassName);
        if (!cancelled) setStudentTotal(count);
      } catch {
        if (!cancelled) setStudentTotal(null);
      }
    };
    void loadCount();
    return () => {
      cancelled = true;
    };
  }, [selectedClassName, selectedSemesterId]);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="flex flex-wrap items-center gap-20 mb-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="filter-class" className="text-sm text-gray-600">
            Lớp
          </label>
          <select
            id="filter-class"
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            value={selectedClassId ?? ""}
            onChange={(event) => {
              const { value } = event.target;
              const classId = value ? Number(value) : null;
              setSelectedClassId(classId);
              const cls = classes.find((c) => c.id === classId);
              setSelectedClassName(cls?.name ?? null);
            }}
            disabled={classStatus === "loading" || classes.length === 0}
          >
            {classStatus === "loading" && (
              <option value="">Đang tải lớp...</option>
            )}
            {classStatus === "error" && classError && (
              <option value="">{classError}</option>
            )}
            {classStatus !== "loading" && classes.length === 0 && (
              <option value="">Không có lớp phụ trách</option>
            )}
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600" htmlFor="filter-semester">
            Học kì
          </label>
          <select
            id="filter-semester"
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            value={selectedSemesterId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedSemesterId(v ? Number(v) : null);
            }}
            disabled={semesterStatus === "loading" || semesters.length === 0}
          >
            {semesterStatus === "loading" && (
              <option value="">Đang tải học kỳ...</option>
            )}
            {semesterStatus === "error" && semesterError && (
              <option value="">{semesterError}</option>
            )}
            {semesterStatus !== "loading" && semesters.length === 0 && (
              <option value="">Không có học kỳ</option>
            )}
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Removed redundant Advisor Classes Section */}

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            selectedSemesterId={selectedSemesterId}
            selectedClassId={selectedClassId}
            selectedClassName={selectedClassName}
            studentTotalOverride={studentTotal ?? undefined}
          />
        </div>

        <div className="col-span-12 xl:col-span-5 ">
          <GPAAvageClass
            selectedClassName={selectedClassName ?? undefined}
            selectedSemesterDisplayName={
              semesters.find((s) => s.id === selectedSemesterId)?.name ??
              undefined
            }
          />
        </div>
        <div className="col-span-12 xl:col-span-12 ">
          <StatisticsChart
            selectedClassName={selectedClassName ?? undefined}
            selectedSemesterDisplayName={
              semesters.find((s) => s.id === selectedSemesterId)?.name ??
              undefined
            }
          />
        </div>

        <div className="col-span-12">
          <section className="space-y-6">
            {/* <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Academic Advisor Dashboard</h3>
            </div> */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <GradeDistributionChart
                selectedClassName={selectedClassName ?? undefined}
                selectedSemesterDisplayName={
                  semesters.find((s) => s.id === selectedSemesterId)?.name ??
                  undefined
                }
              />
              {/* <PassFailRateChart /> */}
              <AcademicPerformanceRate
                className="w-full"
                selectedClassName={selectedClassName ?? undefined}
                selectedSemesterDisplayName={
                  semesters.find((s) => s.id === selectedSemesterId)?.name ??
                  undefined
                }
              />
              <HighestLowestScoreChart
                selectedClassName={selectedClassName ?? undefined}
                selectedSemesterDisplayName={
                  semesters.find((s) => s.id === selectedSemesterId)?.name ??
                  undefined
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ClassAverageComparisonChart
                selectedClassName={selectedClassName ?? undefined}
                selectedSemesterDisplayName={
                  semesters.find((s) => s.id === selectedSemesterId)?.name ??
                  undefined
                }
              />
              <GPA_Conduct
                selectedClassName={selectedClassName ?? undefined}
                selectedSemesterDisplayName={
                  semesters.find((s) => s.id === selectedSemesterId)?.name ??
                  undefined
                }
              />
            </div>
          </section>
        </div>

        <div className="col-span-12 xl:col-span-12">
          <RecentOrders selectedClassName={selectedClassName ?? undefined} />
        </div>
        <div>
          <ChatBot userType={"teacher"} />
        </div>
      </div>
    </>
  );
}
