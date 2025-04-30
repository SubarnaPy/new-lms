
import React, { useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { RxDropdownMenu } from 'react-icons/rx';
import { useDispatch, useSelector } from 'react-redux';
import { deleteSection, deleteSubSection } from '../../../../Redux/courseSlice';
import { setCourse } from '../../../../Redux/courseSlice';
import ConfirmationModal from '../../../../Components/Modal/ConfirmationModal';
import SubSectionModal from './SubSectionModal';
import QuizModal from './QuizeModal';
import AssignmentModal from './AssignmentModal';  // ✅ Import AssignmentModal
import { Button } from '@material-tailwind/react';
import { VscEdit } from 'react-icons/vsc';
import { IoAdd } from 'react-icons/io5';
import { BiBook, BiBrain, BiTask, BiMenu } from 'react-icons/bi';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { deleteAssignment } from '../../../../Redux/assignmentSlice';


const NestedView = ({ handelChangeEditSectionName }) => {
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [addSubSection, setAddSubSection] = useState(null);
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [quizModal, setQuizModal] = useState(null);
  const [assignmentModal, setAssignmentModal] = useState(null);  // ✅ State for Assignment Modal

  const [addQuiz, setAddQuiz] = useState(null);
const [viewQuiz, setViewQuiz] = useState(null);
const [editQuiz, setEditQuiz] = useState(null);

const [addAssignment, setAddAssignment] = useState(null);
const [viewAssignment, setViewAssignment] = useState(null);
const [editAssignment, setEditAssignment] = useState(null);


  const handleDeleteSection = async (sectionId) => {
    const courseId = course._id;
    const result = await dispatch(deleteSection({ sectionId, courseId }));

    if (result.meta.rejectedWithValue) {
      console.error('Deletion failed:', result.payload || 'Unknown error');
      return;
    }

    if (result.payload) {
      await dispatch(setCourse(result.payload));
    }

    setConfirmationModal(null);
  };

 

 
   const  handeldeleteAssignment=async(assignmentId, sectionId)=>{
    const courseId = course._id;
    console.log(assignmentId)
    const result = await dispatch(
      deleteAssignment({ assignmentId, sectionId ,courseId})
    )
    if (result.payload.success) {
      console.log(result.payload)
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId ? result : section
      );

      const updatedCourse = { ...course, courseContent: updatedCourseContent };
      dispatch(setCourse(result.payload.data));
    }

    setConfirmationModal(null);
  };

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const courseId = course._id;
    const result = await dispatch(
      deleteSubSection({ subSectionId, sectionId, token, courseId })
    );

    if (result.payload != null || undefined) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId ? result : section
      );

      const updatedCourse = { ...course, courseContent: updatedCourseContent };
      dispatch(setCourse(result.payload));
    }

    setConfirmationModal(null);
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-lg text-slate-950 dark:bg-gray-800 dark:text-gray-200"
        id="nestedViewContainer"
      >
        {course?.courseContent?.map((section) => (
          <details key={section._id} open>
            {/* Section Header */}
            <summary className="flex items-center justify-between py-3 border-b-2 cursor-pointer border-b-black dark:border-b-gray-600">
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu className="text-2xl text-red-900 dark:text-red-400" />
                <p className="font-semibold text-slate-950 dark:text-gray-100">
                  {section.title}
                </p>
              </div>
              <div className="flex items-center gap-x-3">
                <button
                  onClick={() => {
                    handelChangeEditSectionName(section._id, section.sectionName);
                  }}
                >
                  <VscEdit className="text-lg text-slate-950 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400" />
                </button>
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: 'Delete this Section?',
                      text2: 'All the lectures in this section will be deleted',
                      btn1Text: 'Delete',
                      btn2Text: 'Cancel',
                      btn1Handler: () => handleDeleteSection(section._id),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                >
                  <RiDeleteBin6Line className="text-xl text-slate-950 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" />
                </button>
                <span className="font-medium text-slate-950 dark:text-gray-300">|</span>
                <AiFillCaretDown className="text-xl text-slate-950 dark:text-gray-300" />
              </div>
            </summary>

            {/* Sub-Sections */}
            {/* Sub-Sections, Quizzes, and Assignments */}
<div className="px-6 pb-4">
  {/* Render Subsections */}
  {/* {section?.subSection?.map((data) => (
    <div
      key={data?._id}
      onClick={() => setViewSubSection(data)}
      className="flex items-center justify-between py-3 border-b-2 border-black cursor-pointer gap-x-3 dark:border-b-gray-600"
    >
      <div className="flex items-center gap-x-3">
        <RxDropdownMenu className="text-2xl text-slate-950 dark:text-gray-300" />
        <p className="font-semibold text-slate-950 dark:text-gray-100">{data.title}</p>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-x-3"
      >
        <button onClick={() => setEditSubSection({ ...data, sectionId: section._id })}>
          <MdEdit className="text-xl text-slate-950 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400" />
        </button>
        <button
          onClick={() =>
            setConfirmationModal({
              text1: 'Delete this Sub-Section?',
              text2: 'This lecture will be deleted',
              btn1Text: 'Delete',
              btn2Text: 'Cancel',
              btn1Handler: () => handleDeleteSubSection(data._id, section._id),
              btn2Handler: () => setConfirmationModal(null),
            })
          }
        >
          <RiDeleteBin6Line className="text-xl text-slate-950 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" />
        </button>
      </div>
    </div>
  ))} */}

  {/* Render Quizzes */}
  {/* {section?.quizzes?.map((quiz) => (
    <div
      key={quiz?._id}
      className="flex items-center justify-between py-3 border-b-2 border-black cursor-pointer gap-x-3 dark:border-b-gray-600"
    >
      <div className="flex items-center gap-x-3">
        <RxDropdownMenu className="text-2xl text-blue-600 dark:text-blue-400" />
        <p className="font-semibold text-blue-600 dark:text-blue-400">{quiz.title} (Quiz)</p>
      </div>
      <div className="flex items-center gap-x-3">
        <button onClick={() => setQuizModal(quiz._id)}>
          <MdEdit className="text-xl text-blue-600 dark:text-blue-400 hover:text-indigo-500 dark:hover:text-indigo-400" />
        </button>
      </div>
    </div>
  ))} */}

  {/* Render Assignments */}
  {/* {section?.assignments?.map((assignment) => (
    <div
      key={assignment?._id}
      className="flex items-center justify-between py-3 border-b-2 border-black cursor-pointer gap-x-3 dark:border-b-gray-600"
    >
      <div className="flex items-center gap-x-3">
        <RxDropdownMenu className="text-2xl text-green-600 dark:text-green-400" />
        <p className="font-semibold text-green-600 dark:text-green-400">{assignment.title} (Assignment)</p>
      </div>
      <div className="flex items-center gap-x-3">
        <button onClick={() => setAssignmentModal(assignment._id)}>
          <MdEdit className="text-xl text-green-600 dark:text-green-400 hover:text-indigo-500 dark:hover:text-indigo-400" />
        </button>
      </div>
    </div>
  ))} */}

  {/* Add New Lecture, Quiz, and Assignment Buttons */}
  <div className="px-6 pb-4">
              {/* Render Subsections */}
              {section?.subSection?.map((data) => (
                <div
                  key={data?._id}
                  onClick={() => setViewSubSection(data)}
                  className="flex items-center justify-between py-3 border-b-2 border-black cursor-pointer gap-x-3 dark:border-b-gray-600"
                >
                  <div className="flex items-center gap-x-3">
                    <BiBook className="text-2xl text-slate-950 dark:text-gray-300" />
                    <p className="font-semibold text-slate-950 dark:text-gray-100">{data.title}</p>
                  </div>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-x-3"
                  >
                    <button onClick={() => setEditSubSection({ ...data, sectionId: section._id })}>
                      <FiEdit className="text-xl text-slate-950 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: 'Delete this Sub-Section?',
                          text2: 'This lecture will be deleted',
                          btn1Text: 'Delete',
                          btn2Text: 'Cancel',
                          btn1Handler: () => handleDeleteSubSection(data._id, section._id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                    >
                      <FiTrash2 className="text-xl text-slate-950 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Render Quizzes */}
              {section?.quizzes?.map((quiz) => (
                <div
                  key={quiz?._id}
                  onClick={() => setViewSubSection(quiz)}
                  className="flex items-center justify-between py-3 border-b-2 border-black cursor-pointer gap-x-3 dark:border-b-gray-600"
                >
                  <div className="flex items-center gap-x-3">
                    <BiBrain className="text-2xl text-blue-600 dark:text-blue-400" />
                    <p className="font-semibold text-blue-600 dark:text-blue-400">{quiz.title} (Quiz)</p>
                  </div>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-x-3"
                  >
                    <button onClick={() => setEditSubSection({ ...quiz, sectionId: section._id })}>
                      <FiEdit className="text-xl text-slate-950 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: 'Delete this Sub-Section?',
                          text2: 'This lecture will be deleted',
                          btn1Text: 'Delete',
                          btn2Text: 'Cancel',
                          btn1Handler: () => handleDeleteSubSection(quiz._id, section._id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                    >
                      <FiTrash2 className="text-xl text-slate-950 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" />
                    </button>
                  </div>
                  
                </div>
              ))}

              {/* Render Assignments */}
              {section?.assignments?.map((assignment) => (
                <div
                  key={assignment?._id}
                  onClick={() => setViewSubSection(assignment)}
                  className="flex items-center justify-between py-3 border-b-2 border-black cursor-pointer gap-x-3 dark:border-b-gray-600"
                >
                  <div className="flex items-center gap-x-3">
                    <BiTask className="text-2xl text-green-600 dark:text-green-400" />
                    <p className="font-semibold text-green-600 dark:text-green-400">{assignment.title} (Assignment)</p>
                  </div>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-x-3"
                  >
                    <button onClick={() => {
  setEditAssignment({ ...assignment, sectionId: section._id });
  setAssignmentModal(true);  // Ensure the modal opens on edit
}}>
                      <FiEdit className="text-xl text-slate-950 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: 'Delete this Sub-Section?',
                          text2: 'This lecture will be deleted',
                          btn1Text: 'Delete',
                          btn2Text: 'Cancel',
                          btn1Handler: () => handeldeleteAssignment(assignment._id, section._id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                    >
                      <FiTrash2 className="text-xl text-slate-950 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Buttons */}
              <div className="flex gap-x-4 mt-4">
                <Button
                  onClick={() => setAddSubSection(section._id)}
                  className="flex items-center text-black bg-slate-200 gap-x-2 hover:bg-slate-300"
                >
                  <IoAdd className="text-lg" />
                  <p>Add Lecture</p>
                </Button>

                <Button
                  onClick={() => setQuizModal(section._id)}
                  className="flex items-center text-white bg-blue-500 gap-x-2 hover:bg-blue-600"
                >
                  <IoAdd className="text-lg" />
                  <p>Add Quiz</p>
                </Button>

                <Button
                  onClick={() => setAssignmentModal(section._id)}
                  className="flex items-center text-white bg-green-500 gap-x-2 hover:bg-green-600"
                >
                  <IoAdd className="text-lg" />
                  <p>Add Assignment</p>
                </Button>
              </div>
            </div>
</div>

          </details>
        ))}
      </div>

      {/* Modals */}
      {addSubSection && (
        <SubSectionModal
        onClose={() => setAddSubSection(null)}
          modalData={addSubSection}
          setModalData={setAddSubSection}
          add={true}
        />
      )}
      {viewSubSection && (
        <SubSectionModal
        onClose={() => setAssignmentModal(null)}
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      )}
      {editSubSection && (
        <SubSectionModal
        onClose={() => setEditSubSection(null)}
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
        />
      )}
      {quizModal && (
        <QuizModal
          isOpen={!!quizModal}
          onClose={() => setQuizModal(null)}
          sectionId={quizModal}
          courseId={course._id}
        />
      )}
      {assignmentModal && (
        <AssignmentModal
          isOpen={!!assignmentModal}
          onClose={() => setAssignmentModal(null)}
          setModalData={setAssignmentModal}
          sectionId={assignmentModal}
          courseId={course._id}
          add={true}
        
        />
      )}
      <button onClick={() => {
  setEditAssignment({ ...assignment, sectionId: section._id });
  setAssignmentModal(true);  // Ensure the modal opens on edit
}}>
  <FiEdit className="text-xl text-slate-950 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400" />
</button>

{editAssignment && (
  <AssignmentModal
    isOpen={!!assignmentModal}
    onClose={() => {
      setAssignmentModal(false);   // Close the modal properly
      setEditAssignment(null);     // Clear the edit data after closing
    }}
    sectionId={editAssignment?.sectionId}  // Pass sectionId from the assignment data
    courseId={course._id} // Pass courseId from the assignment data             // Pass courseId properly
    modalData={editAssignment}
    setModalData={setEditAssignment}
    edit={true}
  />
)}

      {confirmationModal && (
        <ConfirmationModal modalData={confirmationModal} />
      )}
    </>
  );
};

export default NestedView;


