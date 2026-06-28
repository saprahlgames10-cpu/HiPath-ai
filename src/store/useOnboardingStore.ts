import { create } from 'zustand'

export type TimelineOption = '4_weeks' | '8_weeks' | '12_weeks' | '6_months' | '12_months'
export type HoursOption = '3_5' | '5_10' | '10_15' | '15_plus'
export type LevelOption = 'beginner' | 'some_experience' | 'experienced'
export type FormatOption = 'video' | 'article' | 'exercise' | 'project' | 'course'

interface OnboardingState {
  goal: string
  timeline: TimelineOption | null
  hoursPerWeek: HoursOption | null
  level: LevelOption | null
  formats: FormatOption[]
  
  setGoal: (goal: string) => void
  setTimeline: (timeline: TimelineOption) => void
  setHoursPerWeek: (hours: HoursOption) => void
  setLevel: (level: LevelOption) => void
  toggleFormat: (format: FormatOption) => void
  
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  goal: '',
  timeline: null,
  hoursPerWeek: null,
  level: null,
  formats: [],
  
  setGoal: (goal) => set({ goal }),
  setTimeline: (timeline) => set({ timeline }),
  setHoursPerWeek: (hoursPerWeek) => set({ hoursPerWeek }),
  setLevel: (level) => set({ level }),
  toggleFormat: (format) => set((state) => ({
    formats: state.formats.includes(format) 
      ? state.formats.filter(f => f !== format)
      : [...state.formats, format]
  })),
  
  reset: () => set({
    goal: '',
    timeline: null,
    hoursPerWeek: null,
    level: null,
    formats: [],
  })
}))
