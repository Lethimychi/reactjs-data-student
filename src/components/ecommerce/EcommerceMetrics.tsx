import { useEffect, useState } from "react";
import { BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import {
  fetchStudentCount,
  fetchClassPerformance,
} from "../../utils/ClassLecturerApi";

interface Props {
  selectedSemesterId?: number | null;
  selectedClassId?: number | null;
  selectedClassName?: string | null;
  studentTotalOverride?: number; // allow override from parent if already loaded
}

export default function EcommerceMetrics({
  selectedSemesterId,
  selectedClassId,
  selectedClassName,
  studentTotalOverride,
}: Props) {
  const shorten = (s: string, max = 12) =>
    s && s.length > max ? s.slice(0, max) + "…" : s;
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [passRate, setPassRate] = useState<number>(0); // 0..1
  const [debtCount, setDebtCount] = useState<number>(0);

  void shorten;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (studentTotalOverride !== undefined) {
        setStudentCount(studentTotalOverride);
        return;
      }
      if (!selectedClassName) {
        setStudentCount(0);
        return;
      }
      setLoading(true);
      try {
        const count = await fetchStudentCount(selectedClassName);
        if (!cancelled) setStudentCount(count ?? 0);
      } catch {
        if (!cancelled) setStudentCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    selectedSemesterId,
    selectedClassId,
    selectedClassName,
    studentTotalOverride,
  ]);

  // Load performance (Ty_Le_Dau & So_Rot)
  useEffect(() => {
    let cancelled = false;
    const loadPerf = async () => {
      if (!selectedClassName || !selectedSemesterId) {
        // Chưa chọn học kỳ => giữ 0 và chờ người dùng
        setPassRate(0);
        setDebtCount(0);
        return;
      }
      try {
        // Chỉ load khi có đủ lớp & học kỳ
        const perf = await fetchClassPerformance(
          selectedClassName,
          undefined // sẽ truyền displayName nếu cần trong tương lai
        );
        if (!cancelled) {
          setPassRate(perf.passRate ?? 0);
          setDebtCount(perf.debtCount ?? 0);
        }
      } catch {
        if (!cancelled) {
          setPassRate(0);
          setDebtCount(0);
        }
      }
    };
    void loadPerf();
    return () => {
      cancelled = true;
    };
  }, [selectedSemesterId, selectedClassName]);

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
              {loading ? "..." : studentCount.toLocaleString()}
            </h4>
          </div>
          <Badge color="success">30 Nam - 30 Nữ</Badge>
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
              {(passRate * 100).toFixed(0)}%
            </h4>
          </div>
          <Badge color={passRate >= 0.5 ? "success" : "error"}>
            {(passRate * 100).toFixed(1)}%
          </Badge>
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
              {debtCount.toString()}
            </h4>
          </div>
          <Badge color={debtCount === 0 ? "success" : "error"}>
            {`${debtCount} SV`}
          </Badge>
        </div>
      </div>

      {/* Academic Advisor Dashboard */}
    </div>
  );
}
