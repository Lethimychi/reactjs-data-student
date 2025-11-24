import React from "react";
import { User, GraduationCap, Sparkles, MapPin } from "lucide-react";
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
      <div className="p-6 text-center">
        <div className="inline-flex items-center gap-2 text-slate-500">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 border border-[#E6EEF8] shadow-md">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1970FB] to-[#3B82F6] rounded-lg flex items-center justify-center shadow-sm">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 truncate">
                {studentName}
              </h1>
              <Sparkles className="w-5 h-5 text-[#3B82F6]" />
            </div>

            <div className="flex items-center gap-6 mt-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-500" />
                <span className="font-medium">MSSV:</span>
                <span className="font-semibold text-slate-800 ml-1">
                  {studentInfo.id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#3B82F6] rounded-sm" />
                <span className="font-medium">Lớp:</span>
                <span className="font-semibold text-slate-800 ml-1">
                  {studentInfo.class}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="font-medium">Khu vực:</span>
                <span className="font-semibold text-slate-800 ml-1">
                  {studentInfo.area}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;
