import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../../Helpers/axiosInstance';
import { getAllCourses } from '../../../Redux/courseSlice';
import { useDispatch, useSelector } from 'react-redux';

const ExamForm = () => {

    const user = useSelector((state) => state.profile.data);

    const dispatch =useDispatch()
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
  
    const [exam, setExam] = useState({
      instructorId: '',
        courseId: '',
        title: '',
        instructions: '',
        duration: 0,
        passingScore: 0,
        questions: [{ question: '', options: ['', ''], correctAnswer: 0 }]
      });
      
  
    // Fetch courses by instructorId
    useEffect(() => {
        const fetchCourses = async () => {
          try {
            const response = await dispatch(getAllCourses());
            setCourses(response.payload);
            setLoading(false);
          } catch (err) {
            setError('Failed to fetch courses');
            setLoading(false);
          }
        };
      
        if (user?._id) {
          setExam(prev => ({ ...prev, instructorId: user._id }));
          fetchCourses();
        }
      }, [user, dispatch]);
      
    // Handle course selection
    const handleCourseSelect = (courseId) => {
      setSelectedCourseId(courseId);
      setExam(prev => ({ ...prev, courseId }));
    };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExam(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (e, index) => {
    const { name, value } = e.target;
    const newQuestions = [...exam.questions];
    newQuestions[index][name] = value;
    setExam(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setExam(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', ''], correctAnswer: 0 }]
    }));
  };

  const removeQuestion = (index) => {
    const newQuestions = exam.questions.filter((_, i) => i !== index);
    setExam(prev => ({ ...prev, questions: newQuestions }));
  };

  const submitExam = async () => {
    try {
      await axiosInstance.post('/courses/exam', exam);
      alert('Exam created successfully!');
    } catch (err) {
      console.error('Error creating exam:', err);
    }
  };

  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const newQuestions = [...exam.questions];
    newQuestions[questionIndex].options[optionIndex] = e.target.value;
    setExam(prev => ({ ...prev, questions: newQuestions }));
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Create New Exam</h1>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Select Course</h2>
          {loading ? (
            <div className="text-center">Loading courses...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="flex pb-4 space-x-4 overflow-x-auto">
              {courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => handleCourseSelect(course._id)}
                  className={`flex-shrink-0 w-48 h-48 cursor-pointer rounded-lg border-2 ${
                    selectedCourseId === course._id ? 'border-blue-500' : 'border-gray-200'
                  } overflow-hidden transition-all duration-200 hover:border-blue-400`}
                >
                  <img
                    src={course.thumbnail.secure_url || '/default-course.jpg'}
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-sm text-white bg-black bg-opacity-50">
                    {course.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); submitExam(); }} className="space-y-8">
          {/* Exam Details Card */}
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="mb-6 text-xl font-semibold">Exam Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Exam Title</label>
                <input
                  type="text"
                  name="title"
                  value={exam.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Instructions</label>
                <textarea
                  name="instructions"
                  value={exam.instructions}
                  onChange={handleInputChange}
                  className="w-full h-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={exam.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Passing Score</label>
                  <input
                    type="number"
                    name="passingScore"
                    value={exam.passingScore}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {exam.questions.map((question, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700">Question {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Question Text</label>
                      <input
                        type="text"
                        name="question"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(e, index)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Options</label>
                      <div className="space-y-2">
                        {question.options.map((opt, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <span className="w-4 text-gray-500">{String.fromCharCode(65 + i)}.</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(e, index, i)}
                              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Correct Answer</label>
                      <select
                        name="correctAnswer"
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(e, index)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {question.options.map((_, i) => (
                          <option key={i} value={i}>
                            {String.fromCharCode(65 + i)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamForm;