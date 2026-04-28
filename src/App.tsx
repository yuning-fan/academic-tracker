import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import DdlCalendar from "./pages/DdlCalendar";
import ScoreEditor from "./pages/ScoreEditor";
import CourseDetail from "./pages/CourseDetail";
import DdlBoard from "./pages/DdlBoard";
import StudentMgmt from "./pages/StudentMgmt";
import CourseMgmt from "./pages/CourseMgmt";
import DataBackup from "./pages/DataBackup";

export default function App() {
  const [currentPage, setCurrentPage] = useState("overview");
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [currentCourseDetailId, setCurrentCourseDetailId] = useState<string | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <Overview studentId={currentStudentId} onNavigateCourse={(cid) => {
          setCurrentCourseDetailId(cid);
          setCurrentPage("course-detail");
        }} />;
      case "ddl":
        return <DdlCalendar studentId={currentStudentId} />;
      case "scores":
        return <ScoreEditor studentId={currentStudentId} />;
      case "course-detail":
        return <CourseDetail studentId={currentStudentId} courseId={currentCourseDetailId} />;
      case "ddl-all":
        return <DdlBoard />;
      case "mgmt-students":
        return <StudentMgmt />;
      case "mgmt-courses":
        return <CourseMgmt />;
      case "mgmt-data":
        return <DataBackup />;
      default:
        return <Overview studentId={currentStudentId} onNavigateCourse={() => {}}/>;
    }
  };

  return (
    <>
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentStudentId={currentStudentId}
        setCurrentStudentId={setCurrentStudentId}
      />
      <main className="main" id="main-content">
        {renderPage()}
      </main>
    </>
  );
}
