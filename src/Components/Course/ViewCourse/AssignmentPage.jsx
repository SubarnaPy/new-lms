import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignments,
  submitAssignment,
  gradeAssignment,
  fetchSubmissions,
  markAssignmentAsComplete,
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
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  const userRole = useSelector((state) => state.auth.role);
  const studentId = useSelector((state) => state.auth.data._id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dispatch(
          fetchAssignments({ courseId, sectionId, assignmentId })
        );
        if (res?.payload) setAssignment(res.payload);

        const submissionRes = await dispatch(fetchSubmissions({ assignmentId }));
        
        if (submissionRes.payload) {
          console.log(submissionRes)
          const submissionList = submissionRes.payload.submissions;
          console.log(submissionList)

          
          if (userRole === "INSTRUCTOR") {
            const initialGrades = {};
            submissionList.forEach(sub => {
              initialGrades[sub._id] = {
                grade: sub.marksObtained || '',
                feedback: sub.feedback || ''
              };
            });
            setGrades(initialGrades);
            setSubmissions(submissionList);
            console.log(submissions)
            
            const allGraded = submissionList.every(sub => sub.marksObtained !== null);
            setStatus(allGraded ? "Graded" : "Submitted");
          } else {
            const studentSubmission = submissionList.find(
              sub => sub.studentId._id === studentId
            );
            setStatus(studentSubmission ? "Submitted" : "Not yet Submitted");
            setSubmissions(submissionList);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, courseId, sectionId, assignmentId, userRole, studentId]);

  console.log((submissions))

  const toggleSubmission = (submissionId) => {
    setExpandedSubmission(prev => prev === submissionId ? null : submissionId);
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async () => {
    if (!file) return setMessage("Please select a file to submit.");

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("courseId", courseId);
    formData.append("sectionId", sectionId);
    formData.append("assignmentId", assignmentId);
    formData.append("Assignmentfile", file);

    setSubmitting(true);
    try {
      const res = await dispatch(submitAssignment(formData));
      if (res.payload?.success) {
        setMessage("Assignment submitted successfully!");
        setFile(null);
        setStatus("Submitted");
      } else {
        setMessage(res.payload?.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeChange = (submissionId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const handleGradeSubmit = async (submissionId) => {
    try {
      const res = await dispatch(
        gradeAssignment({
          assignmentId,
          submissionId,
          grade: grades[submissionId]?.grade || 0,
          feedback: grades[submissionId]?.feedback || '',
          verified: true,
        })
      );

      if (res.payload?.success) {
        setMessage("Evaluation saved successfully!");
        const updatedSubmissions = await dispatch(fetchSubmissions({ assignmentId }));
        setSubmissions(updatedSubmissions.payload.submissions);
        
        const allGraded = updatedSubmissions.payload.submissions.every(
          sub => sub.marksObtained !== null
        );
        setStatus(allGraded ? "Graded" : "Submitted");
      }
    } catch (error) {
      console.error("Grading error:", error);
    }
  };

  const handleMarkComplete = async () => {
    try {
      const res = await dispatch(
        markAssignmentAsComplete({ courseId, assignmentId, studentId })
      );
      if (res.payload?.success) {
        setMessage("Assignment marked complete!");
        setStatus("Completed");
      }
    } catch (error) {
      console.error("Complete error:", error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="w-12 h-12" color="blue" />
    </div>
  );

  if (!assignment) return (
    <div className="mt-10 text-center text-red-500">Assignment not found!</div>
  );

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen bg-gray-50 dark:bg-gray-900`}>
      <div className="max-w-4xl p-6 mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {assignment.title}
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {assignment.description}
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            {darkMode ? "🌞 Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Assignment Details Card */}
        <div className="p-6 mb-8 bg-white shadow-sm dark:bg-gray-800 rounded-xl">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</h3>
              <p className="mt-1 text-gray-900 dark:text-white">
                {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Status</h3>
              <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                ${status === "Submitted" ? "bg-yellow-100 text-yellow-800" :
                  status === "Graded" ? "bg-green-100 text-green-800" :
                    status === "Completed" ? "bg-blue-100 text-blue-800" :
                      "bg-red-100 text-red-800"}`}>
                {status}
              </div>
            </div>
          </div>
        </div>

        {/* Student Submission Section */}
        {userRole === "STUDENT" && (
          <div className="p-6 mb-8 bg-white shadow-sm dark:bg-gray-800 rounded-xl">
            <h2 className="mb-4 text-xl font-semibold dark:text-white">Your Submission</h2>
            {submissions.find(sub => sub.studentId._id === studentId) ? (
              <div className="space-y-4">
                <div className="border rounded-lg dark:border-gray-700">
                  <button
                    className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => toggleSubmission('student-view')}
                  >
                    <span className="font-medium">View Submission Details</span>
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        expandedSubmission === 'student-view' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSubmission === 'student-view' && (
                    <div className="p-4 pt-0 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted Files</h3>
                        {submissions
                          .find(sub => sub.studentId._id === studentId)
                          ?.submittedFiles.map((file, index) => (
                            <a
                              key={index}
                              href={file.secure_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download File {index + 1}
                            </a>
                          ))}
                      </div>

                      {submissions.find(sub => sub.studentId._id === studentId)?.feedback && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructor Feedback</h3>
                          <div className="p-4 mt-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <p className="text-gray-800 dark:text-gray-200">
                              {submissions.find(sub => sub.studentId._id === studentId)?.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium dark:text-gray-300">
                      Upload New Submission
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {file && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {file.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Spinner className="w-4 h-4 mr-2" />
                          Submitting...
                        </>
                      ) : "Submit Assignment"}
                    </button>

                    <button
                      onClick={handleMarkComplete}
                      className="inline-flex items-center px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Mark as Complete
                    </button>
                  </div>
                </div>

                {message && (
                  <div className={`mt-4 p-3 rounded-lg ${message.includes("success") ? 
                    "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                    {message}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg dark:bg-gray-700">
                  No submission found
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium dark:text-gray-300">
                    Upload Assignment
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Assignment"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructor Grading Section */}
        {userRole === "INSTRUCTOR" && (
          <div className="p-6 bg-white shadow-sm dark:bg-gray-800 rounded-xl">
            <h2 className="mb-6 text-xl font-semibold dark:text-white">Student Submissions</h2>
            
            {submissions.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No submissions received yet
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission._id} className="border rounded-lg dark:border-gray-700">
                    <button
                      className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => toggleSubmission(submission._id)}
                    >
                      <div className="text-left">
                        <h3 className="font-medium dark:text-white">
                          {submission.studentId?.name || "Anonymous Student"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {submission.studentId?.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full 
                          ${submission.marksObtained !== null ? 
                            'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {submission.marksObtained !== null ? 'Graded' : 'Pending'}
                        </span>
                        <svg
                          className={`w-5 h-5 transform transition-transform ${
                            expandedSubmission === submission._id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {expandedSubmission === submission._id && (
                      <div className="p-4 pt-0 space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted Files</h3>
                          <div className="mt-2 space-y-2">
                            {submission.submittedFiles.map((file, index) => (
                              <a
                                key={index}
                                href={file.secure_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download File {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block mb-2 text-sm font-medium dark:text-gray-300">
                                Grade (0-100)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={grades[submission._id]?.grade || ''}
                                onChange={(e) => handleGradeChange(submission._id, 'grade', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium dark:text-gray-300">
                              Feedback
                            </label>
                            <textarea
                              value={grades[submission._id]?.feedback || ''}
                              onChange={(e) => handleGradeChange(submission._id, 'feedback', e.target.value)}
                              rows="3"
                              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                              placeholder="Provide constructive feedback..."
                            />
                          </div>

                          {submission.feedback && (
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                Previous Feedback
                              </p>
                              <p className="text-gray-800 dark:text-gray-200">
                                {submission.feedback}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() => handleGradeSubmit(submission._id)}
                            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            {submission.marksObtained !== null ? 
                              "Update Evaluation" : "Submit Evaluation"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentPage;