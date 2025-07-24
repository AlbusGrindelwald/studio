

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoogleIcon from '@/components/GoogleIcon';
import { Logo } from '@/components/Logo';
import { useEffect, useState } from 'react';
import { signInWithGoogle, sendOtp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast({
            title: "Invalid Email Address",
            description: "Please enter a valid email address.",
            variant: "destructive"
        });
        return;
    }
    setIsLoading(true);
    try {
        const confirmationResult = await sendOtp(email);
        (window as any).confirmationResult = confirmationResult;
        toast({
            title: "OTP Sent",
            description: "A verification code has been 'sent' to your email (check console). Use 123456 to verify.",
        });
        router.push(`/otp-verify?email=${email}`);
    } catch (error: any) {
        console.error(error);
        toast({
            title: "Failed to send OTP",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        toast({
          title: 'Signed In',
          description: `Welcome back, ${user.displayName}!`,
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Sign In Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h2 className="text-xl text-muted-foreground">Hi welcome too <span className='text-primary font-semibold'>Shedula</span></h2>
            <h1 className="text-4xl font-bold">Login</h1>
        </div>
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Mobile /Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="login with email or mobile number"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" />
                  <Label htmlFor="remember-me" className="text-sm font-normal">Remember Me</Label>
                </div>
                <Link href="#" className="text-sm font-medium text-destructive hover:underline">
                  Forgot Password
                </Link>
              </div>
              
              <Button type="submit" className="w-full bg-[#2BC8BE] hover:bg-[#2BC8BE]/90 text-white" size="lg" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or login With
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </form>
            
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign Up
            </Link>
            </div>
      </div>
    </div>
  );
}
