export function getCourseTarget(student: any, course: any) {
  if (!student) return 80;
  const targetOverride = student.courseTargets?.find(
    (t: any) => t.courseId === course._id
  );
  return targetOverride ? targetOverride.target : student.target || 80;
}

export function calcCourseScore(studentId: string, course: any, student: any, scores: any[]) {
  let earned = 0;
  let lostWeight = 0;
  let remaining = 0;

  course.items.forEach((item: any) => {
    const scoreRecord = scores.find(
      (s) => s.studentId === studentId && s.itemId === item.id
    );
    const raw = scoreRecord ? scoreRecord.score : null;
    const w = item.weight;

    if (item.status === "missing") {
      lostWeight += w;
    } else if (raw !== null) {
      earned += (raw / item.maxScore) * w;
    } else {
      remaining += w;
    }
  });

  const target = student ? getCourseTarget(student, course) : 80;
  return {
    total: earned,
    lost: lostWeight,
    remaining,
    need: Math.max(0, target - earned),
  };
}

export function calcStudentAvg(student: any, courses: any[], scores: any[]) {
  const studentCourses = courses.filter((c) =>
    student.courseIds?.includes(c._id)
  );
  if (!studentCourses.length) return 0;

  const totals = studentCourses.map(
    (c) => calcCourseScore(student._id, c, student, scores).total
  );
  return totals.reduce((a, b) => a + b, 0) / totals.length;
}

export function parseDDL(ddlStr: string) {
  if (!ddlStr) return null;
  const m = ddlStr.match(/(\d+)月(\d+)日/);
  if (!m) return null;
  const now = new Date();
  return new Date(now.getFullYear(), parseInt(m[1]) - 1, parseInt(m[2]));
}

export function daysUntil(ddlStr: string) {
  const d = parseDDL(ddlStr);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

export function daysLabel(ddlStr: string, status: string) {
  if (status === "final") return { text: "期末", color: "var(--purple)" };
  const days = daysUntil(ddlStr);
  if (days === null) return { text: "", color: "var(--text3)" };
  if (days < 0) return { text: `逾${-days}天`, color: "var(--red)" };
  if (days === 0) return { text: "今天", color: "var(--red)" };
  if (days === 1) return { text: "明天", color: "var(--red)" };
  if (days <= 3) return { text: `${days}天后`, color: "var(--amber)" };
  if (days <= 7) return { text: `${days}天`, color: "var(--amber)" };
  return { text: `${days}天`, color: "var(--text3)" };
}

export function urgencyScore(item: any) {
  if (item.status === "final") return 9999;
  const days = daysUntil(item.ddl);
  if (days === null) return 8888;
  return days;
}
