import { serve } from 'inngest/next'
import { inngest } from '@/server/inngest/client'
import { generateQuizQuestions } from '@/server/inngest/functions/generate-quiz'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateQuizQuestions,
  ],
})
