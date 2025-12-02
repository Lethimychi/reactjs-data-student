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