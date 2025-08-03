
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  LogOut,
  Stethoscope,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getLoggedInDoctor, logoutDoctor } from '@/lib/doctor-auth';
import { useEffect, useState } from 'react';
import type { DoctorUser } from '@/lib/doctor-auth';

const navItems = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctor/dashboard/appointments', label: 'Appointments', icon: CalendarCheck },
  { href: '/doctor/dashboard/schedule', label: 'My Schedule', icon: Calendar },
  { href: '/doctor/dashboard/patients', label: 'My Patients', icon: Users },
  { href: '/doctor/dashboard/profile', label: 'Edit Profile', icon: User },
];

function NavItem({ href, label, icon: Icon }: (typeof navItems)[0]) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href) && (href !== '/doctor/dashboard' || pathname === href);
  return (
    <Link href={href} passHref>
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className="w-full justify-start"
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}

export function Sidebar() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);

  useEffect(() => {
    setDoctor(getLoggedInDoctor());
  }, []);

  const handleLogout = () => {
    logoutDoctor();
    router.push('/doctor/login');
  };

  if (!doctor) {
    return null;
  }

  return (
    <div className="hidden border-r bg-background md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-4">
          <Logo />
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>
                    <Stethoscope className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{doctor.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {doctor.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {doctor.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {doctor.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
