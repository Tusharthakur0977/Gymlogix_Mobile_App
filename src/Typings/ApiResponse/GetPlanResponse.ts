export interface GetPlanResponse {
  status: number;
  data: Data[];
}

export interface Data {
  _id?: string;
  id: any;
  created_at: string;
  updated_at: string;
  user_id: number;
  name?: string;
  image_url: string;
  is_premium: boolean;
  is_public: boolean;
  type: string;
  content: Content;
  tags: string[];
  plan_id?: number;
}

export interface Content {
  goal?: string;
  details?: string;
  instructions: any;
  days_per_week?: string;
  type?: string;
  location: string;
  duration: string;
  difficulty?: string;
  associate_food_plan?: number;
  workouts?: Workout[];
  tags: string[];
  description?: string;
  calories_per_day: any;
  dietry_type?: string;
  meals_per_day?: string;
  carbs_per_day: any;
  fats_per_day: any;
  protien_per_day: any;
  associate_workout_plan?: string;
  protein_per_day: any;
  meals?: Meal[];
}

export interface Workout {
  workout_id: number;
  name: string;
  color?: string;
  rest_period: any;
  comments: any;
  exercises: Exercise[];
}

export interface Exercise {
  type: string;
  warmup_cycle_timing: number;
  between_exercise_timing: number;
  full_cycle_timing: number;
  workout_exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  exercise_id: number;
  sets: number;
  reps: any;
  strategy: string;
  timing_warmup: number;
  timing_workset: number;
  timing_finish: number;
  Is_time: boolean;
  is_weight: boolean;
  Is_distance: boolean;
  alternate_exercise_id: any[];
}

export interface Meal {
  meal_id: number;
  color: string;
  filters: string[];
}
