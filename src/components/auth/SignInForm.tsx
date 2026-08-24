'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FormError } from '@/components/forms/FormError';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { APP_ROUTES, AUTH_CONSTRAINTS } from '@/constants';
import { useSignIn } from '@/hooks/useSignIn';
import { config } from '@/config';

type SignInStep = 'phone' | 'otp';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function SignInForm() {
  const router = useRouter();
  const { requestOtp, verifyOtp, isSending, isVerifying, error, setError } = useSignIn();

  const [step, setStep] = useState<SignInStep>('phone');
  const [countryCode, setCountryCode] = useState<string>(AUTH_CONSTRAINTS.DEFAULT_COUNTRY_CODE);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(AUTH_CONSTRAINTS.RESEND_SECONDS);
  const timerRef = useRef<number | null>(null);

  const canResend = countdown === 0;
  const isBusy = isSending || isVerifying;

  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [countdown, step]);

  const startOtpStep = (nextDevOtp?: string) => {
    setStep('otp');
    setOtp('');
    setFieldError(null);
    setCountdown(AUTH_CONSTRAINTS.RESEND_SECONDS);
    setDevOtp(nextDevOtp || null);
  };

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError(null);
    setError(null);

    const mobile = digitsOnly(mobileNumber);
    if (mobile.length < AUTH_CONSTRAINTS.MIN_MOBILE_DIGITS) {
      setFieldError(`Enter a valid mobile number (at least ${AUTH_CONSTRAINTS.MIN_MOBILE_DIGITS} digits)`);
      return;
    }

    const trimmedCode = countryCode.trim();
    try {
      const generatedOtp = await requestOtp({
        countryCode: trimmedCode || undefined,
        mobileNumber: mobile,
      });
      setMobileNumber(mobile);
      startOtpStep(generatedOtp);
    } catch {
      // Error state is set by useSignIn
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError(null);
    setError(null);

    const otpValue = digitsOnly(otp);
    if (otpValue.length !== AUTH_CONSTRAINTS.OTP_LENGTH) {
      setFieldError(`OTP must be exactly ${AUTH_CONSTRAINTS.OTP_LENGTH} digits`);
      return;
    }

    try {
      await verifyOtp({
        countryCode: countryCode.trim() || undefined,
        mobileNumber: digitsOnly(mobileNumber),
        otp: otpValue,
      });
      router.replace(APP_ROUTES.DASHBOARD);
    } catch {
      // Error state is set by useSignIn
    }
  };

  const handleResend = async () => {
    if (!canResend || isBusy) {
      return;
    }

    setFieldError(null);
    setError(null);

    try {
      const generatedOtp = await requestOtp({
        countryCode: countryCode.trim() || undefined,
        mobileNumber: digitsOnly(mobileNumber),
      });
      setOtp('');
      setCountdown(AUTH_CONSTRAINTS.RESEND_SECONDS);
      setDevOtp(generatedOtp || null);
    } catch {
      // Error state is set by useSignIn
    }
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setOtp('');
    setDevOtp(null);
    setFieldError(null);
    setError(null);
  };

  if (step === 'otp') {
    return (
      <AuthLayout
        title="Verify code"
        description={`Enter the ${AUTH_CONSTRAINTS.OTP_LENGTH}-digit code sent to ${countryCode} ${mobileNumber}.`}
      >
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <Input
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={AUTH_CONSTRAINTS.OTP_LENGTH}
            value={otp}
            onChange={(event) => setOtp(digitsOnly(event.target.value).slice(0, AUTH_CONSTRAINTS.OTP_LENGTH))}
            error={fieldError || undefined}
            required
            disabled={isBusy}
            className="tracking-[0.35em]"
          />

          {config.isDevelopment && devOtp && (
            <p className="rounded-md bg-surface-muted px-3 py-2 text-xs text-text-secondary">
              Development OTP: <span className="font-mono font-semibold text-text">{devOtp}</span>
            </p>
          )}

          <FormError message={error} />

          <Button type="submit" className="w-full" size="lg" isLoading={isVerifying} disabled={isBusy}>
            Verify and sign in
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2 border-t border-border pt-4 text-sm">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isBusy}
              className="text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? 'Resending code...' : 'Resend verification code'}
            </button>
          ) : (
            <p className="text-text-muted">
              Resend code in <span className="font-medium text-text">{countdown}s</span>
            </p>
          )}
          <button
            type="button"
            onClick={handleChangeNumber}
            disabled={isBusy}
            className="text-text-secondary hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use a different number
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign in" description="Use the mobile number on your admin account. A verification code will be sent.">
      <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="w-24 shrink-0">
            <Input
              label="Code"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              autoComplete="tel-country-code"
              required
              disabled={isBusy}
            />
          </div>
          <Input
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={mobileNumber}
            onChange={(event) => setMobileNumber(event.target.value)}
            error={fieldError || undefined}
            required
            disabled={isBusy}
          />
        </div>

        <FormError message={error} />

        <Button type="submit" className="w-full" size="lg" isLoading={isSending} disabled={isBusy}>
          Send verification code
        </Button>
      </form>
    </AuthLayout>
  );
}
