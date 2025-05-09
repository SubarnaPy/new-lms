import { ACCOUNT_TYPE } from "../../utils/constants";

export const sidebarLinks = [
  {
    id: 1,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },
  {
    id: 2,
    name: "Dashboard",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 3,
    name: "My Courses",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 4,
    name: "Add Course",
    path: "/dashboard/add-course",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAdd",
  },
  {
    id: 5,
    name: "Enrolled Courses",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },
  {
    id: 6,
    name: "Cart",
    path: "/dashboard/cart",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscBookmark",
  },
  {
    id: 7,
    name: "Admin Panel",
    path: "/dashboard/admin-panel",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscHistory",
  },

  // 💡 Exam Links for Instructor
  {
    id: 8,
    name: "Exam List",
    path: "/dashboard/examlist",
    icon: "VscList",
    type: ACCOUNT_TYPE.INSTRUCTOR,
  },
  {
    id: 9,
    name: "Create Exam",
    path: "/dashboard/createexam",
    icon: "VscAdd",
    type: ACCOUNT_TYPE.INSTRUCTOR,
  },
  {
    id: 10,
    
    name: "My Exams",
    path: "/dashboard/myexams",
    icon: "VscFolderOpened",
    type: ACCOUNT_TYPE.INSTRUCTOR,
  },
];
