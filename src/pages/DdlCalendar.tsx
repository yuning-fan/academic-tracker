import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import DdlList from "../components/DdlList";

export default function DdlCalendar({ studentId }: { studentId: string | null }) {
  const students = useQuery(api.students?.getAll || "students:getAll") || [];
  const courses = useQuery(api.courses?.getAll || "courses:getAll") || [];

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
  const items: any[] = [];
  
  studentCourses.forEach((c: any) => {
    c.items.forEach((it: any) => {
      if (["upcoming", "final", "pending"].includes(it.status)) {
        items.push({ ...it, courseName: c.name });
      }
    });
  });

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">{student.name} · DDL 日历</div>
        <div className="page-sub">仅显示待完成项目，按紧迫程度排序。</div>
      </div>
      <div>
        <DdlList items={items} showStudent={false} />
      </div>
    </div>
  );
}
