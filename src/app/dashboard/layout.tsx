'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  CalendarCheck,
  LayoutDashboard,
  Menu,
  Stethoscope,
  User,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/Logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/doctors', label: 'Find a Doctor', icon: Stethoscope },
  { href: '/dashboard/appointments', label: 'My Appointments', icon: CalendarCheck },
  { href: '/dashboard/recommend', label: 'AI Recommendation', icon: BrainCircuit },
];

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col gap-2', className)} {...props}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <MainNav className="p-2 lg:p-4" />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <div className="mb-4 flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                  <Logo />
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href="/login">
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">{children}</main>
      </div>
    </div>
  );
}
