import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
//import { apiConnector } from '../../services/apiConnector';
//import { contactusEndpoint } from '../../services/apis';
//import countryCode from "../../data/countrycode.json";

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
        phoneNo: '',
      });
    }
  }, [reset, isSubmitSuccessful]);

  const onSubmit = async (data) => {
    console.log(data);
    try {
      setLoading(true);
      const phoneNo = data.countryCode + '  ' + data.phoneNo;
      const { firstName, lastName, email, message } = data;

      // const res = await apiConnector("POST", contactusEndpoint.CONTACT_US_API, { firstName, lastName, email, message, phoneNo });
      // if (res.data.success === true) {
      //   toast.success("Message sent successfully");
      // } else {
      //   toast.error("Something went wrong");
      // }
      // console.log("contact response", res);
      toast.success('Message sent successfully'); // Simulate success
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
      setLoading(false);
    }
  };

  return loading ? (
    <div className="flex items-center justify-center h-[300px]">
      <div className="w-8 h-8 border-4 border-gray-300 rounded-full border-t-blue-600 animate-spin"></div>
    </div>
  ) : (
    <div className="max-w-2xl p-6 mx-auto bg-white border-2 shadow-lg dark:border-cyan-500 dark:bg-gray-800 rounded-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* First Name and Last Name */}
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="firstname" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              First Name
            </label>
            <input
              type="text"
              name="firstname"
              id="firstname"
              placeholder="Enter first name"
              {...register('firstName', { required: true })}
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.firstName && (
              <span className="text-sm text-red-500">First Name is required *</span>
            )}
          </div>

          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="lastname" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Last Name
            </label>
            <input
              type="text"
              name="lastname"
              id="lastname"
              placeholder="Enter last name"
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('lastName')}
            />
            {errors.lastName && (
              <span className="text-sm text-red-500">Last Name is required *</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter email address"
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('email', { required: true })}
          />
          {errors.email && (
            <span className="text-sm text-red-500">Email is required *</span>
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            cols="30"
            rows="7"
            placeholder="Enter your message here"
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('message', { required: true })}
          />
          {errors.message && (
            <span className="text-sm text-red-500">Message is required *</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg shadow-md dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactUsForm;