import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'



export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || '00000000-0000-0000-0000-000000000002'

    const body = await req.json()
    const { lessonId, answers, timeTaken = 0 } = body

    if (!lessonId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Fetch actual questions from DB to get correct answers securely
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { quizQuestions: true }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // ------------------------------------------------------------------
    // Grading Logic
    // ------------------------------------------------------------------
    const dbQuestions = lesson.quizQuestions
    let correctCount = 0
    const incorrectAnswers: Array<{
      questionId: string
      userAnswer: string
      correctAnswer: string
      explanation: string
    }> = []
    const weakConceptTags = new Set<string>()

    for (const ans of answers) {
      const q = dbQuestions.find(q => q.id === ans.questionId)
      if (!q) continue

      // Options are stored as JSON: [{ text: string, isCorrect: boolean }]
      const options = q.options as Array<{ text: string; isCorrect: boolean }>
      const correctOption = options.find(o => o.isCorrect)
      const correctAnswerText = correctOption?.text ?? ''

      if (correctAnswerText === ans.selectedOption) {
        correctCount++
      } else {
        incorrectAnswers.push({
          questionId: q.id,
          userAnswer: ans.selectedOption,
          correctAnswer: correctAnswerText,
          explanation: q.explanation,
        })
        if (q.conceptTag) weakConceptTags.add(q.conceptTag)
      }
    }

    const totalQuestions = dbQuestions.length
    const score = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 100

    let result: 'MASTERED' | 'PASSED' | 'FAILED'
    if (score === 100) {
      result = 'MASTERED'
    } else if (score >= 70) {
      result = 'PASSED'
    } else {
      result = 'FAILED'
    }

    // ------------------------------------------------------------------
    // Persist results in a transaction
    // ------------------------------------------------------------------
    await prisma.$transaction(async (tx) => {
      // 1. Record the quiz attempt
      await tx.quizAttempt.create({
        data: {
          userId,
          lessonId,
          score,
          result,
          timeTaken,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          answers: answers as any,
        }
      })

      // 2. Promote lesson status (only ever forward, never downgrade)
      const statusOrder = ['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'NEEDS_RETRY', 'FAILED', 'PASSED', 'MASTERED']
      const currentRank = statusOrder.indexOf(lesson.status)
      const newRank = statusOrder.indexOf(result)
      if (newRank > currentRank) {
        await tx.lesson.update({
          where: { id: lessonId },
          data: { status: result, ...(result === 'MASTERED' ? { completedAt: new Date(), masteryLevel: 'FULL' } : {}) }
        })
      }

      // 3. Auto-generate an achievement for mastery
      if (result === 'MASTERED') {
        const achievement = await tx.achievement.create({
          data: {
            tier: 'MASTERY',
            name: `Mastered: ${lesson.title}`,
            description: `Scored 100% on the quiz for "${lesson.title}".`,
          }
        })
        await tx.userAchievement.create({
          data: { userId, achievementId: achievement.id }
        })
      }

      // 4. Log / upsert weaknesses
      for (const tag of Array.from(weakConceptTags)) {
        const existing = await tx.weaknessLog.findFirst({
          where: { userId, conceptTag: tag }
        })
        if (existing) {
          await tx.weaknessLog.update({
            where: { id: existing.id },
            data: {
              failureCount: existing.failureCount + 1,
              lastFailedAt: new Date(),
            }
          })
        } else {
          await tx.weaknessLog.create({
            data: {
              userId,
              conceptTag: tag,
              failureCount: 1,
            }
          })
        }
      }
    })

    return NextResponse.json({
      result,
      score,
      incorrectAnswers: result !== 'MASTERED' ? incorrectAnswers : undefined,
      weakConceptTags: result === 'FAILED' ? Array.from(weakConceptTags) : undefined,
    }, { status: 200 })

  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
