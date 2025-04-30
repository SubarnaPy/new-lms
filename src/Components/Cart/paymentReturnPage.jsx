import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyUserPayment, resetPaymentState } from '../../Redux/razorpaySlice';

const PaymentReturnPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const { loading, success, error } = useSelector((state) => state.razorpay);

  useEffect(() => {
    if (sessionId) {
      dispatch(verifyUserPayment(sessionId));
    }
  }, [dispatch, sessionId]);

  useEffect(() => {
    if (success) {
      alert('Payment successful! Redirecting to home page...');
      dispatch(resetPaymentState());
      navigate('/'); // Redirects to the home page
    }
  }, [success, dispatch, navigate]);

  return (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Verifying Payment...</h2>
      {loading && <p className="text-blue-500">Processing your payment, please wait...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default PaymentReturnPage;
