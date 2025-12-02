import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
import { COLORS } from "../../utils/colors";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Component no longer performs its own network request by default.
// It can accept `studentsProp` and `loading` from a parent that prefetches data.

// Note: old mock tableData removed — component now fetches real students by class

export default function RecentOrders({
  selectedClassName,
  studentsProp,
  loading,
  errorMessage,
}: {
  selectedClassName?: string | null;
  studentsProp?: Array<Record<string, unknown>> | null;
  loading?: boolean;
  errorMessage?: string | null;
}) {
  const [students, setStudents] = useState<Array<
    Record<string, unknown>
  > | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5; // show 5 students per page
  const navigate = useNavigate();

  useEffect(() => {
    // If parent supplied studentsProp, use it. If not, clear data.
    if (!selectedClassName) {
      setStudents(null);
      return;
    }

    const rows = (studentsProp ?? []) as Array<Record<string, unknown>>;

    // Group rows by student id to build per-student GPA trend across semesters
    const byId = new Map<
      string,
      {
        base: Record<string, unknown>;
        trend: { semester: string; gpa: number }[];
      }
    >();

    const toNumber = (v: unknown) => {
      if (typeof v === "number") return v;
      const n = Number(String(v ?? "").trim());
      return Number.isFinite(n) ? n : 0;
    };

    const makeSemesterLabel = (r: Record<string, unknown>) => {
      const term = (r["Ten Hoc Ky"] ?? r["Ma Hoc Ky"] ?? "").toString().trim();
      const year = (r["Ten Nam Hoc"] ?? "").toString().trim();
      if (term && year) return `${term} - ${year}`;
      if (term) return term;
      if (year) return year;
      return "HK?";
    };

    for (const r of rows) {
      const id = String(
        r["Ma Sinh Vien"] ?? r["MaSV"] ?? r["MSSV"] ?? r["MaSinhVien"] ?? ""
      ).trim();
      if (!id) continue;

      const gpaRaw =
        r["GPA_HocKy"] ?? r["GPA"] ?? r["gpa"] ?? r["DiemTB"] ?? r["Diem"];
      const gpa = toNumber(gpaRaw);
      const semesterLabel = makeSemesterLabel(r);

      if (!byId.has(id)) {
        // clone base fields (keep first encountered row as base)
        const base: Record<string, unknown> = { ...r };
        // ensure base contains student id and name
        base["Ma Sinh Vien"] = id;
        base["Ho Ten"] =
          base["Ho Ten"] ?? base["Ten Sinh Vien"] ?? base["hoTen"] ?? "";
        byId.set(id, { base, trend: [] });
      }

      const entry = byId.get(id)!;
      entry.trend.push({ semester: semesterLabel, gpa });
    }

    // Convert map to array, sort trends by year+term (if parseable)
    const studentsArr: Array<Record<string, unknown>> = [];
    const parseSortKey = (label: string) => {
      // try to extract year start and term number
      const yearMatch = /([0-9]{4})/.exec(label);
      const year = yearMatch ? Number(yearMatch[1]) : 0;
      const termMatch = /(?:HK[_\s]?(\d+)|Học kỳ\s*(\d+)|T(\d+))/i.exec(label);
      const term = termMatch
        ? Number(termMatch[1] ?? termMatch[2] ?? termMatch[3])
        : 0;
      return year * 10 + term;
    };

    for (const [, v] of byId) {
      v.trend.sort(
        (a, b) => parseSortKey(a.semester) - parseSortKey(b.semester)
      );
      const merged: Record<string, unknown> = { ...v.base };
      merged["GpaTrend"] = v.trend;
      studentsArr.push(merged);
    }

    // sort students by name for stable order
    studentsArr.sort((a, b) => {
      const an = String(a["Ho Ten"] ?? a["HoTen"] ?? "").trim();
      const bn = String(b["Ho Ten"] ?? b["HoTen"] ?? "").trim();
      return an.localeCompare(bn, "vi", { sensitivity: "base" });
    });

    setStudents(studentsArr);
    setPage(1);
  }, [selectedClassName, studentsProp]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Danh sách sinh viên
          </h3>
        </div>

        {/* filter buttons omitted */}
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-700 text-start text-base dark:text-gray-300"
              >
                Mã sinh viên
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-700 text-start text-base dark:text-gray-300"
              >
                Tên sinh viên
              </TableCell>

              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-700 text-start text-base dark:text-gray-300"
              >
                Xu hướng GPA
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-6 text-center text-sm text-gray-500"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : errorMessage ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-6 text-center text-sm text-red-600"
                >
                  {String(errorMessage)}
                </TableCell>
              </TableRow>
            ) : students && students.length ? (
              (() => {
                // Sort students by name (A -> Z) so name stays paired with its student id
                const sorted = students.slice().sort((a, b) => {
                  const an = String(a["Ho Ten"] ?? a["HoTen"] ?? "").trim();
                  const bn = String(b["Ho Ten"] ?? b["HoTen"] ?? "").trim();
                  return an.localeCompare(bn, "vi", { sensitivity: "base" });
                });

                const total = sorted.length;
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                const currentPage = Math.min(Math.max(1, page), totalPages);
                const start = (currentPage - 1) * pageSize;
                const paginated = sorted.slice(start, start + pageSize);
                return (
                  <>
                    {paginated.map((s, idx) => (
                      <TableRow
                        key={
                          (s["Ma Sinh Vien"] as string) || `r-${start + idx}`
                        }
                        className=""
                      >
                        <TableCell className="py-3 w-80">
                          <div className="flex items-center gap-3">
                            <div>
                              <button
                                onClick={() => {
                                  const id = String(
                                    s["Ma Sinh Vien"] ??
                                      s["MaSV"] ??
                                      s["MSSV"] ??
                                      s["MaSinhVien"] ??
                                      ""
                                  ).trim();
                                  if (id)
                                    navigate(
                                      `/ecommerce-analytics?masv=${encodeURIComponent(
                                        id
                                      )}`
                                    );
                                }}
                                className="font-medium text-slate-800 hover:underline"
                                title="Xem chi tiết"
                              >
                                {(s["Ma Sinh Vien"] as string) || "-"}
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400/120 w-80">
                          {/* show class or other info if available */}
                          <button
                            onClick={() => {
                              const id = String(
                                s["Ma Sinh Vien"] ??
                                  s["MaSV"] ??
                                  s["MSSV"] ??
                                  s["MaSinhVien"] ??
                                  ""
                              ).trim();
                              if (id)
                                navigate(
                                  `/ecommerce-analytics?masv=${encodeURIComponent(
                                    id
                                  )}`
                                );
                            }}
                            className="font-semibold text-left text-slate-800 hover:underline"
                            title="Xem chi tiết"
                          >
                            {(s["Ho Ten"] as string) || "-"}
                          </button>
                        </TableCell>
                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {(() => {
                            // Use GpaTrend aggregated from API rows (created in the effect)
                            const rawTrend = s["GpaTrend"] ?? s["gpaTrend"];
                            const arr = Array.isArray(rawTrend)
                              ? (rawTrend as unknown[])
                              : [];
                            const trend = arr
                              .map((t: unknown, i: number) => {
                                const item =
                                  (t as Record<string, unknown>) || {};
                                const semester = String(
                                  item["semester"] ??
                                    item["label"] ??
                                    `HK${i + 1}`
                                );
                                const gpa = Number(
                                  item["gpa"] ??
                                    item["GPA"] ??
                                    item["value"] ??
                                    0
                                );
                                return { semester, gpa };
                              })
                              .filter((tt) => Number.isFinite(tt.gpa));

                            if (!trend.length) {
                              return (
                                <Badge size="sm" color="info">
                                  -
                                </Badge>
                              );
                            }

                            const SparkTooltip = (props: unknown) => {
                              // Narrow unknown props safely to avoid `any` usage
                              if (!props || typeof props !== "object")
                                return null;
                              const p = props as {
                                active?: unknown;
                                payload?: unknown[];
                                label?: unknown;
                              };
                              const active = Boolean(p.active);
                              const payload = Array.isArray(p.payload)
                                ? p.payload
                                : undefined;
                              if (!active || !payload || payload.length === 0)
                                return null;

                              const rawPoint = payload[0];
                              if (!rawPoint || typeof rawPoint !== "object")
                                return null;
                              const point = rawPoint as {
                                value?: unknown;
                                payload?: unknown;
                              };

                              // Extract semester name safely from payload object if present
                              let semesterLabel = "";
                              if (
                                point.payload &&
                                typeof point.payload === "object"
                              ) {
                                const pd = point.payload as Record<
                                  string,
                                  unknown
                                >;
                                semesterLabel = String(
                                  pd["semester"] ??
                                    pd["label"] ??
                                    pd["name"] ??
                                    ""
                                );
                              }

                              // Resolve numeric gpa value from available places
                              let rawVal = 0;
                              if (typeof point.value === "number")
                                rawVal = point.value;
                              else if (typeof point.value === "string")
                                rawVal = Number(point.value);
                              else if (
                                point.payload &&
                                typeof point.payload === "object"
                              ) {
                                const pd = point.payload as Record<
                                  string,
                                  unknown
                                >;
                                const cand =
                                  pd["gpa"] ?? pd["GPA"] ?? pd["value"];
                                if (typeof cand === "number") rawVal = cand;
                                else if (typeof cand === "string")
                                  rawVal = Number(cand);
                              }

                              const gpa = Number.isFinite(rawVal) ? rawVal : 0;

                              return (
                                <div className="bg-white border border-slate-200 text-slate-800 text-xs rounded shadow-lg px-3 py-2">
                                  <div className="font-medium">
                                    {semesterLabel || "(Kỳ?)"}
                                  </div>
                                  <div className="text-slate-500">
                                    GPA: {gpa.toFixed(2)}
                                  </div>
                                </div>
                              );
                            };

                            return (
                              <div className="w-40 h-12">
                                <ResponsiveContainer width="100%" height={48}>
                                  <LineChart data={trend}>
                                    <Line
                                      type="monotone"
                                      dataKey="gpa"
                                      stroke={COLORS[1]}
                                      strokeWidth={2}
                                      dot={{ r: 2 }}
                                    />
                                    <Tooltip content={SparkTooltip} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="py-3">
                        <div className="flex items-center justify-end gap-3">
                          <div className="text-sm text-slate-500">
                            Hiển thị {Math.min(start + 1, total)}-
                            {Math.min(start + pageSize, total)} của {total}
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage <= 1}
                              className={`px-3 py-1 rounded border ${
                                currentPage <= 1
                                  ? "border-gray-200 text-gray-400"
                                  : "border-gray-300 text-gray-700"
                              } bg-white`}
                            >
                              Prev
                            </button>
                            <div className="text-sm text-slate-600">
                              {currentPage} / {totalPages}
                            </div>
                            <button
                              onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                              }
                              disabled={currentPage >= totalPages}
                              className={`px-3 py-1 rounded border ${
                                currentPage >= totalPages
                                  ? "border-gray-200 text-gray-400"
                                  : "border-gray-300 text-gray-700"
                              } bg-white`}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </>
                );
              })()
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-6 text-center text-sm text-slate-500"
                >
                  Chọn lớp để xem danh sách sinh viên
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
