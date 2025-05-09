import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../Helpers/axiosInstance';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { FiChevronDown, FiChevronRight, FiEdit, FiPlus, FiTrash, FiCheckCircle } from 'react-icons/fi';

const ExamList = () => {
    const user = useSelector((state) => state.profile.data);
    const [exams, setExams] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [expandedExams, setExpandedExams] = useState([]);
    const [expandedQuestions, setExpandedQuestions] = useState([]);
    const [examToEdit, setExamToEdit] = useState({
        title: '',
        instructions: '',
        duration: 0,
        passingScore: 0,
        questions: [{ question: '', options: ['', ''], correctAnswer: 0 }]
    });

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await axiosInstance.get(`/courses/exams/${user._id}`);
                setExams(res.data);
            } catch (err) {
                console.error('Failed to fetch exams:', err);
            }
        };
        fetchExams();
    }, [user._id]);

    const toggleExam = (examId) => {
        setExpandedExams(prev => 
            prev.includes(examId)
                ? prev.filter(id => id !== examId)
                : [...prev, examId]
        );
    };

    const toggleQuestion = (qIndex) => {
        setExpandedQuestions(prev => 
            prev.includes(qIndex)
                ? prev.filter(index => index !== qIndex)
                : [...prev, qIndex]
        );
    };

    const handleEditClick = (exam) => {
        setIsEditing(exam._id);
        setExamToEdit({
            ...exam,
            questions: exam.questions.map(q => ({
                ...q,
                options: [...q.options]
            }))
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExamToEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (e, qIndex) => {
        const { name, value } = e.target;
        const updatedQuestions = [...examToEdit.questions];
        updatedQuestions[qIndex][name] = value;
        setExamToEdit(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleOptionChange = (e, qIndex, oIndex) => {
        const updatedQuestions = [...examToEdit.questions];
        updatedQuestions[qIndex].options[oIndex] = e.target.value;
        setExamToEdit(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleAddQuestion = () => {
        setExamToEdit(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                { question: '', options: ['', ''], correctAnswer: 0 }
            ]
        }));
    };

    const handleAddOption = (qIndex) => {
        const updatedQuestions = [...examToEdit.questions];
        updatedQuestions[qIndex].options.push('');
        setExamToEdit(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleRemoveQuestion = (qIndex) => {
        const updatedQuestions = examToEdit.questions.filter((_, index) => index !== qIndex);
        setExamToEdit(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleRemoveOption = (qIndex, oIndex) => {
        const updatedQuestions = [...examToEdit.questions];
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, index) => index !== oIndex);
        setExamToEdit(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleUpdateExam = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/courses/exam/${isEditing}`, examToEdit);
            const res = await axiosInstance.get(`/courses/exams/${user._id}`);
            setExams(res.data);
            setIsEditing(null);
            
            Swal.fire({
                icon: 'success',
                title: 'Exam Updated!',
                text: 'Your exam has been successfully updated.',
                timer: 2000,
                showConfirmButton: false,
                background: '#020817',
                color: '#ffffff'
            });
        } catch (err) {
            console.error('Error updating exam:', err);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update exam. Please try again.',
                background: '#020817',
                color: '#ffffff'
            });
        }
    };

    return (
        <div className="container p-4 mx-auto dark:bg-[#020817] min-h-screen">
            <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">
                Exam Management
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({exams.length} exams found)
                </span>
            </h1>

            <div className="space-y-4">
                {exams.map(exam => (
                    <div key={exam._id} className="relative p-6 transition-all duration-200 border shadow-lg group rounded-xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div 
                                className="flex items-center cursor-pointer"
                                onClick={() => toggleExam(exam._id)}
                            >
                                <span className="mr-2 text-xl font-semibold dark:text-white">
                                    {exam.title}
                                </span>
                                {expandedExams.includes(exam._id) ? (
                                    <FiChevronDown className="text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <FiChevronRight className="text-gray-600 dark:text-gray-300" />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleEditClick(exam)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                                >
                                    <FiEdit className="inline-block" />
                                    Edit Exam
                                </button>
                            </div>
                        </div>

                        {expandedExams.includes(exam._id) && (
                            <div className="p-4 mt-4 bg-gray-50 rounded-xl dark:bg-gray-700">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                                            Duration
                                        </label>
                                        <p className="mt-1 text-gray-800 dark:text-gray-200">
                                            {exam.duration} minutes
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                                            Passing Score
                                        </label>
                                        <p className="mt-1 text-gray-800 dark:text-gray-200">
                                            {exam.passingScore} points
                                        </p>
                                    </div>
                                </div>

                                <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                                    Exam Questions ({exam.questions.length})
                                </h4>
                                
                                {exam.questions.map((question, qIndex) => (
                                    <div key={qIndex} className="p-4 mb-4 bg-white rounded-lg shadow-sm dark:bg-gray-600">
                                        <div 
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleQuestion(qIndex)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                                    Question {qIndex + 1}
                                                </span>
                                                {expandedQuestions.includes(qIndex) ? (
                                                    <FiChevronDown className="text-gray-500 dark:text-gray-300" />
                                                ) : (
                                                    <FiChevronRight className="text-gray-500 dark:text-gray-300" />
                                                )}
                                            </div>
                                        </div>

                                        {expandedQuestions.includes(qIndex) && (
                                            <div className="mt-4 space-y-3">
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    {question.question}
                                                </p>
                                                
                                                <div className="space-y-2">
                                                    {question.options.map((option, oIndex) => (
                                                        <div 
                                                            key={oIndex}
                                                            className={`p-3 rounded-md border ${
                                                                oIndex === question.correctAnswer 
                                                                    ? 'border-green-200 bg-green-50 dark:bg-green-800/20 dark:border-green-700'
                                                                    : 'border-gray-200 dark:border-gray-500'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {oIndex === question.correctAnswer && (
                                                                    <FiCheckCircle className="text-green-500 dark:text-green-400" />
                                                                )}
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {option}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isEditing === exam._id && (
                            <div className="p-6 mt-6 border-t-2 dark:border-gray-700">
                                <form onSubmit={handleUpdateExam} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Exam Title
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={examToEdit.title}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Duration (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                name="duration"
                                                value={examToEdit.duration}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Instructions
                                            </label>
                                            <textarea
                                                name="instructions"
                                                value={examToEdit.instructions}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                                Questions ({examToEdit.questions.length})
                                            </h3>
                                        </div>

                                        {examToEdit.questions.map((question, qIndex) => (
                                            <div key={qIndex} className="p-6 bg-white shadow-sm dark:bg-gray-700 rounded-xl">
                                                <div 
                                                    className="flex items-center justify-between cursor-pointer"
                                                    onClick={() => toggleQuestion(qIndex)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            Question {qIndex + 1}
                                                        </span>
                                                        {expandedQuestions.includes(qIndex) ? (
                                                            <FiChevronDown className="text-gray-500 dark:text-gray-300" />
                                                        ) : (
                                                            <FiChevronRight className="text-gray-500 dark:text-gray-300" />
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveQuestion(qIndex)}
                                                        className="text-red-500 hover:text-red-700 dark:text-red-400"
                                                    >
                                                        <FiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {expandedQuestions.includes(qIndex) && (
                                                    <div className="mt-4 space-y-4">
                                                        <div>
                                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Question Text
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="question"
                                                                value={question.question}
                                                                onChange={(e) => handleQuestionChange(e, qIndex)}
                                                                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    Options ({question.options.length})
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddOption(qIndex)}
                                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                                >
                                                                    <FiPlus className="w-4 h-4" />
                                                                    Add Option
                                                                </button>
                                                            </div>
                                                            
                                                            {question.options.map((option, oIndex) => (
                                                                <div key={oIndex} className="flex items-center gap-3">
                                                                    <input
                                                                        type="text"
                                                                        value={option}
                                                                        onChange={(e) => handleOptionChange(e, qIndex, oIndex)}
                                                                        className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                                        required
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                                        className="text-red-500 hover:text-red-700 dark:text-red-400"
                                                                    >
                                                                        <FiTrash className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div>
                                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Correct Answer Index
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="correctAnswer"
                                                                value={question.correctAnswer}
                                                                onChange={(e) => handleQuestionChange(e, qIndex)}
                                                                className="w-24 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                                min="0"
                                                                max={question.options.length - 1}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Sticky Add Question Button */}
                                        <div className="sticky bottom-0 z-10 pt-4 bg-white dark:bg-gray-800">
                                            <button
                                                type="button"
                                                onClick={handleAddQuestion}
                                                className="w-full py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                            >
                                                <FiPlus className="inline-block w-5 h-5 mr-2" />
                                                Add New Question
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(null)}
                                            className="px-6 py-3 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                        >
                                            <FiCheckCircle className="w-5 h-5" />
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamList;