import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../../Helpers/axiosInstance';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [isEditing, setIsEditing] = useState(null);  // Track the exam being edited
  const [examToEdit, setExamToEdit] = useState({
    title: '',
    instructions: '',
    duration: 0,
    passingScore: 0,
    questions: [{ question: '', options: ['', ''], correctAnswer: 0 }],
  });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axiosInstance.get('/courses/exams');
        setExams(response.data);
      } catch (err) {
        console.error('Error fetching exams:', err);
      }
    };
    fetchExams();
  }, []);

  const handleEditClick = (exam) => {
    setIsEditing(exam._id);  // Set the exam being edited
    setExamToEdit({ ...exam });  // Set the current exam data for editing
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamToEdit((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (e, index) => {
    const { name, value } = e.target;
    const newQuestions = [...examToEdit.questions];
    newQuestions[index][name] = value;
    setExamToEdit((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleUpdateExam = async () => {
    try {
      await axiosInstance.put(`/courses/exam/${isEditing}`, examToEdit);
      setIsEditing(null);  // Stop editing
      alert('Exam updated successfully!');
      // Optionally, refresh the exams list
      const response = await axiosInstance.get('/courses/exams');
      setExams(response.data);
    } catch (err) {
      console.error('Error updating exam:', err);
    }
  };

  return (
    <div>
      <h1>Exams List</h1>
      <ul>
        {exams.map(exam => (
          <li key={exam._id}>
            <div>
              <span>{exam.title}</span>
              <button onClick={() => handleEditClick(exam)}>Edit</button>
            </div>
            {isEditing === exam._id && (
              <div>
                <h3>Edit Exam</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateExam(); }}>
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={examToEdit.title}
                    onChange={handleInputChange}
                  />
                  <br />
                  <label>Instructions</label>
                  <textarea
                    name="instructions"
                    value={examToEdit.instructions}
                    onChange={handleInputChange}
                  />
                  <br />
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={examToEdit.duration}
                    onChange={handleInputChange}
                  />
                  <br />
                  <label>Passing Score</label>
                  <input
                    type="number"
                    name="passingScore"
                    value={examToEdit.passingScore}
                    onChange={handleInputChange}
                  />
                  <br />
                  <h3>Questions</h3>
                  {examToEdit.questions.map((question, index) => (
                    <div key={index}>
                      <label>Question</label>
                      <input
                        type="text"
                        name="question"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(e, index)}
                      />
                      <br />
                      <label>Options</label>
                      {question.options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          name="options"
                          value={opt}
                          onChange={(e) => handleQuestionChange(e, index)}
                        />
                      ))}
                      <br />
                      <label>Correct Answer (index)</label>
                      <input
                        type="number"
                        name="correctAnswer"
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(e, index)}
                      />
                      <br />
                    </div>
                  ))}
                  <button type="submit">Update Exam</button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExamList;
