
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/Logo';

export default function OtpVerifyPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push('/dashboard');
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
            <CardDescription>We have sent a code to your mobile number.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  required
                  className="text-center text-lg tracking-[0.5em]"
                />
              </div>
              <Button type="submit" className="w-full">
                Verify
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
