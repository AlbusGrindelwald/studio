

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/Logo';
import { Suspense, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { verifyOtp } from '@/lib/auth';
import type { MockConfirmationResult } from '@/lib/auth';

function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit code.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const confirmationResult = (window as any).confirmationResult as MockConfirmationResult;
      if (!confirmationResult) {
        throw new Error('Verification session not found. Please try logging in again.');
      }
      const user = await verifyOtp(confirmationResult, otp);
      toast({
        title: 'Verification Successful!',
        description: `Welcome, ${user.email}!`,
      });
      router.push('/dashboard/appointments');
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleOtpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setOtp(numericValue.slice(0, 6));
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Logo className="mx-auto mb-4 text-3xl" />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Enter Verification Code</CardTitle>
            <CardDescription>
              We have sent a code to your email
              {email && <span className="font-bold text-foreground"> {email}</span>}.
              (Hint: use 123456)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="otp"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  required
                  value={otp}
                  onChange={handleOtpInput}
                  className="text-center text-lg tracking-[0.5em]"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Didn&apos;t receive the code?{' '}
              <Link href="#" className="font-medium text-primary hover:underline">
                Resend
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OtpVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpVerificationForm />
    </Suspense>
  );
}
