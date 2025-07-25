
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
import { signInWithGoogle } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { findUserByEmailOrPhone, loginUser, createUser } from '@/lib/user';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const user = findUserByEmailOrPhone(identifier);
    const isPhone = /^\d+$/.test(identifier.replace(/\s/g, ''));
    
    if (user) {
        if (isPhone) {
             // In a real app, you'd send an OTP here.
            router.push(`/otp-verify?identifier=${encodeURIComponent(identifier)}&userId=${user.id}`);
        } else { // Email login
            if (user.password === password) {
                router.push(`/otp-verify?identifier=${encodeURIComponent(user.phone || '')}&userId=${user.id}`);
            } else {
                 toast({
                    title: "Invalid Credentials",
                    description: "Please check your email and password.",
                    variant: "destructive"
                });
            }
        }
    } else {
         toast({
            title: "User Not Found",
            description: "No account is associated with this identifier. Please sign up.",
            variant: "destructive"
        });
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const googleUser = await signInWithGoogle();
      if (googleUser && googleUser.email) {
        let appUser = findUserByEmailOrPhone(googleUser.email);
        
        // If user doesn't exist, create a new one, but they'll need to enter phone on OTP page
        if (!appUser) {
           appUser = createUser({
             name: googleUser.displayName || 'Google User',
             email: googleUser.email,
             password: `google-auth-${Date.now()}` // a dummy password
           })
        }
        
        // Redirect to OTP page. If phone exists, pre-fill it.
        router.push(`/otp-verify?identifier=${encodeURIComponent(appUser.phone || '')}&userId=${appUser.id}&isGoogleSignIn=true`);

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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h2 className="text-xl text-muted-foreground">Hi, welcome to <span className='text-primary font-semibold'>Shedula</span></h2>
            <h1 className="text-4xl font-bold">Login</h1>
        </div>
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Mobile / Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email or mobile"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                />
              </div>

               <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || /^\d+$/.test(identifier.replace(/\s/g, ''))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" />
                  <Label htmlFor="remember-me" className="text-sm font-normal">Remember Me</Label>
                </div>
                <Link href="#" className="text-sm font-medium text-destructive hover:underline">
                  Forgot Password?
                </Link>
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or login with
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
