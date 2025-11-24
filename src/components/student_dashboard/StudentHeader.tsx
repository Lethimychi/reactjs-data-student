import React from "react";
import { User, GraduationCap, Sparkles } from "lucide-react";
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
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-slate-500">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-white rounded-2xl p-8 border border-blue-100/50 shadow-xl shadow-blue-100/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/30">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/20 rounded-full -mr-20 -mt-20 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/20 rounded-full -ml-16 -mb-16 blur-2xl" />

      <div className="relative flex items-center gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-lg opacity-75 animate-pulse" />
            <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent truncate">
              {studentName}
            </h1>
            <Sparkles
              className="w-5 h-5 text-blue-500 flex-shrink-0 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-700 mt-4">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20 hover:bg-white/60 transition-colors">
              <GraduationCap className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  MSSV
                </div>
                <div className="text-sm font-bold text-slate-800 truncate">
                  {studentInfo.id}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20 hover:bg-white/60 transition-colors">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Lớp
                </div>
                <div className="text-sm font-bold text-slate-800 truncate">
                  {studentInfo.class}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20 hover:bg-white/60 transition-colors">
              <div className="w-5 h-5 bg-indigo-600 rounded-full flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Khu vực
                </div>
                <div className="text-sm font-bold text-slate-800 truncate">
                  {studentInfo.area}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;
