import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { RoadmapSchema } from '@/types/roadmap'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/server/inngest/client'
import { createClient } from '@/lib/supabase/server'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://hipath-ai.vercel.app',
    'X-Title': 'HiPath AI',
  },
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // For local testing without auth, you can mock the userId if user is null
    const userId = user?.id || '00000000-0000-0000-0000-000000000002' // fallback for demo purposes

    const body = await req.json()
    const { goal, timeline, hoursPerWeek, level, formats } = body

    if (!goal || !timeline || !hoursPerWeek || !level || !formats) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const systemPrompt = `You are a world-class learning architect. Generate a highly structured, week-by-week learning roadmap for the following user.
    Goal: ${goal}
    Timeline: ${timeline.replace('_', ' ')}
    Hours per week: ${hoursPerWeek.replace('_', ' ')}
    Knowledge Level: ${level.replace('_', ' ')}
    Preferred Formats: ${formats.join(', ')}

    Return ONLY valid JSON matching the exact schema below. Do not include markdown blocks or any other text.
    {
      "title": "string (Catchy title for the roadmap)",
      "skillPrerequisites": ["string"],
      "weeks": [
        {
          "weekNumber": number (sequential, starting at 1),
          "theme": "string (Theme of the week)",
          "lessons": [
            {
              "title": "string",
              "description": "string",
              "estimatedMins": number (approximate time in minutes),
              "conceptTags": ["string"],
              "resources": [
                {
                  "title": "string",
                  "url": "string (A placeholder valid URL if you don't have an exact one, e.g. https://example.com/topic)",
                  "type": "VIDEO | ARTICLE | COURSE | BOOK | PROJECT | DOCUMENTATION",
                  "platform": "string",
                  "isPaid": boolean,
                  "durationMins": number
                }
              ]
            }
          ]
        }
      ]
    }`

    // We will attempt generation up to 2 times
    let generatedJson: unknown = null
    let attempts = 0
    let lastError = null

    while (attempts < 2) {
      try {
        const completion = await client.chat.completions.create({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            {
              role: 'system',
              content: 'You output strictly valid JSON matching the requested schema. No markdown formatting, no code blocks, just raw JSON.'
            },
            {
              role: 'user',
              content: systemPrompt
            }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        })

        let content = completion.choices[0]?.message?.content || ''

        // Strip markdown code blocks if the model wrapped the JSON
        content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim()

        // Attempt to parse json
        generatedJson = JSON.parse(content)

        // Validate with Zod
        RoadmapSchema.parse(generatedJson)
        break // Success
      } catch (err: unknown) {
        lastError = err
        attempts++
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error(`Attempt ${attempts} failed:`, errorMsg)
      }
    }

    if (!generatedJson) {
      console.error("Failed to generate valid JSON roadmap after 2 attempts", lastError)
      return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 })
    }

    const validatedData = generatedJson as z.infer<typeof RoadmapSchema>

    // Write to DB in a single transaction
    const createdRoadmap = await prisma.$transaction(async (tx) => {
      const roadmap = await tx.roadmap.create({
        data: {
          userId,
          title: validatedData.title,
          goalText: goal,
          timeline: validatedData.weeks.length,
          skillLevel: level,
          status: 'ACTIVE',
        }
      })

      for (const week of validatedData.weeks) {
        const createdWeek = await tx.roadmapWeek.create({
          data: {
            roadmapId: roadmap.id,
            weekNumber: week.weekNumber,
            theme: week.theme,
            status: week.weekNumber === 1 ? 'AVAILABLE' : 'LOCKED', // Unlock first week
          }
        })

        for (let i = 0; i < week.lessons.length; i++) {
          const lesson = week.lessons[i]
          const createdLesson = await tx.lesson.create({
            data: {
              weekId: createdWeek.id,
              title: lesson.title,
              description: lesson.description,
              estimatedMins: lesson.estimatedMins,
              position: i + 1,
              status: week.weekNumber === 1 && i === 0 ? 'AVAILABLE' : 'LOCKED',
            }
          })

          for (const resource of lesson.resources) {
            await tx.resource.create({
              data: {
                lessonId: createdLesson.id,
                title: resource.title,
                url: resource.url,
                type: resource.type,
                platform: resource.platform,
                isPaid: resource.isPaid,
                durationMins: resource.durationMins || null,
              }
            })
          }
        }
      }

      return roadmap
    })

    // Enqueue background job to generate quiz questions
    await inngest.send({
      name: 'roadmap/quiz.generate',
      data: {
        roadmapId: createdRoadmap.id
      }
    })

    return NextResponse.json({ roadmapId: createdRoadmap.id }, { status: 200 })

  } catch (error) {
    console.error('Error generating roadmap:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
