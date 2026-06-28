'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ArrowRight, Loader2, RotateCcw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type QuizQuestion = {
  id: string
  questionText: string
  options: Array<{ text: string; isCorrect: boolean }>
  conceptTag: string
}

type QuizResult = {
  status: 'MASTERED' | 'PASSED' | 'FAILED'
  score: number
  incorrectAnswers?: {
    questionId: string
    userAnswer: string
    correctAnswer: string
    explanation: string
  }[]
  weakConceptTags?: string[]
}

export function QuizEngine({ lessonId, initialQuestions }: { lessonId: string, initialQuestions: QuizQuestion[] }) {
  const router = useRouter()
  
  // State
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const hasAnsweredCurrent = !!answers[currentQuestion?.id]
  const progressPercent = ((currentIndex) / questions.length) * 100

  const handleSelectOption = (optionText: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionText
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // In a real app, this posts to our /api/quiz/submit endpoint
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption
          }))
        })
      })

      if (!response.ok) throw new Error('Submission failed')

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error(err)
      // Fallback mock result for testing if API not ready
      alert("Failed to submit quiz.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetryMissed = () => {
    if (!result?.incorrectAnswers) return
    const missedIds = result.incorrectAnswers.map(ans => ans.questionId)
    const missedQuestions = initialQuestions.filter(q => missedIds.includes(q.id))
    
    setQuestions(missedQuestions)
    setCurrentIndex(0)
    setAnswers({})
    setResult(null)
  }

  if (!currentQuestion && !result) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (result) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-card rounded-2xl shadow-sm border p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4">
          
          {result.status === 'MASTERED' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 text-accent mx-auto">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-heading font-bold text-accent">Mastered!</h1>
              <p className="text-xl text-muted-foreground">Perfect score. You fully understand this concept.</p>
              <button 
                onClick={() => router.push(`/dashboard`)}
                className="mt-8 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold text-lg hover:bg-primary/90"
              >
                Continue Learning
              </button>
            </div>
          )}

          {result.status === 'PASSED' && (
            <div className="space-y-6">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 text-success mx-auto mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-heading font-bold">Passed</h1>
                <p className="text-muted-foreground">You got {result.score}% right. Review what you missed.</p>
              </div>

              <div className="space-y-6">
                {result.incorrectAnswers?.map((item, i) => (
                  <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
                    <p className="font-medium mb-4">You answered:</p>
                    <div className="flex items-center gap-3 text-destructive mb-2">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="line-through">{item.userAnswer}</span>
                    </div>
                    <div className="flex items-center gap-3 text-success font-medium mb-4">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{item.correctAnswer}</span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-background p-4 rounded-lg border">{item.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex justify-center">
                <button 
                  onClick={handleRetryMissed}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90"
                >
                  <RotateCcw className="w-5 h-5" /> Retry Missed Questions
                </button>
              </div>
            </div>
          )}

          {result.status === 'FAILED' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/20 text-destructive mx-auto">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-heading font-bold text-destructive">Needs Review</h1>
              <p className="text-xl text-muted-foreground">You scored {result.score}%. It seems you struggled with these concepts:</p>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {result.weakConceptTags?.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-muted rounded-full text-sm font-semibold">{tag}</span>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t">
                <p className="text-muted-foreground mb-6">We recommend reviewing a different resource format before trying again.</p>
                <button 
                  onClick={() => router.push(`/lesson/${lessonId}`)}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold text-lg hover:bg-primary/90"
                >
                  Return to Lesson
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <div className="w-full h-1 bg-muted fixed top-0 left-0 z-50">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-6 flex justify-between items-center mt-4">
        <button 
          onClick={() => confirm('Are you sure you want to exit? Your progress will be lost.') && router.back()}
          className="text-muted-foreground hover:text-foreground font-medium text-sm"
        >
          &times; Exit Quiz
        </button>
        <div className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentQuestion.id}>
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((opt, i: number) => {
              const isSelected = answers[currentQuestion.id] === opt.text
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt.text)}
                  className={cn(
                    "w-full p-6 text-left border-2 rounded-xl transition-all duration-200 text-lg",
                    isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm" : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-transparent"
                    )}>
                      {isSelected && <CheckCircle className="w-5 h-5" />}
                    </div>
                    <span>{opt.text}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-12 flex justify-end">
            <button
              disabled={!hasAnsweredCurrent || isSubmitting}
              onClick={handleNext}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-primary/90 disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              ) : isLastQuestion ? (
                "Submit Quiz"
              ) : (
                <><ArrowRight className="w-5 h-5" /> Next Question</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
