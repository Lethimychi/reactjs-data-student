import getLowestScoreSubjectsInSemester, {
  getHighestScoreSubject,
} from "./score_api";

export async function loadHighestLowestData(): Promise<
  {
    semester: string;
    highestScore: number;
    highestSubject: string;
    lowestScore: number;
    lowestSubject: string;
  }[]
> {
  const highest = await getHighestScoreSubject();
  const lowest = await getLowestScoreSubjectsInSemester();

  if (!highest || !lowest) return [];

  type HL = {
    semesterPart: string; // e.g. HK1
    schoolYear: string; // e.g. 2024-2025
    label: string; // formatted label e.g. 'HK1 24-25'
    subject: string;
    score: number;
  };

  // Normalize both lists into a consistent shape
  const makeLabel = (semesterPart: string, schoolYear: string) => {
    const sp = String(semesterPart ?? "").trim();
    const sy = String(schoolYear ?? "").trim();
    if (!sp && !sy) return "";
    if (!sy) return sp;
    const parts = sy.split("-");
    const start = parts[0] ?? "";
    const end = parts[1] ?? "";
    const yearShort =
      start.slice(-2) + (end ? `-${String(Number(end) - 2000)}` : "");
    return `${sp} ${yearShort}`.trim();
  };

  const pick = (obj: Record<string, unknown>, candidates: string[]) => {
    for (const k of candidates) {
      if (k in obj && obj[k] != null) return String(obj[k]);
    }
    return "";
  };

  const convert = (x: Record<string, unknown>): HL => {
    const semesterPart = pick(x, [
      "Ten Hoc Ky",
      "TenHocKy",
      "HocKy",
      "Ten_Hoc_Ky",
    ]);
    const schoolYear = pick(x, [
      "Ten Nam Hoc",
      "TenNamHoc",
      "NamHoc",
      "Ten_Nam_Hoc",
    ]);
    return {
      semesterPart,
      schoolYear,
      label: makeLabel(semesterPart, schoolYear),
      subject: String(x["Ten Mon Hoc"] ?? x["TenMonHoc"] ?? x["Ten"] ?? ""),
      score:
        typeof x["DTB"] === "number"
          ? (x["DTB"] as number)
          : Number(String(x["DTB"] ?? "").replace(/[^0-9.-]/g, "")) || 0,
    };
  };

  const highestArr: Record<string, unknown>[] = Array.isArray(highest)
    ? (highest as unknown[]).map((x) =>
        typeof x === "object" && x ? (x as Record<string, unknown>) : {}
      )
    : [];
  const lowestArr: Record<string, unknown>[] = Array.isArray(lowest)
    ? (lowest as unknown[]).map((x) =>
        typeof x === "object" && x ? (x as Record<string, unknown>) : {}
      )
    : [];

  const highestNorm: HL[] = highestArr.map(convert);
  const lowestNorm: HL[] = lowestArr.map(convert);

  // Merge highest + lowest by semesterPart + schoolYear (use both to avoid collisions)
  const merged = highestNorm.map((h) => {
    const l = lowestNorm.find(
      (x) => x.semesterPart === h.semesterPart && x.schoolYear === h.schoolYear
    );

    return {
      semester: h.label || h.semesterPart,
      highestScore: h.score,
      highestSubject: h.subject,
      lowestScore: l?.score ?? 0,
      lowestSubject: l?.subject ?? "",
    };
  });

  return merged;
}
