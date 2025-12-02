import { useEffect, useState } from "react";
import {
  fetchPassRateBySubject,
  SubjectPassRate,
  AdvisorDashboardData,
} from "../../utils/ClassLecturerApi";
import FilterHelper from "../UserProfile/helper/BreakSemesterFilter";

export default function TopFailingSubjectsChart({
  className,
  selectedClassName,
  selectedSemesterDisplayName,
  advisorData,
  loading: advisorLoading,
}: {
  className?: string;
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
  advisorData?: AdvisorDashboardData | null;
  loading?: boolean;
}) {
  const [data, setData] = useState<SubjectPassRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const cls = (selectedClassName as string) || undefined;
    const sem = (selectedSemesterDisplayName as string) || undefined;
    var separateSemester = FilterHelper(sem || "");
    const load = async () => {
      if (!cls || !sem) {
        setData([]);
        return;
      }

      // Prefer advisorData if available
      if (
        advisorData &&
        Array.isArray(advisorData.passRateBySubject) &&
        advisorData.passRateBySubject.length
      ) {
        try {
          const mapped = advisorData.passRateBySubject.map(
            (p) =>
              ({
                tenMonHoc: p.subject || "",
                tongSVMon: undefined,
                svQuaMon: undefined,
                tiLeQuaMon: (p.passRate ?? 0) / 100,
              } as SubjectPassRate)
          );
          mapped.sort((a, b) => (b.tiLeQuaMon ?? 0) - (a.tiLeQuaMon ?? 0));
          setData(mapped);
          setLoading(false);
          setError(null);
          return;
        } catch (err) {
          console.error("AcademicPerformanceRate mapping error:", err);
        }
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetchPassRateBySubject(cls, sem);
        console.log("Fetched pass rate by subject (all):", separateSemester);
        const filtered = res.filter(
          (x) =>
            x.tenNamHoc === separateSemester.year &&
            x.tenHocKy === separateSemester.semester
        );
        if (!mounted) return;
        if (!res || res.length === 0) {
          setData([]);
        } else {
          const mapped = filtered.map((r) => ({ ...r }));
          mapped.sort((a, b) => (b.tiLeQuaMon ?? 0) - (a.tiLeQuaMon ?? 0));
          setData(mapped);
        }
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError("Không thể tải dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // If parent advisorLoading is true, reflect loading state
    if (advisorLoading) {
      setLoading(true);
      setData([]);
      return;
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [
    selectedClassName,
    selectedSemesterDisplayName,
    advisorData,
    advisorLoading,
  ]);

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Số lượng sinh viên đậu theo từng môn
      </h4>
      <p className="text-sm text-slate-500 mb-6">
        {selectedClassName && (
          <span className="text-xs text-slate-500">
            Lớp: <span className="font-medium">{selectedClassName}</span>
            {selectedSemesterDisplayName && (
              <span>{" • " + selectedSemesterDisplayName}</span>
            )}
          </span>
        )}
      </p>
      <div className={className ?? "w-full h-64"}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            Đang tải...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-sm text-red-600">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-500">
            Không có dữ liệu
          </div>
        ) : (
          <div
            className={
              data.length > 5
                ? "space-y-4 overflow-y-auto max-h-72 pr-2"
                : "space-y-4"
            }
          >
            {data.map((d) => {
              const ratePercent = (d.tiLeQuaMon ?? 0) * 100;
              const failed = (d.tongSVMon ?? 0) - (d.svQuaMon ?? 0);
              return (
                <div key={d.tenMonHoc} className="relative group">
                  <div className="flex justify-between text-sm mb-2">
                    <div className="text-slate-700 font-medium">
                      {d.tenMonHoc}
                    </div>
                    <div className="text-slate-500">
                      {ratePercent.toFixed(1)}%
                    </div>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ratePercent)}%` }}
                    />
                  </div>

                  {/* Tooltip (styled) */}
                  <div
                    role="tooltip"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 bottom-full mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                  >
                    <div className="bg-white border border-slate-200 text-slate-800 text-xs rounded shadow-lg px-3 py-2">
                      <div className="font-medium truncate">{d.tenMonHoc}</div>
                      <div className="text-slate-500 text-[13px]">
                        Tổng:{" "}
                        <span className="font-medium">{d.tongSVMon ?? 0}</span>
                      </div>
                      <div className="text-slate-500 text-[13px]">
                        Đậu:{" "}
                        <span className="font-medium">{d.svQuaMon ?? 0}</span>
                      </div>
                      <div className="text-slate-500 text-[13px]">
                        Rớt: <span className="font-medium">{failed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
