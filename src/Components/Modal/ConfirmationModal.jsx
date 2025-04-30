import { Button } from '@material-tailwind/react'
import React from 'react'
// import IconBtn from './IconBtn'
import deleteSection from '../../Redux/courseSlice'

const ConfirmationModal = ({modalData}) => {
  return (
    <div className='shadow-2xl'>
        <div className='w-11/12 max-w-[350px] shadow-2xl rounded-lg border border-richblack-400 bg-[#0c263f] text-slate-50 p-6 z-50 fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2'>
            <p className='text-2xl font-semibold text-richblack-5'>
                {modalData.text1}
            </p>
            <p className='mt-3 mb-5 leading-6 text-richblack-200'>
                {modalData.text2}
            </p>
            <div className='flex items-center gap-x-4'>
            <Button className='flex items-center px-3 py-2 text-sm font-semibold rounded-md cursor-pointer bg-slate-700 gap-x-2 md:text-lg md:px-5 text-richblack-900 undefined'
             onClick={modalData?.btn1Handler}>
                    {modalData?.btn1Text}
                </Button> 
                    
                
                <Button className='flex items-center px-3 py-2 text-sm font-semibold rounded-md cursor-pointer bg-slate-700 gap-x-2 md:text-lg md:px-5 text-richblack-900 undefined' onClick={modalData?.btn2Handler}>
                    {modalData?.btn2Text}
                </Button>    
            </div>
        </div>

        <div className='fixed inset-0 z-10 !mt-0 grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm over'></div>
      
    </div>
  )
}

export default ConfirmationModal
