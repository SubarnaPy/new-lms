// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchAssignments,
//   submitAssignment,
//   gradeAssignment,
//   fetchSubmissions,
// } from "../../../Redux/assignmentSlice";
// import { Spinner } from "@material-tailwind/react";

// const AssignmentPage = () => {
//   const { courseId, sectionId, assignmentId } = useParams();
//   const dispatch = useDispatch();

//   const [assignment, setAssignment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [darkMode, setDarkMode] = useState(false);
//   const [file, setFile] = useState(null); // For student file submission
//   const [message, setMessage] = useState("");
//   const [submissions, setSubmissions] = useState([]);
//   const [grades, setGrades] = useState({});
//   const [status, setStatus] = useState("Not Submitted"); // Assignment status
//   const [submitting, setSubmitting] = useState(false); // ✅ Loading state for submission button

//   const userRole = useSelector((state) => state.auth.role);
//   const studentId = useSelector((state) => state.auth.data._id);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await dispatch(
//           fetchAssignments({ courseId, sectionId, assignmentId })
//         );
//         if (res?.payload) {
//           setAssignment(res.payload);
//         }

//         if (userRole === "INSTRUCTOR") {
//           const submissionRes = await dispatch(
//             fetchSubmissions({ assignmentId })
//           );
//           if (submissionRes.payload) {
//             setSubmissions(submissionRes.payload);

//             // Update status based on grading
//             const allGraded = submissionRes.payload.every(
//               (sub) => sub.grade !== null
//             );
//             setStatus(allGraded ? "Graded" : "Submitted");
//           }
//         } else {
//           // Student: Check if the student has submitted
//           const submissionRes = await dispatch(
//             fetchSubmissions({ assignmentId })
//           );
//           if (submissionRes.payload) {
//             const studentSubmission = submissionRes.payload.submissions.find(
//               (sub) => sub.studentId._id === studentId
//             );
//             setStatus(studentSubmission ? "Submitted" : "Not Submitted");
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching assignment:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [dispatch, courseId, sectionId, assignmentId, userRole, studentId]);

