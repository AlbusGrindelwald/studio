
'use server';

/**
 * @fileOverview An AI agent that answers frequently asked questions about the Shedula app.
 *
 * - getFaqAnswer - A function that handles the FAQ answering process.
 * - GetFaqAnswerInput - The input type for the getFaqAnswer function.
 * - GetFaqAnswerOutput - The return type for the getFaqAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetFaqAnswerInputSchema = z.object({
  question: z.string().describe('The user\'s question about the Shedula app.'),
});
export type GetFaqAnswerInput = z.infer<typeof GetFaqAnswerInputSchema>;

const GetFaqAnswerOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type GetFaqAnswerOutput = z.infer<typeof GetFaqAnswerOutputSchema>;

export async function getFaqAnswer(
  input: GetFaqAnswerInput
): Promise<GetFaqAnswerOutput> {
  return getFaqAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getFaqAnswerPrompt',
  input: { schema: GetFaqAnswerInputSchema },
  output: { schema: GetFaqAnswerOutputSchema },
  prompt: `You are a friendly and helpful support agent for an appointment scheduling app called "Shedula".
  Your role is to answer user questions clearly and concisely.

  App Context:
  - Shedula is a mobile app for finding doctors and booking appointments.
  - Users can search for doctors, view their profiles, and see available time slots.
  - Users can book, reschedule, and cancel appointments.
  - Appointments can be rescheduled up to one hour before the scheduled time. If it's less than an hour, the user can only cancel.
  - The app uses an AI feature to recommend doctors based on symptoms.
  - The primary color of the app is Sea Serpent (#2BC8BE).
  - If slots aren't available, it's because the doctor is fully booked or hasn't published their schedule for that date.

  User's Question:
  "{{question}}"

  Based on the context provided, please generate a helpful and brief answer to the user's question.
  Frame your response as if you are directly communicating with the user.
  `,
});

const getFaqAnswerFlow = ai.defineFlow(
  {
    name: 'getFaqAnswerFlow',
    inputSchema: GetFaqAnswerInputSchema,
    outputSchema: GetFaqAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
