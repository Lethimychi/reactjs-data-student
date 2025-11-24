import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import {
  fetchStudentCount,
  fetchClassPerformance,
  fetchGenderCountByClass,
  fetchSemesters,
} from "../../utils/ClassLecturerApi";

interface Props {
  selectedSemesterId?: number | null;
  selectedClassId?: number | null;
  selectedClassName?: string | null;
  studentTotalOverride?: number; // allow override from parent if already loaded
}

export default function EcommerceMetrics({
  selectedSemesterId,
  selectedClassName,
  studentTotalOverride,
}: Props) {
  const shorten = (s: string, max = 12) =>
    s && s.length > max ? s.slice(0, max) + "…" : s;
  const [studentCount, setStudentCount] = useState<number>(0);
  const [passRate, setPassRate] = useState<number | null>(null); // 0..1 or null when no data
  const [debtCount, setDebtCount] = useState<number | null>(null);
  const [maleCount, setMaleCount] = useState<number | null>(null);
  const [femaleCount, setFemaleCount] = useState<number | null>(null);
  const [prevPassRate, setPrevPassRate] = useState<number | null>(null);
  const [prevDebtCount, setPrevDebtCount] = useState<number | null>(null);

  void shorten;

  const studentCountQuery = useQuery({
    queryKey: ["studentCount", selectedClassName],
    queryFn: async () => fetchStudentCount(selectedClassName ?? undefined),
    enabled: !!selectedClassName && studentTotalOverride === undefined,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (studentTotalOverride !== undefined) {
      setStudentCount(studentTotalOverride);
      return;
    }
    if (studentCountQuery.isLoading) return;
    if (studentCountQuery.isError) {
      console.error(studentCountQuery.error);
      setStudentCount(0);
      return;
    }
    setStudentCount(studentCountQuery.data ?? 0);
  }, [
    studentTotalOverride,
    studentCountQuery.isLoading,
    studentCountQuery.isError,
    studentCountQuery.data,
    studentCountQuery.error,
  ]);

  // Load male/female counts for the selected class
  const genderQuery = useQuery({
    queryKey: ["genderCount", selectedClassName],
    queryFn: async () =>
      fetchGenderCountByClass(selectedClassName ?? undefined),
    enabled: !!selectedClassName,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!selectedClassName) {
      setMaleCount(null);
      setFemaleCount(null);
      return;
    }
    if (genderQuery.isLoading) return;
    if (genderQuery.isError) {
      console.error(genderQuery.error);
      setMaleCount(null);
      setFemaleCount(null);
      return;
    }
    setMaleCount(genderQuery.data?.male ?? 0);
    setFemaleCount(genderQuery.data?.female ?? 0);
  }, [
    selectedClassName,
    genderQuery.isLoading,
    genderQuery.isError,
    genderQuery.data,
    genderQuery.error,
  ]);

  // Load performance (Ty_Le_Dau & So_Rot)
  const perfQuery = useQuery({
    queryKey: ["classPerformance", selectedClassName, selectedSemesterId],
    queryFn: async () => {
      if (!selectedClassName || !selectedSemesterId) return null;
      const semesters = await fetchSemesters();
      const idx = semesters.findIndex((s) => s.id === selectedSemesterId);
      const currentSemesterName = idx >= 0 ? semesters[idx].name : undefined;
      const prevSemesterName = idx > 0 ? semesters[idx - 1].name : undefined;

      const [currPerf, prevPerf] = await Promise.all([
        fetchClassPerformance(selectedClassName, currentSemesterName),
        prevSemesterName
          ? fetchClassPerformance(selectedClassName, prevSemesterName)
          : Promise.resolve({ passRate: null, debtCount: null }),
      ]);

      // verify existence of per-student GPAs
      let hasStudentGpa = true;
      try {
        const { fetchStudentGPAs } = await import(
          "../../utils/ClassLecturerApi"
        );
        const studentRecords = await fetchStudentGPAs(
          selectedClassName,
          currentSemesterName
        );
        if (!studentRecords || studentRecords.length === 0)
          hasStudentGpa = false;
      } catch {
        hasStudentGpa = true;
      }

      return { currPerf, prevPerf, hasStudentGpa };
    },
    enabled: !!selectedClassName && !!selectedSemesterId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!selectedClassName || !selectedSemesterId) {
      setPassRate(null);
      setDebtCount(null);
      setPrevPassRate(null);
      setPrevDebtCount(null);
      return;
    }
    if (perfQuery.isLoading) return;
    if (perfQuery.isError) {
      console.error(perfQuery.error);
      setPassRate(0);
      setDebtCount(0);
      setPrevPassRate(null);
      setPrevDebtCount(null);
      return;
    }
    const payload = perfQuery.data as {
      currPerf: { passRate: number | null; debtCount: number | null };
      prevPerf: { passRate: number | null; debtCount: number | null };
      hasStudentGpa: boolean;
    } | null;
    if (!payload) return;
    const { currPerf, prevPerf, hasStudentGpa } = payload;
    setPassRate(hasStudentGpa ? currPerf.passRate ?? null : null);
    setDebtCount(hasStudentGpa ? currPerf.debtCount ?? null : null);
    setPrevPassRate(hasStudentGpa ? prevPerf?.passRate ?? null : null);
    setPrevDebtCount(hasStudentGpa ? prevPerf?.debtCount ?? null : null);
  }, [
    selectedSemesterId,
    selectedClassName,
    perfQuery.isLoading,
    perfQuery.isError,
    perfQuery.data,
    perfQuery.error,
  ]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* KPI Cards Grid - Equal Heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
        {/* Card 1: Students */}
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200 p-6 flex flex-col justify-between h-full min-h-[160px] md:min-h-[180px]">
          <div>
            <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl mb-4">
              <GroupIcon className="text-slate-700 size-6" />
            </div>
            <span className="text-sm text-slate-500 font-medium">
              Sinh viên
            </span>
            <h4 className="mt-3 text-2xl font-bold text-slate-800">
              {studentCountQuery.isLoading
                ? "..."
                : studentCount.toLocaleString()}
            </h4>
          </div>
          <Badge color="success">
            {maleCount === null || femaleCount === null
              ? "—"
              : `${maleCount.toString()} Nam - ${femaleCount.toString()} Nữ`}
          </Badge>
        </div>

        {/* Card 2: Pass Rate */}
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200 p-6 flex flex-col justify-between h-full min-h-[160px] md:min-h-[180px]">
          <div>
            <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl mb-4">
              <BoxIconLine className="text-slate-700 size-6" />
            </div>
            <span className="text-sm text-slate-500 font-medium">
              Tỷ lệ qua môn
            </span>
            <h4 className="mt-3 text-2xl font-bold text-slate-800">
              {passRate === null ? "—" : `${(passRate * 100).toFixed(0)}%`}
            </h4>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {passRate === null ? (
              <Badge color="light">Không có dữ liệu</Badge>
            ) : prevPassRate === null ? (
              <Badge color={passRate >= 0.5 ? "success" : "error"}>
                {(passRate * 100).toFixed(1)}%
              </Badge>
            ) : (
              (() => {
                const delta = (passRate - (prevPassRate ?? 0)) * 100;
                const positive = delta > 0;
                const Icon = positive ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 5v14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5 12l7-7 7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 19V5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19 12l-7 7-7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                );

                const colorClass = positive
                  ? "text-emerald-600"
                  : "text-red-600";
                return (
                  <div
                    className={`inline-flex items-center gap-2 ${colorClass} text-sm font-medium`}
                  >
                    <span className="flex items-center">{Icon}</span>
                    <span>
                      {delta >= 0 ? "+" : ""}
                      {Math.abs(delta).toFixed(1)}%
                    </span>
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Card 3: Students with Debt (So_Rot) */}
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200 p-6 flex flex-col justify-between h-full min-h-[160px] md:min-h-[180px]">
          <div>
            <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl mb-4">
              <BoxIconLine className="text-slate-700 size-6" />
            </div>
            <span className="text-sm text-slate-500 font-medium">
              Sinh viên nợ môn
            </span>
            <h4 className="mt-3 text-2xl font-bold text-slate-800">
              {debtCount === null ? "—" : debtCount.toString()}
            </h4>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {debtCount === null ? (
              <Badge color="light">Không có dữ liệu</Badge>
            ) : prevDebtCount === null ? (
              <Badge color={debtCount === 0 ? "success" : "error"}>
                {`${debtCount} SV`}
              </Badge>
            ) : (
              (() => {
                const delta = debtCount - (prevDebtCount ?? 0);
                const improved = debtCount < (prevDebtCount ?? 0); // decrease in debt is good
                // For display: show absolute change and percent if previous > 0
                const pct =
                  (prevDebtCount ?? 0) > 0
                    ? (delta / (prevDebtCount ?? 1)) * 100
                    : null;
                const Icon = improved ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 19V5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19 12l-7 7-7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 5v14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5 12l7-7 7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                );

                const colorClass = improved
                  ? "text-emerald-600"
                  : "text-red-600";
                return (
                  <div
                    className={`inline-flex items-center gap-2 ${colorClass} text-sm font-medium`}
                  >
                    <span className="flex items-center">{Icon}</span>
                    <span>
                      {delta > 0 ? "+" : ""}
                      {delta}
                    </span>
                    {pct !== null ? (
                      <span className="text-xs text-slate-400">
                        ({Math.abs(pct).toFixed(1)}%)
                      </span>
                    ) : null}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>

      {/* Academic Advisor Dashboard */}
    </div>
  );
}
