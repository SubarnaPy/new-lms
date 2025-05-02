import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuiz } from "../../../Redux/quizeSlice";
import { Spinner, Button, Radio, Dialog, DialogBody, DialogFooter } from "@material-tailwind/react";
import { CheckCircleIcon, ClockIcon, TrophyIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const QuizPage = () => {
  const { courseId, sectionId, quizId } = useParams();
  const dispatch = useDispatch();
  const { currentQuiz, loading, error } = useSelector((state) => state.courseQuize);
  const [answers, setAnswers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      await dispatch(fetchQuiz({ courseId, sectionId, quizId }));
      setAnswers({});
    };
    loadQuiz();

    const handleScroll = () => setScrollPosition(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch, courseId, sectionId, quizId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("Submitted Answers:", answers);
      setIsSubmitting(false);
      setShowConfirm(false);
      alert("Quiz submitted successfully!");
    }, 1500);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = currentQuiz?.questions?.length || 0;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Spinner className="w-12 h-12 text-blue-500" />
        <p className="text-gray-600 dark:text-gray-400">Loading Quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="p-4 bg-red-100 rounded-full dark:bg-red-900/20">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">{error}</h2>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="p-4 bg-yellow-100 rounded-full dark:bg-yellow-900/20">
          <ClockIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Quiz Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Floating Header */}
      {scrollPosition > 100 && (
        <div className="fixed top-0 left-0 right-0 z-50 shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-4xl px-4 py-3 mx-auto">
            <h2 className="text-lg font-semibold truncate dark:text-white">{currentQuiz.title}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrophyIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium dark:text-gray-300">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-full transition-all duration-300 bg-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl pt-8 mx-auto sm:px-6 lg:px-8">
        <div className="p-6 bg-white shadow-lg rounded-2xl dark:bg-gray-800">
          {/* Quiz Header */}
          <div className="pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentQuiz.title}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {currentQuiz.description}
                </p>
              </div>
              <div className="flex-shrink-0 p-4 bg-blue-50 rounded-xl dark:bg-gray-700">
                <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="block mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {currentQuiz.duration} mins
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Progress: {progress}%
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {totalQuestions} Questions
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-full transition-all duration-300 bg-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-8">
            {currentQuiz.questions?.map((question, index) => (
              <div 
                key={question._id}
                className={`p-6 rounded-xl transition-all duration-200 ${
                  !answers[question._id] 
                    ? "bg-orange-50 border border-orange-200 dark:bg-gray-700/50 dark:border-orange-500/30"
                    : "bg-white dark:bg-gray-700/30"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-blue-500 rounded-full">
                      {index + 1}
                    </div>
                    {question.points && (
                      <span className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {question.points} pts
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {question.question}
                    </h3>
                    <div className="mt-4 space-y-2">
                      {question.options.map((option, i) => (
                        <label
                          key={i}
                          className={`flex items-center p-4 space-x-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                            answers[question._id] === option
                              ? "border-blue-500 bg-blue-50 shadow-sm dark:bg-gray-700"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          <Radio
                            name={`question-${question._id}`}
                            value={option}
                            onChange={() => handleAnswerChange(question._id, option)}
                            checked={answers[question._id] === option}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-600"
                          />
                          <span className="text-gray-700 dark:text-gray-200">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-right">
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              className="px-8 py-3 text-base font-medium transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Spinner className="w-4 h-4" />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Quiz"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} handler={() => setShowConfirm(false)}>
        <DialogBody className="pt-8 pb-4 text-center">
          <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Submit Quiz?
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            You've answered {answeredCount} out of {totalQuestions} questions.
            {answeredCount < totalQuestions && (
              <span className="block mt-1 text-red-500">
                {totalQuestions - answeredCount} questions remain unanswered.
              </span>
            )}
          </p>
        </DialogBody>
        <DialogFooter className="justify-center gap-4 pb-6">
          <Button
            variant="text"
            color="gray"
            onClick={() => setShowConfirm(false)}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="green"
            className="px-6 bg-green-500 hover:bg-green-600"
          >
            Confirm Submit
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default QuizPage;