import { useEffect, useState } from "react";
import { ArrowDownIcon, BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import { fetchStudentStats } from "../../utils/ClassLecturerApi";

interface Props {
  selectedSemesterId?: number | null;
  selectedClassId?: number | null;
  selectedClassName?: string | null;
}

export default function EcommerceMetrics({
  selectedSemesterId,
  selectedClassId,
  selectedClassName,
}: Props) {
  const classList = [
    {
      id: 1,
      name: "CNTT K59",
      instructor: "Nguyễn A",
      students: 28,
      avgGPA: 3.42,
    },
    {
      id: 2,
      name: "CNTT K60",
      instructor: "Trần B",
      students: 32,
      avgGPA: 3.21,
    },
    { id: 3, name: "Mạng K59", instructor: "Lê C", students: 25, avgGPA: 3.1 },
    {
      id: 4,
      name: "An toàn K59",
      instructor: "Phạm D",
      students: 22,
      avgGPA: 3.05,
    },
  ];

  const shorten = (s: string, max = 12) =>
    s && s.length > max ? s.slice(0, max) + "…" : s;
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  void shorten;
  void classList;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const stats = await fetchStudentStats(selectedClassName ?? undefined);
        if (!cancelled && stats) {
          setStudentCount(stats["Tong_SV"]);
        }
      } catch (err) {
        console.error("Failed to load student stats", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedSemesterId, selectedClassId, selectedClassName]);

  return (
    <div className="space-y-6">
      {/* Filters row: placed first and horizontal */}

      {/* Top ecommerce metrics (kept intact) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end  mt-2 w-45 h-21">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Sinh viên
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {loading ? "..." : studentCount.toLocaleString()}
              </h4>
            </div>
            <Badge color="success">30 Nam - 30 Nữ</Badge>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5 w-42 ">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tỷ lệ qua môn
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                80.8%
              </h4>
            </div>

            <Badge color="error">
              <ArrowDownIcon />
              9.05%
            </Badge>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5 w-47">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Sinh viên nợ môn
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 w-10">
                10
              </h4>
            </div>
            <div style={{ position: "relative", left: "-20px" }}>
              <Badge color="error">
                <ArrowDownIcon />
                9.05%
              </Badge>
            </div>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}
      </div>

      {/* Academic Advisor Dashboard */}
    </div>
  );
}
