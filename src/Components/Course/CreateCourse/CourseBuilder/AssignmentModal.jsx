import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAssignment, updateAssignment } from '../../../../Redux/assignmentSlice'; 
import { FaTimes } from 'react-icons/fa';
import { setCourse } from '../../../../Redux/courseSlice';

const AssignmentModal = ({ isOpen, onClose, sectionId, courseId, modalData, setModalData, edit = false,add = false, view = false, }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  console.log(edit)

  // State for form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);

  // Pre-fill form data in edit mode
  useEffect(() => {
    if (edit && modalData) {
      console.log('097899876678',modalData);
      setTitle(modalData.title || '');
      setDescription(modalData.description || '');
      setDueDate(modalData.dueDate || '');
      setFile(null);  // Keep file upload optional during editing
    } else {
      // Reset fields in create mode
      setTitle('');
      setDescription('');
      setDueDate('');
      setFile(null);
    }
  }, [modalData, edit]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('dueDate', dueDate);
    if (file) formData.append('file', file);
    formData.append('courseId', courseId);
    formData.append('sectionId', sectionId);

    let result;
    if (edit) {
      // Add assignment ID for editing
      console.log(...formData);
      formData.append('id', modalData?._id);
      result = await dispatch(updateAssignment(formData));
    } else {
      console.log(...formData);
      result = await dispatch(createAssignment(formData));
    }

    if (result.payload.success) {
      console.log(result.payload);
      const updatedCourse = result.payload.data;
      dispatch(setCourse(updatedCourse));
      setModalData(null);  // Clear modal data after submission
    }

    onClose();
  };

  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleBackgroundClick} className="fixed inset-0 p-3 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="my-10 p-5 w-11/12 max-w-[700px] rounded-lg border border-gray-300 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 transition duration-300">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {edit ? 'Edit Assignment' : 'Create Assignment'}
          </h2>
          <FaTimes
            className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-red-500"
            onClick={onClose}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-md p-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              placeholder="Enter assignment title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full border rounded-md p-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              placeholder="Enter assignment description"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border rounded-md p-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {edit ? 'Replace File (Optional)' : 'Upload File'}
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border rounded-md p-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              accept=".pdf,.doc,.docx,.zip"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {edit ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;
