// Centralized mock data for Student components (testing only)
export const studentsData = [
  {
    id: 1,
    info: {
      id: "SV0001",
      name: "Nguyễn Văn A",
      class: "CNTT K65",
      area: "Hà Nội",
    },
    overallGPA: 3.45,
    gpaData: [
      { semester: "HK1", year: "2023-2024", gpa: 3.3, rank: "Khá" },
      { semester: "HK2", year: "2023-2024", gpa: 3.6, rank: "Giỏi" },
    ],
    passRateData: [
      { semester: "HK1 23-24", passed: 4, failed: 1, total: 5 },
      { semester: "HK2 23-24", passed: 5, failed: 0, total: 5 },
    ],
    detailedScores: {
      1: [
        { course: "Toán cao cấp", score: 7.5, credits: 4, status: "Đậu" },
        { course: "Lập trình C", score: 8.0, credits: 4, status: "Đậu" },
      ],
      2: [
        { course: "CSDL", score: 8.2, credits: 4, status: "Đậu" },
        { course: "Web", score: 8.5, credits: 3, status: "Đậu" },
      ],
    },
    trainingScoreData: [
      { semester: "HK1 23-24", score: 88 },
      { semester: "HK2 23-24", score: 90 },
    ],
  },
  {
    id: 2,
    info: {
      id: "SV0002",
      name: "Trần Thị B",
      class: "CNTT K65",
      area: "TP.HCM",
    },
    overallGPA: 3.78,
    gpaData: [
      { semester: "HK1", year: "2023-2024", gpa: 3.7, rank: "Giỏi" },
      { semester: "HK2", year: "2023-2024", gpa: 3.85, rank: "Xuất sắc" },
    ],
    passRateData: [
      { semester: "HK1 23-24", passed: 5, failed: 0, total: 5 },
      { semester: "HK2 23-24", passed: 5, failed: 0, total: 5 },
    ],
    detailedScores: {
      1: [
        { course: "Toán cao cấp", score: 8.2, credits: 4, status: "Đậu" },
        { course: "Lập trình C", score: 8.5, credits: 4, status: "Đậu" },
      ],
      2: [
        { course: "CSDL", score: 9.0, credits: 4, status: "Đậu" },
        { course: "Web", score: 9.2, credits: 3, status: "Đậu" },
      ],
    },
    trainingScoreData: [
      { semester: "HK1 23-24", score: 92 },
      { semester: "HK2 23-24", score: 95 },
    ],
  },
];

export const semesters = [
  { id: 1, name: "HK1 2023-2024", year: "2023-2024" },
  { id: 2, name: "HK2 2023-2024", year: "2023-2024" },
];

export const coursesPerSemester = {
  1: ["Toán cao cấp", "Lập trình C", "Anh văn 1"],
  2: ["CSDL", "Web"],
};

export const comparisonData = [
  { course: "Toán cao cấp", average: 7.8 },
  { course: "Lập trình C", average: 8.2 },
  { course: "Anh văn 1", average: 6.5 },
];
