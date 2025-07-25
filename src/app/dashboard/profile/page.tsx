
'use client';

import {
  ArrowLeft,
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Pencil,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getLoggedInUser, logoutUser, subscribe } from '@/lib/user';
import type { User } from '@/lib/user';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleUserChange = () => {
        setUser(getLoggedInUser());
    }

    const unsubscribe = subscribe(handleUserChange);
    handleUserChange(); // Initial fetch
    setIsClient(true);

    return () => unsubscribe();
  }, []);

  const menuItems = [
    { icon: Bell, text: 'Notification', href: '/dashboard/notifications' },
    { icon: HelpCircle, text: 'Help and support', href: '/dashboard/help' },
    { icon: Users, text: 'Invite friends', href: '#' },
  ];

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  if (!isClient) {
     return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <header className="bg-background p-4 flex items-center gap-4 border-b fixed top-0 left-0 right-0 z-10">
               <Skeleton className="h-8 w-8 rounded-md" />
               <Skeleton className="h-6 w-24" />
            </header>
            <main className="flex-1 overflow-y-auto pt-20 p-4 space-y-6">
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                    </div>
                </Card>
                <Card className="p-2 space-y-1">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </Card>
                <Card className="p-2">
                    <Skeleton className="h-12 w-full" />
                </Card>
            </main>
        </div>
     )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="bg-background p-4 flex items-center gap-4 border-b fixed top-0 left-0 right-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      <main className="flex-1 overflow-y-auto pt-20 p-4 space-y-6">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                <UserIcon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-bold text-lg">{user?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground">
                {user?.email || 'youremail@gmail.com'}
              </p>
               <p className="text-sm text-muted-foreground">
                {user?.phone || 'No phone number'}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Pencil className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </Card>

        <Card className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.text}>
                <Link
                  href={item.href}
                  className="flex items-center gap-4 p-3 rounded-md hover:bg-accent"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium">
                    {item.text}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 p-3 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </Card>
      </main>
    </div>
  );
}
