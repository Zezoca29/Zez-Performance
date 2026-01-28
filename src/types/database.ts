export type WorkoutType = 'strength' | 'cardio' | 'functional' | 'sports' | 'flexibility' | 'other'
export type DayStatus = 'clean' | 'free' | 'partial'
export type BookStatus = 'reading' | 'completed' | 'paused' | 'abandoned'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold'

export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  timezone: string
  hydration_goal_ml: number
  created_at: string
}

export interface HydrationLog {
  id: string
  user_id: string
  amount_ml: number
  date: string
  created_at: string
}

export interface RoutineTemplate {
  id: string
  user_id: string
  title: string
  days_of_week: number[]
  is_active: boolean
  order_index: number
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  template_id: string | null
  title: string
  date: string
  is_completed: boolean
  is_routine: boolean
  created_at: string
}

export interface GymSession {
  id: string
  user_id: string
  date: string
  workout_type: WorkoutType
  duration_minutes: number | null
  notes: string | null
  created_at: string
}

export interface DietLog {
  id: string
  user_id: string
  date: string
  description: string
  is_on_diet: boolean
  created_at: string
}

export interface DietDailyStatus {
  id: string
  user_id: string
  date: string
  status: DayStatus
}

export interface Book {
  id: string
  user_id: string
  title: string
  author: string | null
  total_pages: number
  current_page: number
  status: BookStatus
  created_at: string
}

export interface ReadingLog {
  id: string
  user_id: string
  book_id: string
  pages_read: number
  date: string
  created_at: string
}

export interface FinanceCategory {
  id: string
  user_id: string
  name: string
  icon: string | null
  color: string | null
  budget_limit: number | null
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  description: string
  date: string
  created_at: string
}

export interface Skill {
  id: string
  user_id: string
  name: string
  level: SkillLevel
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  skill_id: string
  name: string
  status: ProjectStatus
  created_at: string
}

export interface Delivery {
  id: string
  user_id: string
  project_id: string
  title: string
  is_completed: boolean
  created_at: string
}