//   // ✅ Handle File Upload for Submission
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleSubmit = async () => {
//     if (!file) {
//       setMessage("Please select a file to submit.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("studentId", studentId);
//     formData.append("courseId", courseId);
//     formData.append("sectionId", sectionId);
//     formData.append("assignmentId", assignmentId);
//     formData.append("Assignmentfile", file); // Append the file

//     setSubmitting(true); // ✅ Show loading spinner

//     try {
//       const res = await dispatch(submitAssignment(formData));

//       if (res.payload && res.payload.success) {
//         setMessage("Assignment submitted successfully!");
//         setFile(null);
//         setStatus("Submitted");
//       } else if (res.payload && res.payload.message) {
//         setMessage(res.payload.message); // Handle "Already Submitted" case
//         setStatus("Already Submitted");
//       } else {
//         setMessage("Failed to submit assignment.");
//       }
//     } catch (error) {
//       console.error("Error submitting assignment:", error);
//       setMessage("An error occurred.");
//     } finally {
//       setSubmitting(false); // ✅ Hide loading spinner
//     }
//   };

//   // ✅ Handle Grading by Teacher
//   const handleGradeChange = (submissionId, grade) => {
//     setGrades((prev) => ({
//       ...prev,
//       [submissionId]: grade,
//     }));
//   };

//   const handleGradeSubmit = async (submissionId) => {
//     try {
//       const res = await dispatch(
//         gradeAssignment({
//           assignmentId,
//           submissionId,
//           grade: grades[submissionId] || 0,
//           verified: true,
//         })
//       );

//       if (res.payload.success) {
//         setMessage("Assignment graded successfully!");
//         const updatedSubmissions = await dispatch(
//           fetchSubmissions({ assignmentId })
//         );
//         setSubmissions(updatedSubmissions.payload);

//         const allGraded = updatedSubmissions.payload.every(
//           (sub) => sub.grade !== null
//         );
//         setStatus(allGraded ? "Graded" : "Submitted");
//       } else {
//         setMessage("Failed to grade assignment.");
//       }
//     } catch (error) {
//       console.error("Error grading assignment:", error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Spinner color="blue" />
//       </div>
//     );
//   }

//   if (!assignment) {
//     return <div className="mt-10 text-center">Assignment not found!</div>;
//   }

//   return (
//     <div
//       className={`${darkMode ? "dark" : ""} min-h-screen transition-colors duration-300`}
//     >
//       <div className="max-w-4xl p-6 mx-auto dark:bg-gray-900 dark:text-gray-100">
//         {/* Header with Dark Mode Toggle */}
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
//             {assignment.title}
//           </h1>
//           <button
//             onClick={() => setDarkMode(!darkMode)}
//             className="p-2 transition bg-gray-200 rounded-full dark:bg-gray-700"
//           >
//             {darkMode ? "☀️" : "🌙"}
//           </button>
//         </div>

//         {/* Assignment Details */}
//         <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
//           <h2 className="mb-2 text-2xl font-semibold">{assignment.title}</h2>
//           <p className="text-gray-600 dark:text-gray-300">
//             {assignment.description}
//           </p>

//           <div className="mt-4">
//             <h3 className="text-xl font-medium">Due Date:</h3>
//             <p className="text-gray-500 dark:text-gray-400">
//               {new Date(assignment.dueDate).toLocaleDateString()}
//             </p>

//             <h3 className="mt-4 text-xl font-medium">Status:</h3>
//             <p
//               className={`text-lg font-bold ${
//                 status === "Submitted"
//                   ? "text-yellow-500"
//                   : status === "Graded"
//                   ? "text-green-500"
//                   : "text-red-500"
//               }`}
//             >
//               {status}
//             </p>
//           </div>
//         </div>

//         {/* Student Submission Section */}
//         {userRole === "STUDENT" && (
//           <div className="mt-8">
//             <h3 className="text-xl font-medium">Submit Your Assignment:</h3>

//             <input
//               type="file"
//               onChange={handleFileChange}
//               className="block w-full p-2 border rounded-md"
//             />

//             <button
//               onClick={handleSubmit}
//               className="flex items-center justify-center px-4 py-2 mt-4 text-white bg-blue-500 rounded-md"
//               disabled={submitting}
//             >
//               {submitting ? (
//                 <>
//                   <Spinner className="mr-2" color="white" size="sm" />
//                   Submitting...
//                 </>
//               ) : (
//                 "Submit"
//               )}
//             </button>
//           </div>
//         )}

//         {/* Teacher's View: All Submissions */}
//         {userRole === "INSTRUCTOR" && (
//           <div className="mt-8">
//             <h3 className="text-xl font-medium">All Submissions:</h3>
//             {submissions.length > 0 ? (
//               submissions.map((submission) => (
//                 <div key={submission._id} className="p-4 my-4 bg-gray-100 rounded-md">
//                   <p className="text-lg font-medium">{submission.studentName}</p>
//                   <a href={submission.fileUrl} target="_blank" className="text-blue-500">
//                     Download Submission
//                   </a>
//                 </div>
//               ))
//             ) : (
//               <p>No submissions yet.</p>
//             )}
//           </div>
//         )}

//         {message && <div className="mt-4 text-green-500">{message}</div>}
//       </div>
//     </div>
//   );
// };

// export default AssignmentPage;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignments,
  submitAssignment,
  gradeAssignment,
  fetchSubmissions,
  markAssignmentAsComplete, // ✅ Import the new action
} from "../../../Redux/assignmentSlice";
import { Spinner } from "@material-tailwind/react";

