import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { createSubSection, updateSubSection } from "../../../../Redux/courseSlice";
import { setCourse } from "../../../../Redux/courseSlice";
import Upload from "../Upload";
import { Button } from "@material-tailwind/react";
import { useParams } from "react-router-dom";

const SubSectionModal = ({onClose, modalData, setModalData, add = false, view = false, edit = false }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);
  let { courseId } = useParams() || course._id;
  courseId = courseId || course._id;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm();

  // State for free video toggle
  const [isFree, setIsFree] = useState(modalData?.isFree || false);

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title);
      setValue("lectureDesc", modalData.description);
      setValue("lectureVideo", modalData?.lecture?.secure_url);
      setValue("lecturePdf", modalData?.pdf?.secure_url);
      setIsFree(modalData?.isFree || false); // Set initial value for free video toggle
    }
  }, [view, edit, modalData, setValue]);

  const isFormUpdated = () => {
    const currentValues = getValues();
    return (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl ||
      currentValues.lecturePdf !== modalData.pdfUrl ||
      isFree !== modalData.isFree
    );
  };

  const handleEditSubsection = async () => {
    const currentValues = getValues();
    const formData = new FormData();
    formData.append("sectionId", modalData.sectionId);
    formData.append("subSectionId", modalData._id);
    if (currentValues.lectureTitle !== modalData.title) formData.append("title", currentValues.lectureTitle);
    if (currentValues.lectureDesc !== modalData.description) formData.append("description", currentValues.lectureDesc);
    if (currentValues.lectureVideo !== modalData.videoUrl) formData.append("videoFile", currentValues.lectureVideo);
    if (currentValues.lecturePdf !== modalData.pdfUrl) formData.append("pdfFile", currentValues.lecturePdf);
    formData.append("isFree", isFree); // Add isFree to form data
    formData.append("courseId", course._id);

    setLoading(true);
    const result = await dispatch(updateSubSection(formData));
    if (result.payload) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData.sectionId ? result.payload : section
      );
      const updatedCourse = result.payload;
      dispatch(setCourse(updatedCourse));
    }
    setModalData(null);
    setLoading(false);
  };

  const onSubmit = async (data) => {
    if (view) return;

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form");
      } else {
        handleEditSubsection();
      }
      return;
    }

    const formData = new FormData();
    formData.append("sectionId", modalData);
    formData.append("title", data.lectureTitle);
    formData.append("description", data.lectureDesc);
    formData.append("videoFile", data.lectureVideo);
    formData.append("pdfFile", data.lecturePdf);
    formData.append("isFree", isFree); // Add isFree to form data
    formData.append("courseId", courseId);

    setLoading(true);
    const result = await dispatch(createSubSection(formData));
    if (result.payload) {
      console.log("------------------------------------",result.payload)
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData ? result.payload : section
      );
      const updatedCourse = (result.payload);
      console.log("=================================",updatedCourse);
      dispatch(setCourse(updatedCourse));
    }
    setModalData(null);
    setLoading(false);
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      console.log('Background clicked')
      onClose();
    }
  };
  

  return (
    <div onClick={handleBackgroundClick}  className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-gray-300 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 rounded-t-lg">
          <p className="text-xl font-semibold text-slate-950 dark:text-gray-200">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <Button className="bg-white dark:bg-gray-800" onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-slate-950 dark:text-gray-200" />
          </Button>
        </div>
        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-10 space-y-8">
          {/* Lecture Video Upload */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData?.lecture?.secure_url : null}
            editData={edit ? modalData?.lecture?.secure_url : null}
          />
          {/* Lecture Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-slate-950 dark:text-gray-200" htmlFor="lectureTitle">
              Lecture Title {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })}
              className="w-full p-2 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture title is required
              </span>
            )}
          </div>
          {/* Lecture Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-slate-950 dark:text-gray-200" htmlFor="lectureDesc">
              Lecture Description {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc", { required: true })}
              className="resize-x-none p-2 shadow-lg bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg min-h-[130px] w-full"
            />
            {errors.lectureDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture Description is required
              </span>
            )}
          </div>

          {/* Free Video Toggle */}
          <div className="flex items-center space-x-3">
            <label className="text-sm text-slate-950 dark:text-gray-200">Mark as Free</label>
            <div
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${
                isFree ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
              onClick={() => setIsFree(!isFree)}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  isFree ? "translate-x-6" : "translate-x-1"
                } top-0.5`}
              />
            </div>
          </div>

          {/* Upload PDF */}
          <div>
            <label className="block text-sm font-medium text-slate-950 dark:text-gray-200">Upload PDF</label>
            {view ? (
              <a
                href={modalData?.pdf.secure_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                View PDF
              </a>
            ) : (
              <Upload
                name="lecturePdf"
                label="Lecture PDF"
                register={register}
                setValue={setValue}
                errors={errors}
                pdf={true}
                viewData={view ? modalData?.pdf?.secure_url : null}
                editData={edit ? modalData?.pdf?.secure_url : null}
              />
            )}
          </div>

          {!view && (
            <div className="flex justify-end">
              <Button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg dark:bg-blue-700 dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-blue-800"
              >
                {!edit ? "Next" : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubSectionModal;