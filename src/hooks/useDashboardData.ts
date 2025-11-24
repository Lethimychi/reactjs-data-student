import { useQuery } from "@tanstack/react-query";
import * as api from "../utils/ClassLecturerApi";

export function useDashboardData(
  className?: string | null,
  semester?: string | null
) {
  return useQuery({
    queryKey: ["dashboard", className ?? "ALL", semester ?? "ALL"],
    queryFn: async () => {
      const [gradeDistribution, gpaConduct, classAvg, passRate] =
        await Promise.all([
          api.fetchGradeDistribution(
            className ?? undefined,
            semester ?? undefined,
            !!semester
          ),
          api.fetchGpaConductByClass(
            className ?? undefined,
            semester ?? undefined,
            !!semester
          ),
          api.fetchClassAverageGPA(
            className ?? undefined,
            semester ?? undefined
          ),
          api.fetchPassRateBySubject(
            className ?? undefined,
            semester ?? undefined
          ),
        ]);
      return { gradeDistribution, gpaConduct, classAvg, passRate };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!className && !!semester,
  });
}
