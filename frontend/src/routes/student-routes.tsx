import { RouteObject } from "react-router-dom";
import StudentLayout from "@/layouts/student-layout";
import StudentDashboard from "@/pages/student/StudentDashboard";
// import ParentComponent from "@/ai-components/ParentComponent";
import JoinPollRoom from "@/pages/student/JoinPollRoom"; 
import StudentPollRoom from "@/pages/student/StudentPollRoom";

const studentRoutes: RouteObject = {
  path: "/student",
  element: <StudentLayout />,
  children: [
    {
      path: "dashboard",
      element: <StudentDashboard />,
    },
    {
      path: "pollroom",
      element: <JoinPollRoom />,
    },
    {
      path: "pollroom/$code",
      element: <StudentPollRoom />,
    },
    {
      index: true,
      element: <StudentDashboard />, // Default to Dashboard
    }
  ],
};

export default {studentRoutes};
