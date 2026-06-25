export interface ScheduleResponse {
  status: number;
  data: Data[];
  user_id: number;
}

export interface Data {
  type: string;
  status: string;
  schedule_at: string;
  content: Content;
  user_id: number;
  updated_at: string;
  created_at: string;
  id: string;
}

export interface Content {
  name: string;
  meal_id?: number;
  calories?: number;
  carbs?: number;
  fat?: number;
  protein?: number;
  food_list?: FoodList[];
  goal?: string;
  location?: string;
  comments: any;
  duration?: number;
  exercises?: Exercises;
}

export interface FoodList {
  food_id: number;
  serving_per: number;
}

export interface Exercises {
  finish_time: any;
  type: string;
  list: List;
}

export interface List {
  exercise_id: string;
  duration: number;
  comments: any;
  sets: Set[];
}

export interface Set {
  set_id: number;
  weight: number;
  reps: number;
  distance: number;
  time: number;
  weight_measurement: string;
  distance_measurement: string;
  dificulty: string;
  rest_time: number;
}
