import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@material-tailwind/react';
import { useDispatch } from 'react-redux';
import { createQuiz, updateQuiz } from '../../../../Redux/quizeSlice';

const QuizModal = ({ isOpen, onClose, sectionId, courseId, quizData, mode }) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      questions: [{ question: '', options: ['', '', '', ''], correctOption: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  useEffect(() => {
    if (quizData) {
      reset({
        title: quizData.title,
        questions: quizData.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctOption: q.correctOption.toString()
        }))
      });
    } else {
      reset({
        title: '',
        questions: [{ question: '', options: ['', '', '', ''], correctOption: '' }]
      });
    }
  }, [quizData, reset]);

  const onSubmit = async (data) => {
    try {
      const actionPayload = {
        courseId,
        sectionId,
        quizData: {
          ...data,
          questions: data.questions.map(q => ({
            ...q,
            correctOption: parseInt(q.correctOption)
          }))
        }
      };

      if (mode === 'edit' && quizData?._id) {
        actionPayload.quizId = quizData._id;
        await dispatch(updateQuiz(actionPayload));
      } else {
        await dispatch(createQuiz(actionPayload));
      }

      onClose();
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    isOpen && (
      <div onClick={handleBackgroundClick} className="fixed inset-0 p-3 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="my-10 p-5 w-11/12 max-w-[700px] rounded-lg border border-gray-300 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{mode === 'edit' ? 'Edit Quiz' : 'Create Quiz'}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">Quiz Title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
                placeholder="Enter quiz title"
              />
              {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Questions</h3>
              {fields.map((item, index) => (
                <div key={item.id} className="border p-4 rounded-lg mb-4 bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300">Question</label>
                    <input
                      {...register(`questions.${index}.question`, { required: 'Question is required' })}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-600 dark:text-white"
                      placeholder={`Question ${index + 1}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {item.options.map((_, optIndex) => (
                      <div key={optIndex}>
                        <label className="block font-medium text-gray-700 dark:text-gray-300">Option {optIndex + 1}</label>
                        <input
                          {...register(`questions.${index}.options.${optIndex}`, { required: 'Option is required' })}
                          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-600 dark:text-white"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-2">
                    <label className="block font-medium text-gray-700 dark:text-gray-300">Correct Option (Index)</label>
                    <input
                      {...register(`questions.${index}.correctOption`, {
                        required: 'Correct option is required',
                        validate: value => value >= 0 && value < 4 || 'Index must be 0-3'
                      })}
                      type="number"
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-600 dark:text-white"
                      placeholder="Correct Option Index (0-3)"
                    />
                  </div>

                  <Button
                    color="red"
                    onClick={() => remove(index)}
                    className="mt-3"
                  >
                    Remove Question
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => append({ question: '', options: ['', '', '', ''], correctOption: '' })}
                className="bg-blue-500 dark:bg-blue-700 text-white"
              >
                Add Question
              </Button>
              <Button type="submit" color="green" className="bg-green-500 dark:bg-green-700 text-white">
                {mode === 'edit' ? 'Update Quiz' : 'Create Quiz'}
              </Button>
            </div>
          </form>

          <div className="flex justify-end mt-4">
            <Button color="blue" onClick={onClose} className="bg-blue-500 dark:bg-blue-700 text-white">Close</Button>
          </div>
        </div>
      </div>
    )
  );
};

export default QuizModal;
