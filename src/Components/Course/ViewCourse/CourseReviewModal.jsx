import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux'
// import IconBtn from '../../common/IconBtn';
// import { createRating } from '../../../services/operations/courseDetailsAPI';
import ReactStars from "react-rating-stars-component";
import { RxCross2 } from "react-icons/rx"
import { createRating } from '../../../Redux/courseSlice';
import { Button } from '@material-tailwind/react';
const CourseReviewModal = ({setReviewModal}) => {
  // console.log(setReviewModal)
    const user = useSelector((state) => state.profile.data )
    console.log(user.avatar.secure_url)
    const {token} = useSelector((state)=> state.auth)
    const {courseEntireData} = useSelector((state)=> state.viewCourse);
   const dispatch = useDispatch()
    const {
        register, 
        setValue,
        getValues,
        handleSubmit,
        formState:{errors}
    } = useForm()

    useEffect(()=>{
        setValue("courseRating",0);
        setValue("courseExperience","")
    },[])

    const ratingChanged = (newRating) => {
        setValue("courseRating", newRating)
    }

    const onSubmit = async (data)=>{
        await dispatch(createRating({
            courseId: courseEntireData._id,
            rating: data.courseRating,
            review: data.courseExperience
        }))
        setReviewModal(false)
    }
    
    // console.log(setReviewModal)
  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen text-slate-400 text-2xl w-screen place-items-center overflow-auto bg-slate-300 bg-opacity-10 backdrop-blur-md">
    <div className="my-10 w-11/12 max-w-[700px] bg-slate-800 rounded-lg border border-white ">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-5 rounded-t-lg ">
        <p className="text-2xl font-semibold ">Add Review</p>
        <button onClick={() => setReviewModal(false)}>
          <RxCross2 className="text-2xl " />
        </button>
      </div>
      {/* Modal Body */}
      <div className="p-6">
        <div className="flex items-center justify-center text-xs text-slate-200 gap-x-4">
          <img
            src={user?.avatar.secure_url}
            alt={user?.fullName}
            className="aspect-square w-[50px] shadow-2xl shadow-slate-300 rounded-full object-cover"
          />
          <div className="">
            <p className="font-semibold ">
              {user?.fullName}
            </p>
            <p className="text-sm ">Posting Publicly</p>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center mt-6"
        >
          <ReactStars
            count={5}
            onChange={ratingChanged}
            size={24}
            className="bg-white"
            activeColor="#ffd700"
          />
          <div className="flex flex-col w-11/12 space-y-2">
            <label
              className="text-sm text-slate-300"
              htmlFor="courseExperience"
            >
              Add Your Experience <sup className="text-pink-200">*</sup>
            </label>
            <textarea
              id="courseExperience"
              placeholder="Add Your Experience"
              {...register("courseExperience", { required: true })}
              className=" bg-slate-500 text-slate-100 p-2 resize-x-none min-h-[130px] w-full"
            />
            {errors.courseExperience && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Please Add Your Experience
              </span>
            )}
          </div>
          <div className="flex justify-end w-11/12 mt-6 gap-x-2">
            <Button
              onClick={() => setReviewModal(false)}
              className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-slate-600 py-[8px] px-[20px] font-semibold text-slate-200`}
            >
              Cancel
            </Button>
            <Button type="submit " className='flex cursor-pointer items-center gap-x-2 rounded-md bg-slate-600 py-[8px] px-[20px] font-semibold text-slate-200' >Save</Button>
          </div>
        </form>
      </div>
    </div>
  </div>
  )
}

export default CourseReviewModal