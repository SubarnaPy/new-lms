import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  createSection,
  updateSection,
} from '../../../../Redux/courseSlice';
import {
  setCourse,
  setEditCourse,
  setStep,
} from '../../../../Redux/courseSlice';
import NestedView from './NestedView';
import { Button } from '@material-tailwind/react';
import { AiOutlinePlusCircle } from 'react-icons/ai';

const CourseBuilderForm = () => {
  const { token } = useSelector((state) => state.auth);
  const [editSectionName, setEditSectionName] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { course } = useSelector((state) => state.course);

  const gonext = async () => {
    if (course.courseContent.length > 0) {
      if (
        course.courseContent.some((section) => section.subSection.length > 0)
      ) {
        await dispatch(setStep(3));
      } else {
        toast.error('Please add at least one lesson to each section');
      }
    } else {
      toast.error('Please add at least one section to continue');
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    let result = null;
    setLoading(true);
    if (editSectionName) {
      result = await dispatch(
        updateSection({
          title: data.sectionName,
          courseId: course._id,
          sectionId: editSectionName,
        })
      );
    } else {
      result = await dispatch(
        createSection({
          title: data.sectionName,
          courseId: course._id,
        })
      );
    }
    if (result) {
      dispatch(setCourse(result.payload));
      setValue('sectionName', '');
      setEditSectionName(false);
    }
    setLoading(false);
  };

  const handelChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      setEditSectionName(false);
      setValue('sectionName', '');
      return;
    }
    setEditSectionName(sectionId);
    setValue('sectionName', sectionName);
  };

  return (
    <div className="p-8 space-y-8 bg-white border border-gray-200 rounded-lg shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Course Builder
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="sectionName">
            Section Name <span className="text-red-500">*</span>
          </label>
          <input
            id="sectionName"
            placeholder="Add a section to build your course"
            name="sectionName"
            className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            {...register('sectionName', { required: true })}
          />
          {errors.sectionName && (
            <p className="mt-1 text-sm text-red-500">This field is required</p>
          )}
        </div>
        <div className="flex items-center gap-x-4">
          <button
            type="submit"
            className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <AiOutlinePlusCircle className="w-5 h-5 mr-2" />
            {editSectionName ? 'Update Section' : 'Create Section'}
          </button>
          {editSectionName && (
            <Button
              onClick={() => {
                setEditSectionName(false);
                setValue('sectionName', '');
              }}
              type="button"
              className="text-sm font-medium text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </form>

      {course?.courseContent?.length > 0 && (
        <NestedView handelChangeEditSectionName={handelChangeEditSectionName} />
      )}

      <div className="flex justify-end gap-x-4">
        <button
          onClick={() => {
            dispatch(setEditCourse(true));
            dispatch(setStep(1));
          }}
          className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-500 dark:hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={gonext}
          className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Next
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CourseBuilderForm;