import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, resetAuthState } from '../../Redux/authSlice'; // Import actions

const ResetPassword = () => {
    const dispatch = useDispatch();
    const { loading, success, error } = useSelector((state) => state.auth); // Access loading, success, error states
    const [email, setEmail] = useState(""); // Track the user's email input

    // Reset state when the component is mounted/unmounted
    useEffect(() => {
        return () => {
            dispatch(resetAuthState());
        };
    }, [dispatch]);

    // Handle form submission for resetting the password
    const handleOnSubmit = (e) => {
        e.preventDefault();
        dispatch(forgotPassword(email)); // Dispatch the forgotPassword thunk
    };

    return (
        <div className='grid min-h-[calc(100vh-3.5rem)] place-items-center'>
            {
                loading ? (
                    <div className="custom-loader">Loading...</div> // Show loading spinner when sending email
                ) : (
                    <div className='max-w-[500px] p-4 lg:p-8'>
                        <h1 className='text-[1.875rem] font-semibold leading-[2.375rem] '>
                            {!success ? "Reset your password" : "Check your email"}
                        </h1>
                        <p className='my-4 text-[1.125rem] leading-[1.625rem] '>
                            {
                                !success
                                    ? "We'll email you instructions to reset your password."
                                    : `We have sent the reset email to ${email}`
                            }
                        </p>
                        <form onSubmit={handleOnSubmit}>
                            {
                                !success && (
                                    <label className="w-full">
                                        <p className="mb-1 text-[0.875rem] leading-[1.375rem] ">
                                            Email Address <sup className="text-pink-200">*</sup>
                                        </p>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            placeholder="Enter email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="rounded-lg bg-amber-500 p-3 text-[16px] leading-[24px] text-richblack-5 shadow-[0_1px_0_0] shadow-white/50 placeholder:text-richblack-400 focus:outline-none w-full"
                                        />
                                    </label>
                                )
                            }
                            <button type='submit' className='mt-6 w-full rounded-[8px] bg-amber-400 py-[12px] px-[12px] font-medium text-richblack-900'>
                                {!success ? "Reset Password" : "Resend email"}
                            </button>
                        </form>
                        {
                            error && <p className='mt-4 text-red-500'>{error}</p> // Show error message if any
                        }
                        <div className='flex items-center justify-between mt-6'>
                            <Link to={"/login"}>
                                <p className="flex items-center gap-x-2 ">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 11H6.414l5.293-5.293-1.414-1.414L2.586 12l7.707 7.707 1.414-1.414L6.414 13H21z"></path>
                                    </svg> 
                                    Back To Login
                                </p>
                            </Link>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default ResetPassword;
