import React from "react";
import { User, GraduationCap } from "lucide-react";
import { StudentInfo } from "../../utils/studentNormalizers";

interface StudentHeaderProps {
  studentName: string;
  studentInfo: StudentInfo;
  isLoading: boolean;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  studentName,
  studentInfo,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-lg">
          <User className="w-12 h-12 text-white" />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {studentName}
          </h1>

          <div className="flex gap-6 text-slate-600">
            <span className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <strong>MSSV:</strong> {studentInfo.id}
            </span>

            <span>
              <strong>Lớp:</strong> {studentInfo.class}
            </span>

            <span>
              <strong>Khu vực:</strong> {studentInfo.area}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;
