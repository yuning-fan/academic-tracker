import { useState } from "react";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import DdlList from "../components/DdlList";

export default function DdlBoard() {
  const students = useQuery(api.students?.getAll || "students:getAll") || [];
  const courses = useQuery(api.courses?.getAll || "courses:getAll") || [];
  const [filter, setFilter] = useState("all");

  const filteredStudents = filter === "all" ? students : students.filter((s: any) => s._id === filter);
  
  const items: any[] = [];
  filteredStudents.forEach((s: any) => {
    courses.filter((c: any) => s.courseIds?.includes(c._id)).forEach((c: any) => {
      c.items.forEach((it: any) => {
        if (["upcoming", "final", "pending"].includes(it.status)) {
          items.push({ ...it, courseName: c.name, studentName: s.name });
        }
      });
    });
  });

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">DDL 总看板</div>
        <div className="page-sub">所有学生的截止日期汇总，按紧迫程度排序。</div>
      </div>
      
      <div className="tab-row">
        <button 
          className={`tab ${filter === "all" ? "active" : ""}`} 
          onClick={() => setFilter("all")}
        >
          全部学生
        </button>
        {students.map((s: any) => (
          <button 
            key={s._id}
            className={`tab ${filter === s._id ? "active" : ""}`} 
            onClick={() => setFilter(s._id)}
          >
            {s.name}
          </button>
        ))}
      </div>
      
      <div>
        <DdlList items={items} showStudent={filter === "all"} />
      </div>
    </div>
  );
}
