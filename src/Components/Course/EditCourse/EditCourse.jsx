import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"

// import {
//   fetchCourseDetails,
//   getFullDetailsOfCourse,
// } from "../../../../services/operations/courseDetailsAPI"
import { getFullDetailsOfCourse, setCourse, setEditCourse } from "../../../Redux/courseSlice"
import RenderSteps from "../CreateCourse/RenderSteps"
// import RenderSteps from "../Add Course/RenderSteps"

export default function EditCourse() {
  const dispatch = useDispatch()
  const { courseId } = useParams()
  const { course } = useSelector((state) => state.course)
  console.log(course)
  console.log(courseId)

  const [loading, setLoading] = useState(false)
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const result = await dispatch(getFullDetailsOfCourse(courseId))
      console.log(result)
      if (result?.payload != null || undefined) {
        dispatch(setEditCourse(true))
        dispatch(setCourse(result?.payload))
      }
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-medium mb-14 text-richblack-5">
        Edit Course
      </h1>
      <div className="mx-auto max-w-[600px]">
        {course ? (
          <RenderSteps />
        ) : (
          <p className="text-3xl font-semibold text-center mt-14 text-richblack-100">
            Course not found
          </p>
        )}
      </div>
    </div>
  )
}