import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { QuizEngine } from '@/components/quiz/QuizEngine'

const prisma = new PrismaClient()

export default async function QuizPage({ params }: { params: { id: string } }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      quizQuestions: true
    }
  })

  if (!lesson) {
    notFound()
  }

  // If we haven't generated questions yet (placeholder)
  if (lesson.quizQuestions.length === 0) {
    // Generate dummy questions for testing if none exist
    const dummyQuestions = [
      {
        id: 'mock-1',
        questionText: 'What is the main purpose of this lesson?',
        options: [
          { text: 'To learn new concepts', isCorrect: true },
          { text: 'To take a nap', isCorrect: false },
          { text: 'To eat food', isCorrect: false },
          { text: 'To watch TV', isCorrect: false }
        ],
        conceptTag: 'Foundations',
      },
      {
        id: 'mock-2',
        questionText: 'How many hours are typically required?',
        options: [
          { text: '1 hour', isCorrect: false },
          { text: '5 hours', isCorrect: false },
          { text: '10 hours', isCorrect: false },
          { text: 'It depends', isCorrect: true }
        ],
        conceptTag: 'Time Management',
      }
    ]
    return <QuizEngine lessonId={lesson.id} initialQuestions={dummyQuestions} />
  }

  // Parse options if they are stored as JSON strings
  const formattedQuestions = lesson.quizQuestions.map(q => ({
    id: q.id,
    questionText: q.questionText,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    conceptTag: q.conceptTag || 'General'
  }))

  return <QuizEngine lessonId={lesson.id} initialQuestions={formattedQuestions} />
}
