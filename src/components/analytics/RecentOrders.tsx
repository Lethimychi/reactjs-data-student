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

// Mock data for preview when no class is selected or API unavailable
const MOCK_STUDENTS: Array<Record<string, unknown>> = [
  {
    "Ma Sinh Vien": "018649458",
    "Ho Ten": "An San Tiến",
    MonHoc: "Toán",
    "Diem Chuyen Can": 8.0,
    SoTinChi: 3,
    "Diem Giua Ky": 7.0,
    "Diem Cuoi Ky": 8.4,
    "Diem Trung Binh": 7.5,
    TrangThai: "Đậu",
    GpaTrend: [
      { semester: "HK1 - 2023", gpa: 7.2 },
      { semester: "HK2 - 2023", gpa: 7.5 },
      { semester: "HK1 - 2024", gpa: 7.8 },
    ],
  },
  {
    "Ma Sinh Vien": "018649459",
    "Ho Ten": "Nguyễn Văn A",
    MonHoc: "Lập trình",
    "Diem Chuyen Can": 6.0,
    SoTinChi: 3,
    "Diem Giua Ky": 6.2,
    "Diem Cuoi Ky": 6.8,
    "Diem Trung Binh": 6.33,
    TrangThai: "Đậu",
    GpaTrend: [
      { semester: "HK1 - 2023", gpa: 6.5 },
      { semester: "HK2 - 2023", gpa: 6.8 },
      { semester: "HK1 - 2024", gpa: 7.0 },
    ],
  },
  {
    "Ma Sinh Vien": "018649460",
    "Ho Ten": "Trần Thị B",
    MonHoc: "Vật lý",
    "Diem Chuyen Can": 9.0,
    SoTinChi: 4,
    "Diem Giua Ky": 8.1,
    "Diem Cuoi Ky": 8.4,
    "Diem Trung Binh": 8.5,
    TrangThai: "Đậu",
    GpaTrend: [
      { semester: "HK1 - 2023", gpa: 8.0 },
      { semester: "HK2 - 2023", gpa: 8.1 },
      { semester: "HK1 - 2024", gpa: 8.3 },
    ],
  },
  {
    "Ma Sinh Vien": "018649461",
    "Ho Ten": "Lê Văn C",
    MonHoc: "Hóa học",
    "Diem Chuyen Can": 5.0,
    SoTinChi: 4,
    "Diem Giua Ky": 5.6,
    "Diem Cuoi Ky": 5.9,
    "Diem Trung Binh": 5.5,
    TrangThai: "Rớt",
    GpaTrend: [
      { semester: "HK1 - 2023", gpa: 5.2 },
      { semester: "HK2 - 2023", gpa: 5.6 },
      { semester: "HK1 - 2024", gpa: 5.9 },
    ],
  },
  {
    "Ma Sinh Vien": "018649462",
    "Ho Ten": "Phạm Thị D",
    MonHoc: "Cơ sở dữ liệu",
    "Diem Chuyen Can": 9.5,
    SoTinChi: 3,
    "Diem Giua Ky": 9.0,
    "Diem Cuoi Ky": 9.4,
    "Diem Trung Binh": 9.3,
    TrangThai: "Đậu",
    GpaTrend: [
      { semester: "HK1 - 2023", gpa: 9.0 },
      { semester: "HK2 - 2023", gpa: 9.1 },
      { semester: "HK1 - 2024", gpa: 9.2 },
    ],
  },
];

export default function RecentOrders({
  selectedClassName,
  selectedSemesterDisplayName,
}: {
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
}) {
  const [students, setStudents] = useState<Array<
    Record<string, unknown>
  > | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5; // show 5 students per page

  const studentsQuery = useQuery({
    queryKey: [
      "studentsByClass",
      selectedClassName,
      selectedSemesterDisplayName,
    ],
    queryFn: async () =>
      fetchStudentsByClass(
        selectedClassName!,
        selectedSemesterDisplayName ?? undefined
      ),
    enabled: !!selectedClassName,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // no navigation needed for subject table

  useEffect(() => {
    if (!selectedClassName) {
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
    for (const r of rows) {
      const id = String(
        r["Ma Sinh Vien"] ?? r["masv"] ?? r["MaSV"] ?? r["Ma SinhVien"] ?? Math.random()
      );
      const existing = byId.get(id);
      const base = existing ? existing.base : r;

      // try to extract a semester label and GPA value for trend chart
      const semLabel = String(
        r["HocKyNamHoc"] ?? r["HocKy"] ?? r["Ten Hoc Ky"] ?? r["TenHocKy"] ?? r["semester"] ?? ""
      );
      const gpaRaw = r["GPA"] ?? r["GPA_HocKy"] ?? r["DiemTB"] ?? r["gpa"] ?? null;
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
    studentsQuery.isLoading,
    studentsQuery.isError,
    studentsQuery.data,
    studentsQuery.error,
  ]);

  // compute displayStudents: use real students if available, otherwise show mock when no class selected
  const displayStudents =
    students ?? (selectedClassName ? null : MOCK_STUDENTS);

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
          .sort((a, b) => {
            const an = String(a["Ho Ten"] ?? a["HoTen"] ?? "").trim();
            const bn = String(b["Ho Ten"] ?? b["HoTen"] ?? "").trim();
            return an.localeCompare(bn, "vi", { sensitivity: "base" });
          })
          .slice(start, start + pageSize)
      : [];

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
                Điểm chuyên cần
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
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {studentsQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-sm text-gray-500"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : studentsQuery.isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
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

                    {/* Điểm chuyên cần */}
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {(() => {
                        const keys = [
                          "Diem Chuyen Can",
                          "DiemChuyenCan",
                          "Diem_CC",
                          "ChuyenCan",
                        ];
                        for (const k of keys) {
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
                  <TableCell colSpan={6} className="py-3">
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
                  colSpan={6}
                  className="py-6 text-center text-sm text-slate-500"
                >
                  {selectedClassName
                    ? "Không có dữ liệu"
                    : "Chọn lớp để xem danh sách sinh viên"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
