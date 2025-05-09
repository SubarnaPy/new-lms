import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../Helpers/axiosInstance';

const InstructorExamList = () => {
  const user = useSelector((state) => state.profile.data);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axiosInstance.get(`/courses/exams/instructor/${user._id}`);
        setExams(res.data);
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      }
    };

    if (user?._id) {
      fetchExams();
    }
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-bold">My Exams</h2>
      {exams.length === 0 ? (
        <p>No exams created yet.</p>
      ) : (
        <ul className="space-y-4">
          {exams.map((exam) => (
            <li key={exam._id} className="p-4 border rounded shadow">
              <h3 className="text-lg font-semibold">{exam.title}</h3>
              <p>{exam.instructions}</p>
              <Link
                to={`/dashboard/examlist/${exam._id}`}
                className="inline-block px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                View Exam
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InstructorExamList;
