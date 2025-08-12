
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loginDoctor } from '@/lib/doctor-auth';
import { Skeleton } from '@/components/ui/skeleton';


export default function DoctorLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const doctor = await loginDoctor(email, password);
        toast({
            title: "Login Successful",
            description: `Welcome back, ${doctor.name}!`
        });
        router.push('/doctor/dashboard');
    } catch (error: any) {
        toast({
            title: "Invalid Credentials",
            description: error.message || "Please check your email and password.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
       <div className="w-full max-w-sm">
        <div className="text-center mb-8">
             <Skeleton className="h-8 w-32 mx-auto mb-2" />
             <Skeleton className="h-6 w-56 mx-auto" />
        </div>
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>

               <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              
              <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm">
            <Skeleton className="h-5 w-64 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
        <div className="text-center mb-8">
             <Logo className="mx-auto mb-2 text-3xl" />
            <h1 className="text-3xl font-bold">Doctor Login</h1>
             <p className="text-muted-foreground">Access your professional dashboard.</p>
        </div>
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

               <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm">
            Don&apos;t have a professional account?{' '}
            <Link href="/doctor/signup" className="font-medium text-primary hover:underline">
                Sign Up
            </Link>
            </div>
      </div>
  );
}
