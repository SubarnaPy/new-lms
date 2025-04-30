import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineCurrencyRupee } from 'react-icons/hi';
import { Button, Grid, MenuItem, Paper, TextField } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  addCourseDetails,
  editCourseDetails,
  fetchCourseCategories,
  setEditCourse,
  setCourse,
  setStep,
} from '../../../../Redux/courseSlice';
import { COURSE_STATUS } from '../../../../utils/constants';
import Upload from '../Upload';
import ChipInput from './ChipInput';
import RequirementField from './RequirementField';

const CourseInformationForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { course, editCourse } = useSelector((state) => state.course);
  const [loading, setLoading] = useState(false);
  const [courseCategories, setCourseCategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      const categories = await dispatch(fetchCourseCategories());
      if (categories.payload.length > 0) {
        setCourseCategories(categories.payload);
      }
      setLoading(false);
    };

    if (editCourse) {
      setValue('courseTitle', course.title);
      setValue('courseShortDesc', course.description);
      setValue('coursePrice', course.price);
      setValue('courseTags', course.tags);
      setValue('courseBenefits', course.whatYouWillLearn);
      setValue('courseCategory', course.category);
      setValue('courseRequirements', course.instructions);
      setValue('courseImage', course.thumbnail);
    }

    getCategories();
  }, [editCourse, dispatch, course, setValue]);

  const isFormUpdated = () => {
    const currentValues = getValues();
    if (
      currentValues.courseTitle !== course.title ||
      currentValues.courseShortDesc !== course.description ||
      currentValues.coursePrice !== course.price ||
      currentValues.courseTags.toString() !== course.tags.toString() ||
      currentValues.courseBenefits !== course.whatYouWillLearn ||
      currentValues.courseCategory._id !== course.category._id ||
      currentValues.courseImage !== course.thumbnail ||
      currentValues.courseRequirements.toString() !== course.instructions.toString()
    ) {
      return true;
    }
    return false;
  };

  const onSubmit = async (data) => {
    if (editCourse) {
      if (isFormUpdated()) {
        const formData = new FormData();
        formData.append('courseId', course._id);

        if (data.courseTitle !== course.title) {
          formData.append('title', data.courseTitle);
        }
        if (data.courseShortDesc !== course.description) {
          formData.append('description', data.courseShortDesc);
        }
        if (data.coursePrice !== course.price) {
          formData.append('price', data.coursePrice);
        }
        if (data.courseBenefits !== course.whatYouWillLearn) {
          formData.append('whatYouWillLearn', data.courseBenefits);
        }
        if (data.courseCategory._id !== course.category._id) {
          formData.append('category', data.courseCategory);
        }
        if (JSON.stringify(data.courseRequirements).toString() !== course.instructions.toString()) {
          formData.append('instructions', JSON.stringify(data.courseRequirements));
        }
        if (JSON.stringify(data.courseTags).toString() !== course.tags.toString()) {
          formData.append('tags', JSON.stringify(data.courseTags));
        }

        setLoading(true);
        const result = await dispatch(editCourseDetails(formData));
        setLoading(false);
        if (result) {
          dispatch(setEditCourse(false));
          dispatch(setStep(2));
          dispatch(setCourse(result.payload));
        }
      } else {
        toast.error('No changes made so far');
      }
    } else {
      const formData = new FormData();
      formData.append('title', data.courseTitle);
      formData.append('description', data.courseShortDesc);
      formData.append('price', data.coursePrice);
      formData.append('whatYouWillLearn', data.courseBenefits);
      formData.append('category', data.courseCategory);
      formData.append('instructions', JSON.stringify(data.courseRequirements));
      formData.append('status', COURSE_STATUS.DRAFT);
      formData.append('tags', JSON.stringify(data.courseTags));
      formData.append('thumbnailImage', data.courseImage);

      setLoading(true);
      const result = await dispatch(addCourseDetails(formData));
      setLoading(false);
      if (result?.payload !== undefined || null) {
        dispatch(setStep(2));
        dispatch(setCourse(result?.payload));
      }
    }
  };

  return (
    <Paper
      elevation={3}
      className="max-w-[800px] mx-auto p-6 rounded-lg bg-[#f9f9f9] dark:bg-gray-800 shadow-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Course Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="courseTitle"
              label="Course Name"
              placeholder="Enter Course Title"
              {...register('courseTitle', { required: true })}
              className="dark:bg-gray-700 dark:text-white"
              variant="outlined"
              InputLabelProps={{ className: 'dark:text-white' }}
              InputProps={{ className: 'dark:text-white' }}
            />
            {errors.courseTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Course Title is required**
              </span>
            )}
          </Grid>

          {/* Course Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="courseShortDesc"
              label="Course Description"
              multiline
              rows={4}
              placeholder="Enter Description"
              {...register('courseShortDesc', { required: true })}
              className="dark:bg-gray-700 dark:text-white"
              variant="outlined"
              InputLabelProps={{ className: 'dark:text-white' }}
              InputProps={{ className: 'dark:text-white' }}
            />
            {errors.courseShortDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Course Description is required**
              </span>
            )}
          </Grid>

          {/* Course Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="coursePrice"
              label="Course Price"
              placeholder="Enter Course Price"
              type="number"
              {...register('coursePrice', { required: true, valueAsNumber: true })}
              InputProps={{
                startAdornment: <HiOutlineCurrencyRupee size={20} className="dark:text-white" />,
                className: 'dark:text-white',
              }}
              className="dark:bg-gray-700 dark:text-white"
              variant="outlined"
              InputLabelProps={{ className: 'dark:text-white' }}
            />
            {errors.coursePrice && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Course Price is required**
              </span>
            )}
          </Grid>

          {/* Course Category */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Course Category"
              {...register('courseCategory', { required: true })}
              defaultValue="courseCategory"
              disabled={editCourse}
              className="dark:bg-gray-700 dark:text-white"
              variant="outlined"
              InputLabelProps={{ className: 'dark:text-white' }}
              InputProps={{ className: 'dark:text-white' }}
            >
              <MenuItem value="courseCategory" disabled className="dark:bg-gray-700 dark:text-white">
                Choose a Category
              </MenuItem>
              {!loading &&
                courseCategories.map((category, index) => (
                  <MenuItem key={index} value={category?._id} className="">
                    {category?.name}
                  </MenuItem>
                ))}
            </TextField>
            {errors.courseCategory && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Course Category is required**
              </span>
            )}
          </Grid>

          {/* Course Tags */}
          <Grid item xs={12}>
            <ChipInput
              label="Tags"
              name="courseTags"
              placeholder="Enter tags and press enter"
              register={register}
              errors={errors}
              setValue={setValue}
              getValues={getValues}
            />
          </Grid>

          {/* Course Image Upload */}
          <Grid item xs={12}>
            <Upload
              name="courseImage"
              label="Course Image"
              register={register}
              errors={errors}
              setValue={setValue}
            />
          </Grid>

          {/* Course Benefits */}
          <Grid item xs={12}>
  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
    Benefits of the Course
  </label>
  <Controller
    name="courseBenefits"
    control={control}
    rules={{ required: true }}
    render={({ field }) => (
      <div className="dark:bg-gray-700 dark:text-white">
        <ReactQuill
  {...field}
  theme="snow"
  placeholder="Enter Benefits"
  className="text-black dark:text-white" // Correct Tailwind classes
  modules={{
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  }}
  formats={[
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
  ]}
/>

      </div>
    )}
  />
  {errors.courseBenefits && (
    <span className="ml-2 text-xs tracking-wide text-pink-200">
      Benefits are required**
    </span>
  )}
</Grid>

          {/* Course Requirements */}
          <Grid item xs={12}>
            <RequirementField
              name="courseRequirements"
              label="Requirements/Instructions"
              register={register}
              errors={errors}
              setValue={setValue}
              getValues={getValues}
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} className="flex justify-end gap-x-4">
            {editCourse && (
              <Button
                onClick={() => dispatch(setStep(2))}
                className="text-sm font-semibold bg-slate-700 dark:bg-gray-600 dark:text-white hover:bg-slate-800 dark:hover:bg-gray-700"
              >
                Continue Without Saving
              </Button>
            )}
            <Button
              type="submit"
              className="text-sm font-semibold bg-yellow-500 dark:bg-yellow-600 dark:text-white hover:bg-yellow-600 dark:hover:bg-yellow-700"
            >
              {!editCourse ? 'Next' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CourseInformationForm;