import { inngest } from '../client'


export const generateQuizQuestions = inngest.createFunction(
  { id: 'generate-quiz-questions', triggers: [{ event: 'roadmap/quiz.generate' }] },
  async ({ event, step }) => {
    const { roadmapId } = event.data

    await step.run('generate-questions', async () => {
      // Placeholder — full Anthropic integration would generate quiz questions per lesson
      console.log(`Generating quiz questions for roadmap: ${roadmapId}`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    })

    return { success: true }
  }
)
