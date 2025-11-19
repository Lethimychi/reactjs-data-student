import getLowestScoreSubjectsInSemester, {
  getHighestScoreSubject,
} from "./score_api";

export async function loadHighestLowestData() {
  const highest = await getHighestScoreSubject();
  const lowest = await getLowestScoreSubjectsInSemester();

  if (!highest || !lowest) return [];

  // Normalize both lists into English-friendly format
  const convert = (x: any) => ({
    semester: x["Ten Hoc Ky"],
    schoolYear: x["Ten Nam Hoc"],
    subject: x["Ten Mon Hoc"],
    score: x["DTB"],
  });

  const highestNorm = highest.map(convert);
  const lowestNorm = lowest.map(convert);

  // Merge highest + lowest by semester
  const merged = highestNorm.map((h: any) => {
    const l = lowestNorm.find((x: any) => x.semester === h.semester);

    return {
      semester: h.semester,

      highestScore: h.score,
      highestSubject: h.subject,

      lowestScore: l?.score,
      lowestSubject: l?.subject,
    };
  });

  return merged;
}
