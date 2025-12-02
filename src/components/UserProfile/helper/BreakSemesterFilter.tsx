export interface SubjectGradeRatioGV {
  semester: string;
  year: string;
}

export default function FilterHelper(semester: string): SubjectGradeRatioGV {
  const [hocKy, namStart, namEnd] = semester.split(" - ");
  return {
    year: namStart + " - " + namEnd,
    semester: hocKy,
  };
}

export function separateSemester(value: number): SubjectGradeRatioGV {
  switch (value) {
    case 1:
      return {
        semester: "HK2",
        year: "2022 - 2023",
      };

    case 2:
      return {
        semester: "HK1",
        year: "2023 - 2024",
      };

    case 3:
      return {
        semester: "HK2",
        year: "2023 - 2024",
      };
    case 4:
      return {
        semester: "HK1",
        year: "2024 - 2025",
      };

    default:
      return {
        semester: "",
        year: "",
      };
  }
}
