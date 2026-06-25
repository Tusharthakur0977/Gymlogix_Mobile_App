export interface MealResponse {
  status: number;
  data: Data[];
}

export interface Data {
  meal_id: number;
  is_public: boolean;
  is_deleted: boolean;
  user_id: number;
  group_id?: number;
  name: string;
  image_url: string;
  color?: string;
  description: string;
  preparation_duration: number;
  preparation_method: string;
  cuisine_style: string;
  flavor_profile: string;
  meal_complexity: string;
  preparation_instructions: string;
  calories: any;
  carbs: any;
  fats: any;
  protein: any;
  foods: Food[];
  updated_at: string;
  category: string;
  tags: string[];
  id: string;
}

export interface Food {
  food_id: number;
  amount_g: any;
  calories?: number;
  carbs?: number;
  fats?: number;
  protein?: number;
  serving_size?: string;
  measurement?: string;
}
