'use client';

import {Suspense, useState, useEffect} from 'react';
import AppButton from '@/app/component/shared/AppButton';
import OtpInput from '@/app/component/auth/OtpInput';
import {useRouter, useSearchParams} from 'next/navigation';
import {useAuth} from '@/lib/context/AuthContext';
import {api, ApiError} from '@/lib/api';
import {ResendOtpResponseData} from '@/lib/types';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {verifyOtp} = useAuth();

  const emailParam = searchParams?.get('email') || '';
  const initialOtp = searchParams?.get('otp') || '';

  const [otp, setOtp] = useState(initialOtp);
  const [displayedOtp, setDisplayedOtp] = useState(initialOtp);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (initialOtp) {
      setOtp(initialOtp);
      setDisplayedOtp(initialOtp);
    }
  }, [initialOtp]);

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || otp).trim();
    if (code.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await verifyOtp(code);
      setSuccessMsg('Email verified successfully! Redirecting to setup...');
      setTimeout(() => {
        if (res.user?.isOnboarded) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid OTP code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setErrorMsg('');
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  const handleFillCode = (code: string) => {
    setOtp(code);
    setErrorMsg('');
  };

  const handleResend = async () => {
    const email = emailParam.trim();
    if (!email) {
      setErrorMsg('Email address missing. Please go back to login.');
      return;
    }
    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post<ResendOtpResponseData>('/auth/resend-otp', {
        email,
      });
      if (res.otp) {
        setDisplayedOtp(res.otp);
        setOtp(res.otp);
      }
      setSuccessMsg('A new verification code has been generated.');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to resend verification code.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[28px] border border-white/80 p-8 sm:p-9 shadow-[0_20px_50px_-15px_rgba(79,90,140,0.18)]">
      {displayedOtp && (
        <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-amber-950 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <span>🧪</span> Development Testing OTP:
            </span>
            <button
              type="button"
              onClick={() => handleFillCode(displayedOtp)}
              title="Click to copy & fill"
              className="flex items-center gap-1.5 bg-amber-200/90 hover:bg-amber-300/90 text-amber-950 px-3 py-1 rounded-xl border border-amber-300 font-mono font-bold text-sm tracking-widest transition-colors cursor-pointer">
              <span>{displayedOtp}</span>
            </button>
          </div>
        </div>
      )}

      <h1 className="text-center text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Check your email
      </h1>

      <p className="text-center text-xs sm:text-[13px] text-slate-500 mb-6 leading-relaxed">
        Please enter the 6-digit code we sent to{' '}
        <span className="font-semibold text-slate-700">
          {emailParam || 'your registered email'}
        </span>
      </p>

      {errorMsg && (
        <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 rounded-2xl border border-red-200 text-center animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 text-xs text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-200 text-center animate-in fade-in duration-200">
          {successMsg}
        </div>
      )}

      <div className="py-2">
        <OtpInput value={otp} onChange={handleOtpChange} disabled={loading} />
      </div>

      <div className="pt-4">
        <AppButton
          type="button"
          onClick={() => handleVerify()}
          disabled={loading || otp.length < 6}
          className="w-full">
          {loading ? 'Verifying...' : 'Verify Code'}
        </AppButton>
      </div>

      <p className="text-center text-xs sm:text-[13px] text-slate-500 pt-4">
        Didn&apos;t receive code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || loading}
          className="text-[#4F62E8] font-semibold hover:underline disabled:opacity-50 cursor-pointer">
          {resending ? 'Resending...' : 'Resend'}
        </button>
      </p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-white rounded-[28px] border border-white/80 p-8 sm:p-9 shadow-[0_20px_50px_-15px_rgba(79,90,140,0.18)] text-center text-sm text-slate-500">
          Loading verification...
        </div>
      }>
      <VerifyOtpContent />
    </Suspense>
  );
}
