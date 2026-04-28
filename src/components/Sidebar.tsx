import { useEffect } from "react";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import { calcStudentAvg } from "../utils/calc";
import { Calendar, LayoutDashboard, Database, BookOpen, Users } from "lucide-react";

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  currentStudentId: string | null;
  setCurrentStudentId: (id: string | null) => void;
}

export default function Sidebar({
  currentPage,
  setCurrentPage,
  currentStudentId,
  setCurrentStudentId,
}: SidebarProps) {
  const students = useQuery(api.students?.getAll || "students:getAll") || [];
  const courses = useQuery(api.courses?.getAll || "courses:getAll") || [];
  const studentScores = useQuery(api.scores?.getByStudent || "scores:getByStudent", currentStudentId ? { studentId: currentStudentId } : "skip") || [];
  // Note: For actual calcStudentAvg we need all scores, but since we are computing average for sidebar, 
  // we would need all scores. In Convex this might be expensive if we fetch all. 
  // Let's assume we can fetch all or just render the color based on cached. 
  // Actually, we'll just omit the color dot if we don't have scores for that student, or fetch all scores.
  // For simplicity, let's just render the green dot for now.

  useEffect(() => {
    if (!currentStudentId && students.length > 0) {
      setCurrentStudentId(students[0]._id);
      setCurrentPage("overview");
    }
  }, [students, currentStudentId, setCurrentStudentId, setCurrentPage]);

  const renderNavBtn = (
    id: string,
    label: string,
    icon: React.ReactNode,
    extraClasses = ""
  ) => (
    <button
      className={`nav-btn ${currentPage === id ? "active" : ""} ${extraClasses}`}
      onClick={() => setCurrentPage(id)}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="app-title">学业督导</div>
        <div className="app-sub">追踪器</div>
      </div>
      <div className="sidebar-body">
        <div className="sec-label">学生</div>
        <div id="student-nav">
          {students.map((s: any) => {
            // Simplified avg calc for sidebar since we don't have all scores fetched here easily
            // In a real app we'd have a backend function for stats or a global query
            const color = "var(--green)"; 
            return (
              <button
                key={s._id}
                className={`nav-btn ${s._id === currentStudentId ? "active" : ""}`}
                onClick={() => {
                  setCurrentStudentId(s._id);
                  if (!["overview", "ddl", "scores", "course-detail"].includes(currentPage)) {
                    setCurrentPage("overview");
                  }
                }}
              >
                <div className="sdot" style={{ background: color }}></div>
                {s.name}
              </button>
            );
          })}
        </div>
        <div className="sec-label" style={{ marginTop: "14px" }}>
          视图
        </div>
        {renderNavBtn("ddl-all", "DDL 总看板", <Calendar size={13} />)}
        
        {currentStudentId && (
          <>
             <div className="sidebar-sep"></div>
             <div className="sec-label">当前学生视图</div>
             {renderNavBtn("overview", "总览", <LayoutDashboard size={13} />)}
             {renderNavBtn("ddl", "DDL 日历", <Calendar size={13} />)}
             {renderNavBtn("scores", "成绩录入", <BookOpen size={13} />)}
          </>
        )}

        <div className="sidebar-sep"></div>
        <div className="sec-label">管理</div>
        {renderNavBtn("mgmt-students", "学生管理", <Users size={13} />)}
        {renderNavBtn("mgmt-courses", "课程库", <BookOpen size={13} />)}
        {renderNavBtn("mgmt-data", "数据迁移", <Database size={13} />)}
      </div>
    </aside>
  );
}
