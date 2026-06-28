import { z } from 'zod'

export const ResourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  type: z.enum(['VIDEO', 'ARTICLE', 'COURSE', 'BOOK', 'PROJECT', 'DOCUMENTATION']),
  platform: z.string(),
  isPaid: z.boolean(),
  durationMins: z.number().int().positive().nullable()
})

export const LessonSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  estimatedMins: z.number().int().positive(),
  conceptTags: z.array(z.string()),
  resources: z.array(ResourceSchema).min(1).max(3)
})

export const WeekSchema = z.object({
  weekNumber: z.number().int().positive(),
  theme: z.string(),
  lessons: z.array(LessonSchema).min(1)
})

export const RoadmapSchema = z.object({
  title: z.string(),
  skillPrerequisites: z.array(z.string()),
  weeks: z.array(WeekSchema).min(1)
})

export type GeneratedRoadmap = z.infer<typeof RoadmapSchema>
