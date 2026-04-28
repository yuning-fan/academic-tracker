import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";

export default function StudentMgmt() {
  const students = useQuery(api.students?.getAll || "students:getAll") || [];
  const courses = useQuery(api.courses?.getAll || "courses:getAll") || [];
  
  const addStudent = useMutation(api.students?.addStudent || "students:addStudent");
  const updateStudent = useMutation(api.students?.updateStudent || "students:updateStudent");
  const deleteStudent = useMutation(api.students?.deleteStudent || "students:deleteStudent");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [target, setTarget] = useState(80);
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [courseTargets, setCourseTargets] = useState<Record<string, number>>({});

  const openModal = (student?: any) => {
    if (student) {
      setEditingId(student._id);
      setName(student.name);
      setTarget(student.target || 80);
      setCourseIds(student.courseIds || []);
      const targetsMap: Record<string, number> = {};
      (student.courseTargets || []).forEach((t: any) => {
        targetsMap[t.courseId] = t.target;
      });
      setCourseTargets(targetsMap);
    } else {
      setEditingId(null);
      setName("");
      setTarget(80);
      setCourseIds([]);
      setCourseTargets({});
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("请填写姓名");
    
    const targetsArray = Object.entries(courseTargets)
      .map(([courseId, target]) => ({ courseId, target }))
      .filter((t) => courseIds.includes(t.courseId)); // only save targets for selected courses

    if (editingId) {
      await updateStudent({
        id: editingId as any,
        name,
        target,
        courseIds: courseIds as any,
        courseTargets: targetsArray as any,
      });
    } else {
      await addStudent({
        name,
        target,
        courseIds: courseIds as any,
        courseTargets: targetsArray as any,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定删除该学生？其所有成绩数据也会删除。")) {
      await deleteStudent({ id: id as any });
    }
  };

  const toggleCourse = (cid: string) => {
    if (courseIds.includes(cid)) {
      setCourseIds(courseIds.filter(id => id !== cid));
    } else {
      setCourseIds([...courseIds, cid]);
    }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">学生管理</div>
        <div className="page-sub">添加、编辑学生信息和选课。</div>
      </div>
      
      <div className="mgmt-grid">
        <div className="mgmt-card">
          <h3>学生列表</h3>
          <div id="student-list">
            {students.length === 0 && <p className="empty">暂无学生</p>}
            {students.map((s: any) => {
              const n = courses.filter((c: any) => s.courseIds?.includes(c._id)).length;
              return (
                <div key={s._id} className="list-item">
                  <div className="li-name">{s.name}</div>
                  <div className="li-sub">{n} 门课</div>
                  <button className="icon-btn" onClick={() => openModal(s)}>编辑</button>
                  <button className="icon-btn danger" onClick={() => handleDelete(s._id)}>删除</button>
                </div>
              );
            })}
          </div>
          <button className="btn btn-sm" style={{ marginTop: "9px" }} onClick={() => openModal()}>
            + 添加学生
          </button>
        </div>
        <div className="mgmt-card">
          <h3 style={{ color: "var(--text3)", fontWeight: 400 }}>点击左侧编辑按钮或添加学生</h3>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay open">
          <div className="modal">
            <h2>{editingId ? "编辑学生" : "添加学生"}</h2>
            
            <div className="form-row">
              <label>姓名</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：沈豪" />
            </div>
            <div className="form-row">
              <label>默认目标</label>
              <input type="number" value={target} onChange={e => setTarget(parseFloat(e.target.value) || 80)} min="0" max="100" />
              <span style={{ fontSize: "11.5px", color: "var(--text3)", marginLeft: "6px" }}>% （可在每门课单独覆盖）</span>
            </div>
            
            <div style={{ fontSize: "11.5px", fontWeight: 500, color: "var(--text2)", margin: "11px 0 7px" }}>选课及各科目标分</div>
            <div>
              {courses.length === 0 && <p className="empty">请先在课程库中添加课程</p>}
              {courses.map((c: any) => {
                const checked = courseIds.includes(c._id);
                const perTgt = courseTargets[c._id] || "";
                return (
                  <div key={c._id} className="check-row" style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <input type="checkbox" id={`cc_${c._id}`} checked={checked} onChange={() => toggleCourse(c._id)} />
                      <label htmlFor={`cc_${c._id}`}>{c.name}</label>
                    </div>
                    <div className="target-inline">
                      <span>目标</span>
                      <input 
                        type="number" 
                        value={perTgt} 
                        onChange={e => setCourseTargets({ ...courseTargets, [c._id]: parseFloat(e.target.value) || 0 })} 
                        min="0" max="100" placeholder={String(target)} 
                      />
                      <span>%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer">
              <button className="btn btn-sm" onClick={() => setModalOpen(false)}>取消</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
