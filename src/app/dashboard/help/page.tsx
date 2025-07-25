
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Phone, Mail, MapPin, Bot } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFaqAnswer } from '@/ai/flows/faq-flow';

const faqQuestions = [
  'What is Shedula?',
  'How do I cancel an appointment?',
  'Why can I not book an appointment?',
  'Why are there no appointment slots available?',
];

function FaqItem({ question }: { question: string }) {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = async () => {
    if (!isOpen && !answer) {
      setIsLoading(true);
      try {
        const result = await getFaqAnswer({ question });
        setAnswer(result.answer);
      } catch (error) {
        console.error('Failed to get FAQ answer:', error);
        setAnswer('Sorry, I could not find an answer to that question.');
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <AccordionItem value={question}>
      <AccordionTrigger onClick={handleToggle}>
        <span className="flex-1 text-left">{question}</span>
      </AccordionTrigger>
      <AccordionContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="flex gap-4">
             <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <p className="text-muted-foreground">{answer}</p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function HelpAndSupportPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <header className="bg-background p-4 flex items-center gap-4 border-b fixed top-0 left-0 right-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Help and support</h1>
      </header>
      <main className="flex-1 overflow-y-auto pt-20 p-4">
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="faq" className="pt-4">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqQuestions.map((q) => (
                <FaqItem key={q} question={q} />
              ))}
            </Accordion>
          </TabsContent>
          <TabsContent value="contact" className="pt-4">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Call us</p>
                    <a
                      href="tel:+19874561238"
                      className="text-muted-foreground"
                    >
                      +1 98745 61238
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="p-3 bg-primary/10 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Email us</p>
                    <a
                      href="mailto:support@shedula.com"
                      className="text-muted-foreground"
                    >
                      support@shedula.com
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-muted-foreground">
                      123 Health St, Wellness City, 54321
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
