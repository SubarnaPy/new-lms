import React, { useEffect, useState } from "react";
import HomeLayout from "../../Layouts/HomeLayout";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { FaUsers, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { BsCollectionPlayFill, BsTrash, BsSearch, BsArrowRepeat } from "react-icons/bs";
import { MdOutlineModeEdit } from "react-icons/md";
import { BiTrendingUp, BiTrendingDown } from 'react-icons/bi';
import { TbChartBar, TbChartPie } from 'react-icons/tb';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteCourse, getAllCourses } from "../../Redux/courseSlice";
import { getStatsData } from "../../Redux/statSlice";
import Pagination from "./Pagination";
import Loader from "./Loader";
import ConfirmationModal from "../../Components/Modal/ConfirmationModal";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleteModal, setDeleteModal] = useState(null);

  const { 
    allUserCount, 
    totalUniqueStudents, 
    totalRevenue, 
    courses 
  } = useSelector((state) => state.stat);

  const { loading } = useSelector((state) => state.stat);

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Search, filter and sort courses with proper array copying
  const filteredCourses = courses
    ?.filter(course => 
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    ?.slice() // Create copy
    ?.sort((a, b) => {
      if (sortConfig.key) {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric comparison
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses?.slice(indexOfFirstItem, indexOfLastItem);

  // Chart data calculations
  const userData = {
    labels: ["Registered Users", "Enrolled Users"],
    datasets: [{
      label: "User Details",
      data: [allUserCount, totalUniqueStudents],
      backgroundColor: ["#FFD700", "#4CAF50"],
      borderColor: ["#FFD700", "#4CAF50"],
      borderWidth: 1,
    }]
  };

  const courseRevenueData = {
    labels: courses?.map((course) => course.courseName),
    datasets: [{
      label: "Course Revenue",
      data: courses?.map((course) => course.totalRevenue),
      backgroundColor: "rgba(54, 162, 235, 0.5)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    }]
  };

  const revenueDistributionData = {
    labels: courses?.map(course => course.courseName),
    datasets: [{
      data: courses?.map(course => course.totalRevenue),
      backgroundColor: courses?.map(() => 
        `#${Math.floor(Math.random()*16777215).toString(16)}`
      ),
      borderWidth: 1
    }]
  };

  const handleCourseDelete = async (id) => {
    setDeleteModal({
      text1: "Delete Course",
      text2: "Are you sure you want to delete this course?",
      btn1Text: "Delete",
      btn2Text: "Cancel",
      btn1Handler: async () => {
        const res = await dispatch(deleteCourse(id));
        if (res.payload.success) {
          await dispatch(getAllCourses());
        }
        setDeleteModal(null);
      },
      btn2Handler: () => setDeleteModal(null)
    });
  };

  useEffect(() => {
    (async () => {
      await dispatch(getAllCourses());
      await dispatch(getStatsData());
    })();
  }, [dispatch]);

  // Helper function to safely sort and slice courses
  const getSortedCourses = (sortFn, limit = 3) => {
    return courses?.slice()?.sort(sortFn)?.slice(0, limit) || [];
  };

  return (
    <div className="min-h-[90vh] p-5 flex flex-col bg-[#f9f9f9] dark:bg-gray-900 gap-10 text-black dark:text-white transition-all duration-300">
      <h1 className="text-3xl font-semibold text-center text-yellow-500 dark:text-yellow-400">
        Admin Dashboard
      </h1>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 gap-5 mx-5 md:grid-cols-4 md:mx-10">
        {/* Total Revenue Card */}
        <div className="flex items-center justify-between gap-5 p-5 transition-shadow duration-300 bg-white rounded-lg shadow-lg dark:bg-gray-800 hover:shadow-xl">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Total Revenue</p>
            <h3 className="text-2xl font-bold">${totalRevenue?.toLocaleString()}</h3>
          </div>
          <GiMoneyStack className="text-4xl text-green-500" />
        </div>

        {/* User Statistics Card */}
        <div className="flex items-center justify-between gap-5 p-5 transition-shadow duration-300 bg-white rounded-lg shadow-lg dark:bg-gray-800 hover:shadow-xl">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Total Users</p>
            <h3 className="text-2xl font-bold">{allUserCount}</h3>
          </div>
          <FaUsers className="text-4xl text-blue-500" />
        </div>

        {/* Course Statistics Card */}
        <div className="flex items-center justify-between gap-5 p-5 transition-shadow duration-300 bg-white rounded-lg shadow-lg dark:bg-gray-800 hover:shadow-xl">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Total Courses</p>
            <h3 className="text-2xl font-bold">{courses?.length}</h3>
          </div>
          <BsCollectionPlayFill className="text-4xl text-yellow-500" />
        </div>

        {/* Average Revenue Per User Card */}
        <div className="flex items-center justify-between gap-5 p-5 transition-shadow duration-300 bg-white rounded-lg shadow-lg dark:bg-gray-800 hover:shadow-xl">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Avg. Revenue/User</p>
            <h3 className="text-2xl font-bold">
              ${(totalRevenue / totalUniqueStudents || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </h3>
            <span className={`text-sm ${
              (totalRevenue / totalUniqueStudents) > 1000 
                ? 'text-green-500' 
                : 'text-yellow-500'
            }`}>
              {(totalRevenue / totalUniqueStudents) > 1000 
                ? <BiTrendingUp className="inline" /> 
                : <BiTrendingDown className="inline" />}
              {((totalRevenue / (totalRevenue - 10000)) * 100 || 0).toFixed(1)}% vs target
            </span>
          </div>
          <TbChartBar className="text-4xl text-purple-500" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-5 mx-5 md:grid-cols-2 md:mx-10">
        {/* User Distribution Pie Chart */}
        <div className="p-5 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold">User Distribution</h3>
          <div className="h-64">
            <Pie 
              data={userData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="p-5 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
            <TbChartPie className="text-blue-500" />
            Revenue Distribution
          </h3>
          <div className="h-64">
            <Pie 
              data={revenueDistributionData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.parsed || 0;
                        const percentage = ((value / totalRevenue) * 100).toFixed(2);
                        return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Course Performance Section */}
      <div className="mx-5 md:mx-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Top Performing Courses */}
          <div className="p-5 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
              <BiTrendingUp className="text-green-500" />
              Top Performing Courses
            </h3>
            <div className="space-y-3">
              {getSortedCourses((a, b) => b.totalRevenue - a.totalRevenue).map((course) => (
                <div key={course._id} className="flex justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                  <span>{course.courseName}</span>
                  <span className="font-semibold text-green-500">
                    ${course.totalRevenue?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Courses Needing Attention */}
          <div className="p-5 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
              <BiTrendingDown className="text-red-500" />
              Needs Attention
            </h3>
            <div className="space-y-3">
              {courses
                ?.slice() // Create copy before filtering
                ?.filter(course => course.totalStudents === 0)
                ?.slice(0, 3)
                ?.map((course) => (
                  <div key={course._id} className="flex justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                    <span>{course.courseName}</span>
                    <div className="flex gap-2">
                      <span className="text-red-500">0 students</span>
                      <button 
                        onClick={() => navigate(`/course/edit/${course._id}`)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <MdOutlineModeEdit />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Management Section */}
      <div className="mx-5 md:mx-10">
        <div className="flex flex-col justify-between gap-4 mb-5 md:flex-row">
          <h2 className="text-2xl font-semibold text-center text-yellow-500 dark:text-yellow-400">
            Course Management
          </h2>
          <div className="relative">
            <BsSearch className="absolute text-gray-400 top-3 left-3" />
            <input
              type="text"
              placeholder="Search courses..."
              className="py-2 pl-10 pr-4 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th 
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort('courseName')}
                    >
                      <div className="flex items-center gap-1">
                        Course Name
                        {sortConfig.key === 'courseName' ? (
                          sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                        ) : <FaSort />}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort('totalStudents')}
                    >
                      <div className="flex items-center gap-1">
                        Students
                        {sortConfig.key === 'totalStudents' ? (
                          sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                        ) : <FaSort />}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort('totalRevenue')}
                    >
                      <div className="flex items-center gap-1">
                        Revenue
                        {sortConfig.key === 'totalRevenue' ? (
                          sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                        ) : <FaSort />}
                      </div>
                    </th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCourses?.map((course) => (
                    <tr key={course?._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">{course?.courseName}</td>
                      <td className="px-4 py-3">{course?.totalStudents}</td>
                      <td className="px-4 py-3">${course?.totalRevenue?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                          className="p-2 mr-2 text-blue-500 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600"
                        >
                          <MdOutlineModeEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleCourseDelete(course._id)}
                          className="p-2 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-gray-600"
                        >
                          <BsTrash size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredCourses?.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              className="mt-4"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mx-5 md:mx-10">
        <div className="flex flex-wrap gap-3 mb-5">
          <button
            onClick={() => navigate('/course/create')}
            className="flex items-center gap-2 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
          >
            <BsCollectionPlayFill /> Add New Course
          </button>
          <button
            onClick={() => {
              dispatch(getAllCourses());
              dispatch(getStatsData());
            }}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            <BsArrowRepeat /> Refresh Data
          </button>
        </div>
      </div>

      {deleteModal && <ConfirmationModal modalData={deleteModal} />}
    </div>
  );
};

export default AdminDashboard;