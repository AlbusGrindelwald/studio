

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { updateUserWithPhone, findUserById, loginUser } from '@/lib/user';
import { Label } from '@/components/ui/label';

function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  const userId = searchParams.get('userId');
  const isGoogleSignIn = searchParams.get('isGoogleSignIn') === 'true';

  const { toast } = useToast();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [phone, setPhone] = useState(identifier || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [resendTimer, setResendTimer] = useState(55);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    const otpCode = otp.join('');
    // Use a mock OTP for demonstration
    if (otpCode === '123456') {
      if (userId) {
        // If user logged in with Google/Email and is now adding a phone number
        if (isGoogleSignIn && phone) {
            updateUserWithPhone(userId, phone);
        }
        loginUser(userId);
        
        toast({
          title: 'Verification Successful!',
          description: `Welcome!`,
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: 'User session not found. Please try logging in again.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Invalid OTP',
        description: 'The OTP code is incorrect. Please try again.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };
  
  const handleResend = () => {
    setResendTimer(55);
    toast({
        title: "OTP Resent",
        description: "A new (mock) OTP has been sent."
    })
  }

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-5 w-64 mx-auto mb-8" />
        <div className="flex justify-center gap-3 mb-8">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-12 rounded-lg" />)}
        </div>
        <Skeleton className="h-6 w-40 mx-auto mb-8" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    );
  }
  
  const showPhoneInput = isGoogleSignIn && !identifier;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">OTP Code Verification</h1>
      </header>
      
      <main className="flex flex-col items-center justify-center text-center p-4 flex-grow">
          <p className="text-muted-foreground mb-2">
            Code has been sent to
          </p>
          <p className="font-bold mb-8">{`+1 ${phone}`}</p>

          <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-sm">
            <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                    <Input
                        key={index}
                        ref={(el) => {
                            if (el) inputsRef.current[index] = el;
                        }}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 focus:border-primary focus:ring-primary rounded-lg"
                        disabled={isLoading}
                    />
                ))}
            </div>

            <div className='flex justify-center items-center gap-1'>
                <p className="text-muted-foreground text-sm">Haven't got the code?</p>
                {resendTimer > 0 ? (
                    <p className="text-sm text-primary font-semibold">{`Resend in 00:${resendTimer.toString().padStart(2, '0')}`}</p>
                ) : (
                    <Button variant="link" onClick={handleResend} disabled={isLoading}>Resend</Button>
                )}
            </div>

            <Button type="submit" className="w-full rounded-full py-6 text-lg" disabled={isLoading || otp.join('').length < 6}>
                {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>
      </main>
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
