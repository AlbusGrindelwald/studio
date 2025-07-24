
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Doctor } from '@/lib/types';

interface ReviewDialogProps {
  doctor: Doctor;
  trigger: React.ReactNode;
}

export function ReviewDialog({ doctor, trigger }: ReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const { toast } = useToast();

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log({
        doctorId: doctor.id,
        rating,
        review,
    });

    toast({
      title: 'Review Submitted!',
      description: `Thank you for leaving a review for ${doctor.name}.`,
    });

    setIsOpen(false);
    setRating(0);
    setReview('');
  };
  
  const handleStarClick = (index: number) => {
    setRating(index);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review for {doctor.name}</DialogTitle>
          <DialogDescription>
            Share your experience to help other patients.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <p className="font-medium">Your Rating</p>
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((index) => (
                <Star
                  key={index}
                  className={cn(
                    "h-8 w-8 cursor-pointer transition-colors",
                    (hoverRating || rating) >= index
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground"
                  )}
                  onMouseEnter={() => setHoverRating(index)}
                  onClick={() => handleStarClick(index)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Your Review</p>
            <Textarea
              placeholder="Tell us about your experience..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmitReview}>Submit Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
