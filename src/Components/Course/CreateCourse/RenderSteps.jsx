
import { useSelector } from 'react-redux'
import { FaCheck } from "react-icons/fa"

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm.jsx"
import CourseInformationForm from "./CourseInformation/CourseInformationForm.jsx"
import PublishCourse from "./PublishCourse/index.jsx"
const RenderSteps = () => {
    const {step} = useSelector((state)=> state.course)

    const steps = [ 
        {id:1,
        title: "Course Information"},
        {
            id: 2,
            title: "Course Builder",
          },
          {
            id: 3,
            title: "Publish",
          }
    ]
  return (
    <>
        <div className="relative flex justify-center w-full mb-2">
            {steps.map((item)=> (
                < >  
                
                {/* Step Circle */}

                    <div className="flex flex-col items-center shadow-2xl " key={item.id}>
                        <button
                        className={`cursor-default aspect-square w-[34px]
                         place-items-center rounded-full border-[1px] shadow-2xl
                         ${step === item.id ? ' border-yellow-500 bg-yellow-600 text-yellow-300 ' 
                         : ' bg-x-yellow-50 border-slate-950 dark:border-white dark:text-white text-slate-800'}
                         ${step > item.id ? ' bg-yellow-50' :'text-yellow-50'}`}
                         >
                            {step > item.id ? (
                                <FaCheck className='font-bold text-slate-950 dark:text-white'/>
                            ) : 
                            (item.id)}
                        </button>
                    </div>
                {/* Dotted Line */}
                    {item.id !== steps.length && (
                        <>
                            <div key={item.id}
                            className={`h-[calc(34px/2)] w-[33%]  border-dashed border-b-2 
                            ${step > item.id  ? "border-yellow-500" : "border-black dark:border-white"}`}
                            ></div>
                        </>
                    )}
                </>
            ))}
        </div>

    
       {/* Steps Titles */}
       <div className="relative flex flex-wrap justify-between w-full mb-8 gap-y-2 lg:flex-nowrap">
        {steps.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] lg:min-w-[130px]"
          >
            <p
              className={`text-xs sm:text-sm lg:text-base ${
                step >= item.id ? "text-slate-950 dark:text-white" : "text-slate-900 dark:text-white"
              }`}
            >
              {item.title}
            </p>
          </div>
        ))}
      </div>


      <div className="w-full ">
        {step === 1 && <CourseInformationForm />}
        {step === 2 && <CourseBuilderForm />}
        {step === 3 && <PublishCourse />}
      </div>

    </>
  )
}

export default RenderSteps

