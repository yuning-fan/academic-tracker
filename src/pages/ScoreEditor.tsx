import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";

export default function ScoreEditor({ studentId }: { studentId: string | null }) {
  const students = useQuery(api.students?.getAll || "students:getAll") || [];
  const courses = useQuery(api.courses?.getAll || "courses:getAll") || [];
  const scores = useQuery(api.scores?.getByStudent || "scores:getByStudent", studentId ? { studentId } : "skip") || [];
  const setScore = useMutation(api.scores?.setScore || "scores:setScore");
  const deleteScore = useMutation(api.scores?.deleteScore || "scores:deleteScore");

  const [toastVisible, setToastVisible] = useState(false);
  
  // local state to hold changes before saving
  const [localScores, setLocalScores] = useState<Record<string, string>>({});

  const student = students.find((s: any) => s._id === studentId);

  if (!student) {
    return (
      <div className="page active">
        <div className="page-header">
          <div className="page-title">请先选择学生</div>
        </div>
      </div>
    );
  }

  const studentCourses = courses.filter((c: any) => student.courseIds?.includes(c._id));

  const handleSave = async () => {
    for (const key of Object.keys(localScores)) {
      const val = localScores[key];
      const itemId = key;
      
      if (val === "") {
        await deleteScore({ studentId: student._id, itemId });
      } else {
        await setScore({ studentId: student._id, itemId, score: parseFloat(val) });
      }
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const getVal = (itemId: string) => {
    if (localScores[itemId] !== undefined) return localScores[itemId];
    const rec = scores.find((s: any) => s.itemId === itemId);
    return rec ? String(rec.score) : "";
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">{student.name} · 录入成绩</div>
        <div className="page-sub">填写实际得分后点击保存，所有页面自动更新。</div>
      </div>
      
      <div>
        {studentCourses.map((c: any) => (
          <div key={c._id} className="editor-section">
            <div className="editor-head">
              {c.name}
              <span style={{ fontSize: "11px", color: "var(--text3)", fontWeight: 400 }}>
                权重合计 {c.items.reduce((a: any, b: any) => a + b.weight, 0).toFixed(1)}%
              </span>
            </div>
            {c.items.map((it: any) => {
              const isMissing = it.status === "missing";
              return (
                <div key={it.id} className="score-row">
                  <label>
                    {it.name}
                    {it.note && <span style={{ fontSize: "10.5px", color: "var(--text3)", marginLeft: "4px" }}>{it.note}</span>}
                  </label>
                  <span className="wt">{it.weight}% / {it.maxScore}</span>
                  <input 
                    type="number" 
                    disabled={isMissing} 
                    min="0" 
                    max={it.maxScore} 
                    step="0.5"
                    value={getVal(it.id)}
                    onChange={(e) => setLocalScores({ ...localScores, [it.id]: e.target.value })}
                    placeholder={isMissing ? "0" : it.status === "pending" ? "待录入" : "未做"}
                  />
                  {isMissing && <span className="missing-lbl">已缺交</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
        <button className="btn btn-primary" onClick={handleSave}>保存并更新</button>
        <span className="save-toast" style={{ opacity: toastVisible ? 1 : 0 }}>✓ 已保存</span>
      </div>
    </div>
  );
}
