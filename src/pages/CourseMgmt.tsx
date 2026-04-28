import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";

export default function CourseMgmt() {
  const courses = useQuery(api.courses?.getAll || "courses:getAll") || [];
  
  const addCourse = useMutation(api.courses?.addCourse || "courses:addCourse");
  const updateCourse = useMutation(api.courses?.updateCourse || "courses:updateCourse");
  const deleteCourse = useMutation(api.courses?.deleteCourse || "courses:deleteCourse");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [target, setTarget] = useState(80);
  const [items, setItems] = useState<any[]>([]);

  const openModal = (course?: any) => {
    if (course) {
      setEditingId(course._id);
      setName(course.name);
      setTarget(course.target || 80);
      setItems(course.items.map((it: any) => ({ ...it })));
    } else {
      setEditingId(null);
      setName("");
      setTarget(80);
      setItems([]);
    }
    setModalOpen(true);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { id: Math.random().toString(36).slice(2, 9), name: "", weight: 0, maxScore: 100, ddl: "", status: "upcoming", note: "" }
    ]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("请填写课程名称");
    const totalW = items.reduce((a, b) => a + (parseFloat(b.weight) || 0), 0);
    if (Math.abs(totalW - 100) > 0.5) {
      if (!confirm(`权重合计 ${totalW.toFixed(1)}%，不等于 100%，确定保存？`)) return;
    }

    if (editingId) {
      await updateCourse({
        id: editingId as any,
        name,
        target,
        items,
      });
    } else {
      await addCourse({
        name,
        target,
        items,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定删除该课程？所有学生该课程的成绩也会删除。")) {
      await deleteCourse({ id: id as any });
    }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">课程库</div>
        <div className="page-sub">管理课程及评估项目结构，多个学生可共用同一门课程。</div>
      </div>
      
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>+ 新建课程</button>
      </div>
      
      <div id="course-list">
        {courses.length === 0 && <p className="empty">还没有课程</p>}
        {courses.map((c: any) => (
          <div key={c._id} className="card" style={{ marginBottom: "9px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>{c.name}</span>
              <div style={{ display: "flex", gap: "5px" }}>
                <button className="icon-btn" onClick={() => openModal(c)}>编辑</button>
                <button className="icon-btn danger" onClick={() => handleDelete(c._id)}>删除</button>
              </div>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text2)" }}>
              {c.items.length} 项评估 · 权重合计 {c.items.reduce((a: any, b: any) => a + b.weight, 0).toFixed(1)}% · 默认目标 {c.target || 80}%
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay open">
          <div className="modal" style={{ width: "700px" }}>
            <h2>{editingId ? "编辑课程" : "新建课程"}</h2>
            
            <div className="form-row">
              <label>课程名</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：ACADENG 100" />
            </div>
            <div className="form-row">
              <label>默认目标</label>
              <input type="number" value={target} onChange={e => setTarget(parseFloat(e.target.value) || 80)} min="0" max="100" style={{ flex: "0 0 72px" }} />
              <span style={{ fontSize: "11.5px", color: "var(--text3)", marginLeft: "7px" }}>%</span>
            </div>
            
            <div style={{ fontSize: "11.5px", fontWeight: 500, color: "var(--text2)", margin: "13px 0 7px" }}>评估项目</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 48px 48px 88px 74px 1.4fr 22px", gap: "4px", fontSize: "10.5px", color: "var(--text3)", padding: "0 7px", marginBottom: "3px" }}>
              <span>名称</span><span>权重%</span><span>满分</span><span>DDL</span><span>状态</span><span>备注</span><span></span>
            </div>
            
            <div className="items-editor">
              {items.map((it, idx) => (
                <div key={idx} className="item-row-edit">
                  <input className="inp-name" type="text" value={it.name} onChange={e => updateItem(idx, "name", e.target.value)} placeholder="名称" />
                  <input className="inp-w" type="number" value={it.weight} onChange={e => updateItem(idx, "weight", parseFloat(e.target.value))} min="0" max="100" step="0.1" />
                  <input className="inp-max" type="number" value={it.maxScore} onChange={e => updateItem(idx, "maxScore", parseFloat(e.target.value))} min="1" />
                  <input className="inp-ddl" type="text" value={it.ddl} onChange={e => updateItem(idx, "ddl", e.target.value)} placeholder="DDL" />
                  <select className="inp-status" value={it.status} onChange={e => updateItem(idx, "status", e.target.value)}>
                    <option value="upcoming">即将</option>
                    <option value="pending">待录入</option>
                    <option value="locked">已完成</option>
                    <option value="missing">缺交</option>
                    <option value="final">期末</option>
                  </select>
                  <input className="inp-note" type="text" value={it.note} onChange={e => updateItem(idx, "note", e.target.value)} placeholder="备注" />
                  <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", color: "var(--text3)", padding: "0 2px" }} onClick={() => removeItem(idx)}>×</button>
                </div>
              ))}
            </div>
            
            <button className="btn btn-sm" style={{ marginTop: "7px" }} onClick={addItemRow}>+ 添加项目</button>
            
            <div className="modal-footer">
              <button className="btn btn-sm" onClick={() => setModalOpen(false)}>取消</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>保存课程</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
