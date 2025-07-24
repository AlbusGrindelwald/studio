

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { verifyOtp } from '@/lib/auth';
import type { MockConfirmationResult } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [resendTimer, setResendTimer] = useState(55);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };
  
  const handleNumberPadClick = (num: string) => {
    const emptyIndex = otp.findIndex(val => val === '');
    if (emptyIndex !== -1) {
      handleOtpChange(emptyIndex, num);
    }
  };

  const handleDeleteClick = () => {
    const lastFilledIndex = otp.map(v => !!v).lastIndexOf(true);
    if(lastFilledIndex > -1) {
        const newOtp = [...otp];
        newOtp[lastFilledIndex] = '';
        setOtp(newOtp);
        inputsRef.current[lastFilledIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 4-digit code.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      // In a real app, this would be a real API call.
      // We are simulating for now with a hardcoded value.
      if (otpCode === "123456".slice(0,4)) { 
        toast({
          title: 'Verification Successful!',
          description: `Welcome, ${email}!`,
        });
        router.push('/dashboard/appointments');
      } else {
        throw new Error('Invalid OTP. Please try again.');
      }
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
  
  const numberPad = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0'
  ];

  if (!isClient) {
    return (
        <div className="w-full max-w-sm space-y-6">
            <Skeleton className="h-7 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto mt-2" />
            <div className="flex justify-center gap-2 mt-4">
                <Skeleton className="h-14 w-12" />
                <Skeleton className="h-14 w-12" />
                <Skeleton className="h-14 w-12" />
                <Skeleton className="h-14 w-12" />
            </div>
        </div>
    );
  }


  return (
    <div className="flex flex-col h-screen bg-[#2BC8BE]/5">
      <header className="p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">OTP Code Verification</h1>
      </header>

      <main className="flex flex-col items-center justify-center text-center p-4 flex-grow">
          <p className="text-muted-foreground mb-4">Code has been sent to</p>
          <p className="font-bold mb-8">{email}</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => inputsRef.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-16 text-center text-2xl font-bold border-2 focus:border-primary focus:ring-primary rounded-lg"
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className='flex justify-center items-center gap-1'>
                <p className="text-muted-foreground text-sm">Resend code in</p>
                <p className='text-sm text-blue-500 font-semibold'>{resendTimer}s</p>
            </div>

            <Button type="submit" className="w-full bg-[#2BC8BE] hover:bg-[#2BC8BE]/90 text-white rounded-full py-6" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>
      </main>

      <footer className="p-4 bg-white">
        <div className="grid grid-cols-3 gap-y-4">
          {numberPad.map((num) => (
            <Button
              key={num}
              variant="ghost"
              className="text-3xl h-16"
              onClick={() => handleNumberPadClick(num)}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="text-3xl h-16 flex items-center justify-center"
            onClick={handleDeleteClick}
          >
            <Delete size={28} />
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default function OtpVerifyPage() {
  return (
    <Suspense fallback={<div className='flex items-center justify-center min-h-screen'>Loading...</div>}>
      <OtpVerificationForm />
    </Suspense>
  );
}
