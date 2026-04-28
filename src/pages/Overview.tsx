import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import { calcCourseScore, getCourseTarget } from "../utils/calc";

export default function Overview({ studentId, onNavigateCourse }: { studentId: string | null; onNavigateCourse: (cid: string) => void }) {
  const students = useQuery(api.students?.getAll || "students:getAll") || [];
  const courses = useQuery(api.courses?.getAll || "courses:getAll") || [];
  const scores = useQuery(api.scores?.getByStudent || "scores:getByStudent", studentId ? { studentId: studentId as any } : "skip") || [];

  const student = students.find((s: any) => s._id === studentId);

  if (!student) {
    return (
      <div className="page active">
        <div className="page-header">
          <div className="page-title">请先在侧边栏选择或添加学生</div>
        </div>
      </div>
    );
  }

  const studentCourses = courses.filter((c: any) => student.courseIds?.includes(c._id));
  const target = student.target || 80;

  const courseScores = studentCourses.map((c: any) => ({
    c,
    sc: calcCourseScore(student._id, c, student, scores),
  }));

  const atRisk = courseScores.filter((x: any) => x.sc.total < 40).length;
  const onTrack = courseScores.filter((x: any) => x.sc.total >= getCourseTarget(student, x.c)).length;

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">{student.name} · 总览</div>
        <div className="page-sub">默认目标：{target}%</div>
      </div>
      
      <div className="stat-row">
        <div className="stat-box"><div className="lbl">修读课程</div><div className="val">{studentCourses.length}</div><div className="sub">本学期</div></div>
        <div className="stat-box"><div className="lbl">默认目标</div><div className="val" style={{ color: "var(--green)" }}>{target}%</div><div className="sub">可各科单设</div></div>
        <div className="stat-box"><div className="lbl">高风险</div><div className="val" style={{ color: "var(--red)" }}>{atRisk}</div><div className="sub">得分 &lt;40%</div></div>
        <div className="stat-box"><div className="lbl">已达标</div><div className="val" style={{ color: "var(--green)" }}>{onTrack}</div><div className="sub">达到各科目标</div></div>
      </div>

      <div className="course-grid">
        {courseScores.map(({ c, sc }: any) => {
          const t = sc.total;
          const tgt = getCourseTarget(student, c);
          const barColor = t >= tgt ? '#1D9E75' : t >= 50 ? '#BA7517' : '#A32D2D';
          const bClass = t >= tgt ? 'bg' : t >= 50 ? 'ba' : 'br';
          const bText = t >= tgt ? '已达标' : t >= 50 ? '进行中' : '高风险';

          return (
            <div className="ccard" key={c._id}>
              <div className="ch">
                <span className="cn">{c.name}</span>
                <span className={`badge ${bClass}`}>{bText}</span>
              </div>
              <div className="pbar-bg">
                <div className="pbar" style={{ width: `${Math.min(100, t)}%`, background: barColor }}></div>
              </div>
              <div className="plbl">
                <span>已得 {t.toFixed(1)}%</span>
                <span>目标 {tgt}%</span>
              </div>
              <div className="cnote">还需 {sc.need.toFixed(1)}% · 已丢失 {sc.lost.toFixed(1)}%</div>
              <button className="btn btn-sm" style={{ marginTop: "9px", fontSize: "11px" }} onClick={() => onNavigateCourse(c._id)}>
                查看详情 →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
