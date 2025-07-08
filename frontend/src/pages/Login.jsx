import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [state, setState] = useState('Sign Up');
  const [step, setStep] = useState(1); // 1: send otp | 2: enter otp
  const [otp, setOtp] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { backendUrl, token, setToken } = useContext(AppContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Login') {
      const { data } = await axios.post(backendUrl + '/api/user/login', { email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        toast.error(data.message);
      }
    } else {
      if (step === 1) {
        try {
          const res = await axios.post(backendUrl + '/api/user/send-otp', { email });
          if (res.data.success) {
            toast.success('OTP sent to email');
            setStep(2);
          } else {
            toast.error(res.data.message);
          }
        } catch (err) {
          toast.error('Failed to send OTP');
        }
      } else {
        // Step 2: verify otp
        try {
          const res = await axios.post(backendUrl + '/api/user/verify-otp', {
            name,
            email,
            password,
            otp,
          });
          if (res.data.success) {
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            toast.success('Signup successful!');
          } else {
            toast.error(res.data.message);
          }
        } catch (err) {
          toast.error('OTP verification failed');
        }
      }
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>

        {state === 'Sign Up' && step === 1 && (
          <>
            <div className='w-full'>
              <p>Full Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className='border border-[#DADADA] rounded w-full p-2 mt-1'
                type='text'
                required
              />
            </div>
            <div className='w-full'>
              <p>Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className='border border-[#DADADA] rounded w-full p-2 mt-1'
                type='email'
                required
              />
            </div>
            <div className='w-full'>
              <p>Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className='border border-[#DADADA] rounded w-full p-2 mt-1'
                type='password'
                required
              />
            </div>
          </>
        )}

        {state === 'Sign Up' && step === 2 && (
          <>
            <div className='w-full'>
              <p>Enter OTP (sent to {email})</p>
              <input
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                className='border border-[#DADADA] rounded w-full p-2 mt-1'
                type='text'
                required
              />
            </div>
          </>
        )}

        {state === 'Login' && (
          <>
            <div className='w-full'>
              <p>Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className='border border-[#DADADA] rounded w-full p-2 mt-1'
                type='email'
                required
              />
            </div>
            <div className='w-full'>
              <p>Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className='border border-[#DADADA] rounded w-full p-2 mt-1'
                type='password'
                required
              />
            </div>
          </>
        )}

        <button className='bg-primary text-white w-full py-2 my-2 rounded-md text-base'>
          {state === 'Sign Up'
            ? step === 1
              ? 'Send OTP'
              : 'Verify & Register'
            : 'Login'}
        </button>

        {state === 'Sign Up' ? (
          <p>
            Already have an account?{' '}
            <span
              onClick={() => {
                setState('Login');
                setStep(1);
              }}
              className='text-primary underline cursor-pointer'>
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{' '}
            <span
              onClick={() => {
                setState('Sign Up');
                setStep(1);
              }}
              className='text-primary underline cursor-pointer'>
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