const AssignmentPage = () => {
  const { courseId, sectionId, assignmentId } = useParams();
  const dispatch = useDispatch();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState({});
  const [status, setStatus] = useState("Not Submitted");
  const [submitting, setSubmitting] = useState(false);

  const userRole = useSelector((state) => state.auth.role);
  const studentId = useSelector((state) => state.auth.data._id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dispatch(
          fetchAssignments({ courseId, sectionId, assignmentId })
        );
        if (res?.payload) {
          setAssignment(res.payload);
        }

        if (userRole === "INSTRUCTOR") {
          const submissionRes = await dispatch(fetchSubmissions({ assignmentId }));
        
          if (submissionRes.payload) {
            const submissionList = submissionRes.payload.submissions;
            console.log(submissionList);
        
            setSubmissions(submissionList);
        
            const allGraded = submissionList.every((sub) => sub.grade !== null);
            setStatus(allGraded ? "Graded" : "Submitted");
          }
        }
        else {
          const submissionRes = await dispatch(
            fetchSubmissions({ assignmentId })
          );
          if (submissionRes.payload) {
            const studentSubmission = submissionRes.payload.submissions.find(
              (sub) => sub.studentId._id === studentId
            );
            setStatus(studentSubmission ? "Submitted" : "Not Submitted");
          }
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    };



    fetchData();
  }, [dispatch, courseId, sectionId, assignmentId, userRole, studentId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Please select a file to submit.");
      return;
    }

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("courseId", courseId);
    formData.append("sectionId", sectionId);
    formData.append("assignmentId", assignmentId);
    formData.append("Assignmentfile", file);

    setSubmitting(true);
    try {
      const res = await dispatch(submitAssignment(formData));
      if (res.payload && res.payload.success) {
        setMessage("Assignment submitted successfully!");
        setFile(null);
        setStatus("Submitted");
      } else if (res.payload) {
        setMessage(res.payload.message);
        setStatus("Already Submitted");
      } else {
        setMessage("Failed to submit assignment.");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setMessage("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  console.log(submissions)

  const handleGradeChange = (submissionId, grade) => {
    setGrades((prev) => ({
      ...prev,
      [submissionId]: grade,
    }));
  };

  const handleGradeSubmit = async (submissionId) => {
    console.log(submissionId,assignmentId)
    try {
      const res = await dispatch(
        gradeAssignment({
          assignmentId,
          submissionId,
          grade: grades[submissionId] || 0,
          verified: true,
        })
      );
      console.log(res)

      if (res.payload.success) {
        setMessage("Assignment graded successfully!");
        const updatedSubmissions = await dispatch(
          fetchSubmissions({ assignmentId })
        );
        const submissionList = updatedSubmissions.payload.submissions;
        console.log(submissionList);
    
        setSubmissions(submissionList);

        const allGraded = updatedSubmissions.payload.every(
          (sub) => sub.grade !== null
        );
        setStatus(allGraded ? "Graded" : "Submitted");
      } else {
        setMessage("Failed to grade assignment.");
      }
    } catch (error) {
      console.log("Error grading assignment:", error);
    }
  };

  // ✅ Function to mark the assignment as complete
  const handleMarkComplete = async () => {
    try {
      const res = await dispatch(
        markAssignmentAsComplete({courseId, assignmentId, studentId })
      );
      console.log(res);

      if (res.payload && res.payload.success) {
        setMessage("Assignment marked as complete!");
        setStatus("Completed");
      } else {
        setMessage("Failed to mark assignment as complete.");
      }
    } catch (error) {
      console.error("Error marking assignment as complete:", error);
      setMessage("An error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner color="blue" />
      </div>
    );
  }

  if (!assignment) {
    return <div className="mt-10 text-center">Assignment not found!</div>;
  }

  return (
    <div
      className={`${darkMode ? "dark" : ""} min-h-screen transition-colors duration-300`}
    >
      <div className="max-w-4xl p-6 mx-auto dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            {assignment.title}
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 transition bg-gray-200 rounded-full dark:bg-gray-700"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-2 text-2xl font-semibold">{assignment.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {assignment.description}
          </p>

          <div className="mt-4">
            <h3 className="text-xl font-medium">Due Date:</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {new Date(assignment.dueDate).toLocaleDateString()}
            </p>

            <h3 className="mt-4 text-xl font-medium">Status:</h3>
            <p
              className={`text-lg font-bold ${
                status === "Submitted"
                  ? "text-yellow-500"
                  : status === "Graded"
                  ? "text-green-500"
                  : status === "Completed"
                  ? "text-blue-500"
                  : "text-red-500"
              }`}
            >
              {status}
            </p>
          </div>
        </div>

        {userRole === "STUDENT" && (
          <div className="mt-8">
            <h3 className="text-xl font-medium">Submit Your Assignment:</h3>

            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full p-2 border rounded-md"
            />

            <button
              onClick={handleSubmit}
              className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-md"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>

            <button
              onClick={handleMarkComplete}
              className="px-4 py-2 mt-4 ml-4 text-white bg-green-500 rounded-md"
            >
              Mark as Complete
            </button>
          </div>
        )}
         {/* Teacher's View: All Submissions */}
         {userRole === "INSTRUCTOR" && (
  <div className="mt-8">
    <h3 className="text-xl font-medium">All Submissions:</h3>
    {submissions.length > 0 ? (
      submissions.map((submission) => {
        const isGraded = submission.marksObtained !== undefined && submission.marksObtained !== null;

        return (
          <div key={submission._id} className="p-4 my-4 bg-gray-100 rounded-md">
            <p className="text-lg font-medium">
              {submission.studentId?.email || "Unknown Student"}
            </p>

            {submission.submittedFiles.length > 0 && (
              <a
                href={submission.submittedFiles[0].secure_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                Download Submission
              </a>
            )}

            {/* Evaluation status */}
            <p className={`mt-2 font-medium ${isGraded ? "text-green-600" : "text-yellow-600"}`}>
              {isGraded ? `Evaluated: ${submission.marksObtained} marks` : "Not yet evaluated"}
            </p>

            {/* Grade input */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min="0"
                max="100"
                value={grades[submission._id] ?? ""}
                onChange={(e) => handleGradeChange(submission._id, e.target.value)}
                placeholder="Enter grade"
                className="w-24 px-2 py-1 border rounded"
              />
              <button
                onClick={() => handleGradeSubmit(submission._id)}
                className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Submit Grade
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <p>No submissions yet.</p>
    )}
  </div>
)}



        {message && <div className="mt-4 text-green-500">{message}</div>}
      </div>
    </div>
  );
};

export default AssignmentPage;
