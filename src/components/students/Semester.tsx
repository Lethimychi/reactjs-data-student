import { BookOpen } from "lucide-react";

interface SemesterProps {
  semesters: Array<{ id: number; name: string; year: string }>;
  selectedSemester: number;
  onSemesterChange: (semesterId: number) => void;
  coursesPerSemester: Record<number, string[]>;
  coursesLoading: boolean;
  coursesError: string | null;
}

const Semester: React.FC<SemesterProps> = ({
  semesters,
  selectedSemester,
  onSemesterChange,
  coursesPerSemester,
  coursesLoading,
  coursesError,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Thông tin học kỳ
        </h2>
        <span className="text-sm text-slate-600 bg-blue-100 px-4 py-2 rounded-full font-semibold">
          Tổng: {semesters.length} học kỳ
        </span>
      </div>

      {(coursesLoading || coursesError) && (
        <div className="mb-2 text-sm text-slate-500">
          {coursesLoading
            ? "Đang tải danh sách học kỳ..."
            : coursesError
            ? `Lỗi tải học kỳ: ${coursesError}`
            : ""}
        </div>
      )}

      <select
        className="w-full p-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={selectedSemester}
        onChange={(e) => onSemesterChange(Number(e.target.value))}
      >
        {semesters.map((sem: { id: number; name: string; year: string }) => (
          <option key={sem.id} value={sem.id}>
            {sem.name}
          </option>
        ))}
      </select>

      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h3 className="font-semibold text-slate-700 mb-3">Môn học trong kỳ:</h3>
        <div className="flex flex-wrap gap-2">
          {coursesPerSemester[selectedSemester]
            ?.filter((c) => c && c !== "-")
            .map((course: string, idx: number) => (
              <span
                key={idx}
                className="bg-white px-4 py-2 rounded-lg text-sm text-slate-700 shadow-sm border border-slate-200"
              >
                {course}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Semester;
