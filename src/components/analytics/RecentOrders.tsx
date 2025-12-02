import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
// navigation removed for subject-centric table
import { useQuery } from "@tanstack/react-query";
import { fetchStudentsByClass } from "../../utils/ClassLecturerApi";
import { fetchStudentCourseScores } from "../../utils/StudentsLectures";

// Mock data for preview when no class is selected or API unavailable

export default function RecentOrders({
  selectedClassName,
  selectedSemesterDisplayName,
  masv,
}: {
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
  masv?: string | null;
}) {
  const [students, setStudents] = useState<Array<
    Record<string, unknown>
  > | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5; // show 5 students per page

  const studentsQuery = useQuery({
    queryKey: [
      "studentsByClassOrScores",
      selectedClassName,
      selectedSemesterDisplayName,
      masv,
    ],
    queryFn: async () => {
      if (masv) {
        return fetchStudentCourseScores(
          masv,
          selectedSemesterDisplayName ?? undefined
        );
      }
      if (selectedClassName) {
        return fetchStudentsByClass(
          selectedClassName,
          selectedSemesterDisplayName ?? undefined
        );
      }
      return [];
    },
    enabled: !!selectedClassName || !!masv,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // no navigation needed for subject table

  useEffect(() => {
    if (!selectedClassName && !masv) {
      setStudents(null);
      return;
    }
    if (studentsQuery.isLoading) return;
    if (studentsQuery.isError) {
      console.error(studentsQuery.error);
      setStudents(null);
      return;
    }
    // Group rows by student id to build per-student GPA trend across semesters
    const byId = new Map<
      string,
      {
        base: Record<string, unknown>;
        trend: { semester: string; gpa: number }[];
      }
    >();

    // Populate the map from the query data (this was missing previously)
    const rows = Array.isArray(studentsQuery.data) ? studentsQuery.data : [];

    // Filter by semester if masv is present (course scores mode)
    const filteredRows =
      masv && selectedSemesterDisplayName
        ? rows.filter((r) => {
            const term = r["Ten Hoc Ky"] ?? r["TenHocKy"] ?? "";
            const year = r["Ten Nam Hoc"] ?? r["TenNamHoc"] ?? "";
            const semesterStr = `${term} - ${year}`;
            return semesterStr.trim() === selectedSemesterDisplayName.trim();
          })
        : rows;
    for (const r of filteredRows) {
      const id = String(
        r["Ma Sinh Vien"] ??
          r["masv"] ??
          r["MaSV"] ??
          r["Ma SinhVien"] ??
          Math.random()
      );
      const existing = byId.get(id);
      const base = existing ? existing.base : r;

      // try to extract a semester label and GPA value for trend chart
      const semLabel = String(
        r["HocKyNamHoc"] ??
          r["HocKy"] ??
          r["Ten Hoc Ky"] ??
          r["TenHocKy"] ??
          r["semester"] ??
          ""
      );
      const gpaRaw =
        r["GPA"] ?? r["GPA_HocKy"] ?? r["DiemTB"] ?? r["gpa"] ?? null;
      let gpaVal: number | null = null;
      if (typeof gpaRaw === "number") gpaVal = gpaRaw;
      else if (typeof gpaRaw === "string") {
        const parsed = Number(String(gpaRaw).replace(/[^0-9.-]/g, ""));
        gpaVal = Number.isFinite(parsed) ? parsed : null;
      }

      const trend = existing ? existing.trend : [];
      if (gpaVal !== null && !Number.isNaN(gpaVal)) {
        trend.push({ semester: semLabel || "", gpa: gpaVal });
      }

      byId.set(id, { base, trend });
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
  }, [
    selectedClassName,
    selectedSemesterDisplayName,
    masv,
    studentsQuery.isLoading,
    studentsQuery.isError,
    studentsQuery.data,
    studentsQuery.error,
  ]);

  // compute displayStudents: use real students if available, otherwise show mock when no class/student selected
  const displayStudents: Array<Record<string, unknown>> | null =
    students ?? (selectedClassName || masv ? null : null);

  // pagination helpers (computed during render when displayStudents exists)
  const total =
    displayStudents && displayStudents.length ? displayStudents.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated =
    displayStudents && displayStudents.length
      ? displayStudents
          .slice()

          .slice(start, start + pageSize)
      : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {masv ? "Chi tiết điểm môn học" : "Danh sách sinh viên"}
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
                Tên môn học
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-700 text-start text-base dark:text-gray-300"
              >
                Số tín chỉ
              </TableCell>

              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-700 text-start text-base dark:text-gray-300"
              >
                Điểm giữa kỳ
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-700 text-start text-base dark:text-gray-300"
              >
                Điểm cuối kỳ
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-700 text-start text-base dark:text-gray-300"
              >
                Điểm trung bình
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-700 text-start text-base dark:text-gray-300"
              >
                Điểm hệ 4
              </TableCell>

              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-700 text-start text-base dark:text-gray-300"
              >
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {studentsQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-sm text-gray-500"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : studentsQuery.isError ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-sm text-red-600"
                >
                  {String(
                    studentsQuery.error ?? "Không thể tải danh sách sinh viên"
                  )}
                </TableCell>
              </TableRow>
            ) : displayStudents && displayStudents.length ? (
              <>
                {paginated.map((s, idx) => (
                  <TableRow key={`r-${start + idx}`} className="">
                    {/* Tên môn học */}
                    <TableCell className="py-3 text-gray-700 font-medium">
                      {(() => {
                        const subjKeys = [
                          "MonHoc",
                          "Ten Mon Hoc",
                          "TenMonHoc",
                          "Ten MonHoc",
                        ];
                        for (const k of subjKeys) {
                          const v = s[k];
                          if (
                            v !== undefined &&
                            v !== null &&
                            String(v).trim() !== ""
                          )
                            return String(v);
                        }
                        return (
                          <Badge size="sm" color="info">
                            -
                          </Badge>
                        );
                      })()}
                    </TableCell>

                    {/* Số tín chỉ */}
                    <TableCell className="py-3 text-gray-500">
                      {(() => {
                        const creditKeys = [
                          "SoTinChi",
                          "So Tin Chi",
                          "So Tín Chỉ",
                          "SoTC",
                          "TinChi",
                        ];
                        for (const k of creditKeys) {
                          const v = s[k];
                          if (
                            v !== undefined &&
                            v !== null &&
                            String(v).trim() !== ""
                          )
                            return String(v);
                        }
                        return (
                          <Badge size="sm" color="info">
                            -
                          </Badge>
                        );
                      })()}
                    </TableCell>

                    {/* Điểm giữa kỳ */}
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {(() => {
                        const midKeys = [
                          "Diem Giua Ky",
                          "DiemGiuaKy",
                          "DiemGiua",
                          "Diem Giua",
                        ];
                        for (const k of midKeys) {
                          const v = s[k];
                          if (
                            v !== undefined &&
                            v !== null &&
                            String(v).trim() !== ""
                          )
                            return typeof v === "number"
                              ? v.toFixed(2)
                              : String(v);
                        }
                        return (
                          <Badge size="sm" color="info">
                            -
                          </Badge>
                        );
                      })()}
                    </TableCell>

                    {/* Điểm cuối kỳ */}
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {(() => {
                        const finalKeys = [
                          "Diem Cuoi Ky",
                          "DiemCuoiKy",
                          "DiemCuoi",
                          "Diem Cuoi",
                        ];
                        for (const k of finalKeys) {
                          const v = s[k];
                          if (
                            v !== undefined &&
                            v !== null &&
                            String(v).trim() !== ""
                          )
                            return typeof v === "number"
                              ? v.toFixed(2)
                              : String(v);
                        }
                        return (
                          <Badge size="sm" color="info">
                            -
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    {/* Điểm trung bình */}
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {(() => {
                        // Prefer server-provided average when available
                        const dtb =
                          s["Diem Trung Binh"] ??
                          s["DiemTB"] ??
                          s["Diem"] ??
                          s["DiemTrungBinh"];
                        const dtbNum =
                          typeof dtb === "number"
                            ? dtb
                            : Number(
                                String(dtb ?? "").replace(/[^0-9.-]/g, "")
                              );
                        if (Number.isFinite(dtbNum)) return dtbNum.toFixed(2);

                        // fallback: compute from mid & final
                        const midKeys = [
                          "Diem Giua Ky",
                          "DiemGiuaKy",
                          "DiemGiua",
                          "Diem Giua",
                        ];
                        const finalKeys = [
                          "Diem Cuoi Ky",
                          "DiemCuoiKy",
                          "DiemCuoi",
                          "Diem Cuoi",
                        ];

                        const getNumber = (keys: string[]) => {
                          for (const k of keys) {
                            const v = s[k];
                            if (
                              v !== undefined &&
                              v !== null &&
                              String(v).trim() !== ""
                            ) {
                              if (typeof v === "number") return v;
                              const parsed = Number(
                                String(v).replace(/[^0-9.-]/g, "")
                              );
                              if (Number.isFinite(parsed)) return parsed;
                            }
                          }
                          return null as number | null;
                        };

                        const mid = getNumber(midKeys);
                        const final = getNumber(finalKeys);
                        if (mid !== null && final !== null) {
                          return ((mid + final) / 2).toFixed(2);
                        }
                        if (mid !== null) return mid.toFixed(2);
                        if (final !== null) return final.toFixed(2);

                        return (
                          <Badge size="sm" color="info">
                            -
                          </Badge>
                        );
                      })()}
                    </TableCell>

                    {/* Điểm hệ 4 */}
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {(() => {
                        const he4Keys = [
                          "Diem He4",
                          "DiemHe4",
                          "He4",
                          "Diem_H4",
                          "DiemHe_4",
                        ];
                        for (const k of he4Keys) {
                          const v = s[k];
                          if (
                            v !== undefined &&
                            v !== null &&
                            String(v).trim() !== ""
                          )
                            return typeof v === "number"
                              ? (v as number).toFixed(2)
                              : String(v);
                        }

                        // fallback: compute from Diem Trung Binh if available
                        const dtb =
                          s["Diem Trung Binh"] ??
                          s["DiemTB"] ??
                          s["Diem"] ??
                          s["DiemTrungBinh"];
                        const num =
                          typeof dtb === "number"
                            ? dtb
                            : Number(
                                String(dtb ?? "").replace(/[^0-9.-]/g, "")
                              );
                        if (Number.isFinite(num)) {
                          const he4 = Math.max(0, Math.min(4, (num / 10) * 4));
                          return he4.toFixed(2);
                        }

                        return (
                          <Badge size="sm" color="info">
                            -
                          </Badge>
                        );
                      })()}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {(() => {
                        const statusKeys = [
                          "TrangThai",
                          "Trang Thai",
                          "Trang_thai",
                          "status",
                          "TinhTrang",
                        ];
                        for (const k of statusKeys) {
                          const v = s[k];
                          if (
                            v !== undefined &&
                            v !== null &&
                            String(v).trim() !== ""
                          )
                            return (
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  String(v).toLowerCase().includes("đậu") ||
                                  String(v).toLowerCase().includes("dau")
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {String(v)}
                              </span>
                            );
                        }

                        // fallback: compute from Diem Trung Binh (if available)
                        const dtb =
                          s["Diem Trung Binh"] ?? s["DiemTB"] ?? s["Diem"];
                        const num =
                          typeof dtb === "number"
                            ? dtb
                            : Number(
                                String(dtb ?? "").replace(/[^0-9.-]/g, "")
                              );
                        if (Number.isFinite(num)) {
                          const pass = num >= 5;
                          return (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                pass
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {pass ? "Đậu" : "Rớt"}
                            </span>
                          );
                        }

                        return (
                          <Badge size="sm" color="info">
                            -
                          </Badge>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell colSpan={7} className="py-3">
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
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-sm text-slate-500"
                >
                  {selectedClassName || masv
                    ? "Không có dữ liệu"
                    : "Chọn lớp hoặc sinh viên để xem danh sách"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
