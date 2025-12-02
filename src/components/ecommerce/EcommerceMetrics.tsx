import { useMemo } from "react";
import { BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import { AdvisorDashboardData } from "../../utils/ClassLecturerApi";

interface Props {
  selectedSemesterId?: number | null;
  selectedClassId?: number | null;
  selectedClassName?: string | null;
  studentTotalOverride?: number; // allow override from parent if already loaded
  advisorData?: AdvisorDashboardData | null;
  loading?: boolean;
  error?: unknown;
}

export default function EcommerceMetrics({
  studentTotalOverride,
  advisorData,
  loading,
}: Props) {
  const shorten = (s: string, max = 12) =>
    s && s.length > max ? s.slice(0, max) + "…" : s;
  void shorten;

  const derived = useMemo(() => {
    const studentCount = studentTotalOverride ?? advisorData?.studentCount ?? 0;
    let passRateRaw: number | null = null;
    let debtCount: number | null = null;
    if (advisorData?.passFailRate) {
      const passVal = advisorData.passFailRate.pass ?? null;
      passRateRaw =
        passVal !== null ? (passVal > 1 ? passVal / 100 : passVal) : null;
      debtCount = advisorData.passFailRate.fail ?? null;
    }
    const male = advisorData?.genderStats?.male ?? null;
    const female = advisorData?.genderStats?.female ?? null;
    // prev values not available from single aggregated call; keep null
    const prevPassRate = null;
    const prevDebt = null;
    const isLoading = loading ?? false;
    return {
      studentCount,
      passRateRaw,
      debtCount,
      male,
      female,
      prevPassRate,
      prevDebt,
      isLoading,
    };
  }, [advisorData, studentTotalOverride, loading]);

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
              {derived.isLoading
                ? "..."
                : derived.studentCount.toLocaleString()}
            </h4>
          </div>
          <Badge color="success">
            {derived.male === null || derived.female === null
              ? "—"
              : `${derived.male.toString()} Nam - ${derived.female.toString()} Nữ`}
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
              {derived.passRateRaw === null
                ? "—"
                : `${(derived.passRateRaw * 100).toFixed(0)}%`}
            </h4>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {derived.passRateRaw === null ? (
              <Badge color="light">Không có dữ liệu</Badge>
            ) : derived.prevPassRate === null ? (
              <Badge color={derived.passRateRaw >= 0.5 ? "success" : "error"}>
                {(derived.passRateRaw * 100).toFixed(1)}%
              </Badge>
            ) : (
              (() => {
                const delta =
                  (derived.passRateRaw - (derived.prevPassRate ?? 0)) * 100;
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
              {derived.debtCount === null ? "—" : derived.debtCount.toString()}
            </h4>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {derived.debtCount === null ? (
              <Badge color="light">Không có dữ liệu</Badge>
            ) : derived.prevDebt === null ? (
              <Badge color={derived.debtCount === 0 ? "success" : "error"}>
                {`${derived.debtCount} SV`}
              </Badge>
            ) : (
              (() => {
                const delta = derived.debtCount - (derived.prevDebt ?? 0);
                const improved = derived.debtCount < (derived.prevDebt ?? 0);
                const pct =
                  (derived.prevDebt ?? 0) > 0
                    ? (delta / (derived.prevDebt ?? 1)) * 100
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
