
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, CalendarCheck, CheckCheck, Trash2, XCircle } from 'lucide-react';
import { getNotifications, markAllAsRead, subscribe, clearAllNotifications } from '@/lib/notifications';
import type { Notification } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'success':
      return <CalendarCheck className="h-6 w-6 text-green-500" />;
    case 'destructive':
      return <XCircle className="h-6 w-6 text-red-500" />;
    case 'info':
      return <Bell className="h-6 w-6 text-blue-500" />;
    default:
      return <Bell className="h-6 w-6 text-muted-foreground" />;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleNotificationsChange = () => {
      setNotifications(getNotifications());
    };
    
    const unsubscribe = subscribe(handleNotificationsChange);
    handleNotificationsChange(); // initial fetch

    setIsClient(true);
    
    return () => unsubscribe();
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };
  
  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <header className="bg-background p-4 flex items-center justify-between border-b fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
        <div className='flex items-center gap-2'>
            {hasUnread && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark all as read
                </Button>
            )}
             {notifications.length > 0 && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear All
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all of your notifications. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearAll}>Confirm</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
             )}
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto pt-20 p-4 space-y-3">
        {isClient && notifications.length > 0 ? (
          notifications.map(notification => (
            <Card key={notification.id} className={cn(!notification.read ? 'bg-primary/5 border-primary/20' : 'bg-card')}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={cn("p-2 rounded-full", !notification.read && 'bg-primary/10')}>
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-2"></div>}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No Notifications</h2>
            <p className="mt-2 text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </main>
    </div>
  );
}
