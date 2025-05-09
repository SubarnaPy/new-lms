import React, { useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../../Helpers/axiosInstance';

const ExamForm = () => {
  const [exam, setExam] = useState({
    title: '',
    instructions: '',
    duration: 0,
    passingScore: 0,
    questions: [{ question: '', options: ['', ''], correctAnswer: 0 }]
  });

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

  return (
    <div>
      <h1>Create Exam</h1>
      <form onSubmit={(e) => { e.preventDefault(); submitExam(); }}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={exam.title}
          onChange={handleInputChange}
          required
        />
        <br />
        <label>Instructions</label>
        <textarea
          name="instructions"
          value={exam.instructions}
          onChange={handleInputChange}
        />
        <br />
        <label>Duration (minutes)</label>
        <input
          type="number"
          name="duration"
          value={exam.duration}
          onChange={handleInputChange}
          required
        />
        <br />
        <label>Passing Score</label>
        <input
          type="number"
          name="passingScore"
          value={exam.passingScore}
          onChange={handleInputChange}
          required
        />
        <br />
        <h3>Questions</h3>
        {exam.questions.map((question, index) => (
          <div key={index}>
            <label>Question</label>
            <input
              type="text"
              name="question"
              value={question.question}
              onChange={(e) => handleQuestionChange(e, index)}
              required
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
                required
              />
            ))}
            <br />
            <label>Correct Answer (index)</label>
            <input
              type="number"
              name="correctAnswer"
              value={question.correctAnswer}
              onChange={(e) => handleQuestionChange(e, index)}
              required
            />
            <br />
            <button type="button" onClick={() => removeQuestion(index)}>Remove Question</button>
          </div>
        ))}
        <button type="button" onClick={addQuestion}>Add Question</button>
        <br />
        <button type="submit">Create Exam</button>
      </form>
    </div>
  );
};

export default ExamForm;
