import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuiz } from "../../../Redux/quizeSlice";
import { Spinner, Button, Radio } from "@material-tailwind/react";

const QuizPage = () => {
  const { courseId, sectionId, quizId } = useParams();
  const dispatch = useDispatch();
  const { currentQuiz, loading, error } = useSelector((state) => state.quiz);

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    dispatch(fetchQuiz({ courseId, sectionId, quizId }));
  }, [dispatch, courseId, sectionId, quizId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    console.log("Submitted Answers:", answers);
    alert("Quiz submitted!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner color="blue" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!currentQuiz) {
    return <div className="text-center mt-10">Quiz not found!</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{currentQuiz.title}</h1>
      <p className="text-lg text-gray-600 mb-4">{currentQuiz.description}</p>

      <div className="bg-gray-100 p-4 rounded-md">
        {currentQuiz.questions.map((question, index) => (
          <div key={question._id} className="mb-6">
            <h2 className="text-xl font-semibold">{`Q${index + 1}. ${question.text}`}</h2>
            {question.options.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <Radio
                  name={`question-${question._id}`}
                  value={option}
                  onChange={() => handleAnswerChange(question._id, option)}
                  checked={answers[question._id] === option}
                  label={option}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <Button color="green" className="mt-6" onClick={handleSubmit}>
        Submit Quiz
      </Button>
    </div>
  );
};

export default QuizPage;
