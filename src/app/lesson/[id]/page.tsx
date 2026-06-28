import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { LessonPlayer } from '@/components/lesson/LessonPlayer'

const prisma = new PrismaClient()

export default async function LessonPage({ params }: { params: { id: string } }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      resources: true
    }
  })

  if (!lesson) {
    notFound()
  }

  // We map the dates/etc to string/primitive values if needed for client component serialization
  // But Prisma objects usually serialize fine if they don't have complex Date objects that cause issues
  // Resources only has string/boolean/number.

  return <LessonPlayer lesson={lesson} />
}
