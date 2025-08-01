

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
import { signInWithGoogle, signInWithEmail } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { findUserByEmailOrPhone, createUser, findUserById, User, updateUserWithPhone } from '@/lib/user';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

function PhoneEntryDialog({ 
    open, 
    onOpenChange, 
    onPhoneSubmit 
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void,
    onPhoneSubmit: (phone: string) => void,
}) {
    const [phone, setPhone] = useState('');
    const { toast } = useToast();

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 10) {
            setPhone(value);
        }
    };

    const handleSubmit = () => {
        if (phone.length === 10) {
            onPhoneSubmit(phone);
        } else {
            toast({
                title: 'Invalid Phone Number',
                description: 'Please enter a valid 10-digit phone number.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Your Mobile Number</DialogTitle>
                    <DialogDescription>
                        A verification code will be sent to this number to complete your sign-in.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="phone-dialog">Mobile Number</Label>
                    <Input
                        id="phone-dialog"
                        type="tel"
                        placeholder="Your 10-digit mobile"
                        value={phone}
                        onChange={handlePhoneChange}
                        maxLength={10}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={phone.length !== 10}>Continue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const isPhone = /^\d{10}$/.test(identifier.replace(/\s/g, ''));
    
    if (isPhone) {
        const user = findUserByEmailOrPhone(identifier);
        if (user) {
            router.push(`/otp-verify?identifier=${encodeURIComponent(identifier)}&userId=${user.id}`);
        } else {
            toast({
                title: "User Not Found",
                description: "No account is associated with this phone number.",
                variant: "destructive"
            });
             setIsLoading(false);
        }
    } else { // Email login
        try {
            const firebaseUser = await signInWithEmail(identifier, password);
            let user = findUserById(firebaseUser.uid);
            
            // If user exists in Firebase but not locally, create a local profile.
            if (!user) {
                console.log("Local user not found, creating one.");
                user = createUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || identifier.split('@')[0], // Fallback name
                    email: identifier,
                });
            }

            // Redirect to OTP with user info
            const phoneIdentifier = user.phone ? `&identifier=${encodeURIComponent(user.phone)}` : '';
            router.push(`/otp-verify?userId=${user.id}${phoneIdentifier}`);

        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "An error occurred.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const gUser = await signInWithGoogle();
      if (gUser && gUser.email) {
        let appUser = findUserById(gUser.uid);
        
        if (!appUser) {
           appUser = createUser({
             id: gUser.uid,
             name: gUser.displayName || 'Google User',
             email: gUser.email,
           })
        }
        
        setGoogleUser(appUser);
        setIsPhoneDialogOpen(true);

      }
    } catch (error: any) {
      console.error(error);
       if (error.code === 'auth/unauthorized-domain') {
          toast({
            title: 'Domain Not Authorized',
            description: "This app's domain is not authorized for Google Sign-In. Please add it to the Firebase Console's authorized domains list.",
            variant: 'destructive',
            duration: 9000,
          });
        } else {
           toast({
            title: 'Sign In Failed',
            description: error.message || 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          });
        }
    }
  };

  const handlePhoneSubmitForGoogleUser = (phone: string) => {
    if (googleUser) {
        updateUserWithPhone(googleUser.id, phone);
        router.push(`/otp-verify?userId=${googleUser.id}&identifier=${encodeURIComponent(phone)}&isGoogleSignIn=true`);
    }
    setIsPhoneDialogOpen(false);
  };


  if (!isClient) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <Skeleton className="h-5 w-80 mx-auto mb-2" />
                    <Skeleton className="h-10 w-32 mx-auto" />
                </div>
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    <Skeleton className="h-4 w-20" />
                                </span>
                            </div>
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 <Skeleton className="h-5 w-64 mx-auto" />
            </div>
        </div>
    );
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
                  disabled={isLoading || /^\d{10}$/.test(identifier.replace(/\s/g, ''))}
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
      <PhoneEntryDialog 
        open={isPhoneDialogOpen}
        onOpenChange={setIsPhoneDialogOpen}
        onPhoneSubmit={handlePhoneSubmitForGoogleUser}
      />
    </div>
  );
}
