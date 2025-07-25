
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
  const initialIdentifier = searchParams.get('identifier');
  const userId = searchParams.get('userId');
  const isGoogleSignIn = searchParams.get('isGoogleSignIn') === 'true';

  const { toast } = useToast();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [phone, setPhone] = useState(initialIdentifier || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Effect for non-Google sign-in or when phone number is already present
  useEffect(() => {
    if (isClient && (!isGoogleSignIn || (isGoogleSignIn && initialIdentifier))) {
      handleSendOtp();
    }
  }, [isClient, isGoogleSignIn, initialIdentifier]);

  // Effect for countdown timer
  useEffect(() => {
    if (otpSent && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, resendTimer]);

  const handleSendOtp = () => {
    if (isGoogleSignIn && !phone) {
      toast({
        title: 'Mobile Number Required',
        description: 'Please enter a valid 10-digit mobile number.',
        variant: 'destructive',
      });
      return;
    }
     if (isGoogleSignIn && phone.length !== 10) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid 10-digit mobile number.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: "OTP 'Sent'",
      description: "Check console for mock OTP. Use 123456 to verify.",
    });
    setOtpSent(true);
    setResendTimer(55);
  };

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
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (otpCode === "123456" && userId) {
        const user = findUserById(userId);
        if (user) {
          updateUserWithPhone(user.id, phone);
          loginUser(user.id);
        }

        toast({
          title: 'Verification Successful!',
          description: `Welcome!`,
        });
        router.push('/dashboard');
      } else {
        throw new Error('Invalid OTP or user missing. Please try again.');
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

  useEffect(() => {
    setIsClient(true);
  }, []);
  
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

  const showPhoneInput = isGoogleSignIn && !initialIdentifier;

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
          {showPhoneInput && !otpSent
            ? 'Enter your mobile number to get an OTP'
            : `Code has been sent to`}
        </p>
        
        { !showPhoneInput ? (
             <p className="font-bold mb-8">{phone}</p>
        ) : (
            <div className="w-full max-w-sm mb-8 space-y-4">
               <div className="flex items-center gap-2">
                  <Input
                      id="phone-number"
                      type="tel"
                      placeholder="Your 10-digit mobile number"
                      value={phone}
                      onChange={handlePhoneChange}
                      disabled={isLoading || otpSent}
                      className="text-center"
                      maxLength={10}
                  />
                  <Button onClick={handleSendOtp} disabled={otpSent || isLoading || phone.length !== 10}>Send</Button>
               </div>
            </div>
        )}

        {otpSent && (
          <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-sm">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => {
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
              <p className="text-muted-foreground text-sm">Resend code in</p>
              <p className='text-sm text-primary font-semibold'>{resendTimer > 0 ? `00:${resendTimer.toString().padStart(2, '0')}` : "00:00"}</p>
            </div>

            <Button type="submit" className="w-full rounded-full py-6 text-lg" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>
        )}
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
