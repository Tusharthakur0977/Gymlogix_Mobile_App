export interface ExerciseResponse {
  status: number;
  data: ExerciseAPIData[];
}

export interface ExerciseAPIData {
  exercise_id: number;
  name: string;
  description: string;
  execution: string;
  preparation: string;
  instruction: any;
  images_urls: any[];
  movies_logo_url: string;
  movie_url: string;
  main_muscle: string;
  secondary_muscles: string[];
  mechanics: string;
  difficulty: string;
  type: string;
  equipment: string;
  force: string;
  user_id: any;
  is_public: boolean;
  created_at: any;
  updated_at: any;
  id: string;
}
