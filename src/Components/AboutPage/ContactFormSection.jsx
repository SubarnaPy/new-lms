import React from 'react';
import ContactUsForm from '../Contactus/ContactUs';

const ContactFormSection = () => {
  return (
    <div className='mx-auto my-20 dark:border-cyan-500 max-w-[800px]'>
      {/* Heading Section */}
      <div className='text-center'>
        <h1 className='text-4xl font-semibold text-richblack-800 dark:text-richblack-5'>
          Get in Touch
        </h1>
        <p className='mt-3 text-lg text-richblack-600 dark:text-richblack-200'>
          We'd love to hear from you. Please fill out this form.
        </p>
      </div>

      {/* Form Section */}
      <div className='mt-10  rounded-lg dark:bg-richblack-800 shadow-[0_0_20px_0_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_0_rgba(255,255,255,0.1)]'>
        <ContactUsForm />
      </div>
    </div>
  );
};

export default ContactFormSection;