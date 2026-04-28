import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import { calcCourseScore, getCourseTarget } from "../utils/calc";

export default function CourseDetail({ studentId, courseId }: { studentId: string | null; courseId: string | null }) {
  const students = useQuery(api.students?.getAll || "students:getAll") || [];
  const courses = useQuery(api.courses?.getAll || "courses:getAll") || [];
  const scores = useQuery(api.scores?.getByStudent || "scores:getByStudent", studentId ? { studentId } : "skip") || [];

  const student = students.find((s: any) => s._id === studentId);
  const course = courses.find((c: any) => c._id === courseId);

  if (!student || !course) {
    return (
      <div className="page active">
        <div className="page-header">
          <div className="page-title">数据加载中或未选择课程</div>
        </div>
      </div>
    );
  }

  const tgt = getCourseTarget(student, course);
  const sc = calcCourseScore(student._id, course, student, scores);

  const sBg: any = { locked: 'var(--green-bg)', missing: 'var(--red-bg)', pending: 'var(--amber-bg)', upcoming: 'var(--surface2)', final: 'var(--purple-bg)' };
  const sDot: any = { locked: 'var(--green)', missing: 'var(--red)', pending: 'var(--amber)', upcoming: 'var(--text3)', final: 'var(--purple)' };
  const sLbl: any = { locked: '已完成', missing: '已缺交', pending: '待录入', upcoming: '即将', final: '期末' };

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">{student.name} · {course.name}</div>
        <div className="page-sub">目标 {tgt}%</div>
      </div>
      
      <div className="summary-bar">
        <div className="s-item"><div className="s-lbl">当前得分</div><div className="s-val">{sc.total.toFixed(1)}%</div></div>
        <div className="s-item"><div className="s-lbl">已丢失</div><div className="s-val" style={{ color: "var(--red)" }}>{sc.lost.toFixed(1)}%</div></div>
        <div className="s-item"><div className="s-lbl">剩余可得</div><div className="s-val">{sc.remaining.toFixed(1)}%</div></div>
        <div className="s-item"><div className="s-lbl">距目标还需</div><div className="s-val" style={{ color: sc.need > 0 ? "var(--amber)" : "var(--green)" }}>{sc.need.toFixed(1)}%</div></div>
      </div>

      <div>
        {course.items.map((it: any) => {
          const scoreRecord = scores.find((s: any) => s.itemId === it.id);
          const raw = scoreRecord ? scoreRecord.score : null;
          const contrib = it.status === 'missing' ? 0 : (raw !== null ? (raw / it.maxScore) * it.weight : null);
          const scoreStr = it.status === 'missing' ? '缺交' : (raw !== null ? `${raw}/${it.maxScore}` : '—');
          const contribStr = contrib !== null ? `+${contrib.toFixed(2)}%` : '—';
          
          return (
            <div key={it.id} className="detail-item" style={{ background: sBg[it.status] || 'var(--surface2)' }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: sDot[it.status], flexShrink: 0 }}></div>
              <span className="di-name">
                {it.name}
                {it.note && <span className="di-note">{it.note}</span>}
                <span className="di-ddl">{it.ddl || ''}</span>
              </span>
              <span className="di-score">{scoreStr}</span>
              <span className="di-contrib" style={{ color: contrib && contrib > 0 ? 'var(--green)' : 'var(--text3)' }}>{contribStr}</span>
              <span className="di-status" style={{ color: sDot[it.status] }}>{sLbl[it.status] || ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
