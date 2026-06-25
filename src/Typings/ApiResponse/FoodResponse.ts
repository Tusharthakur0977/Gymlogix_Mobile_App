export interface FoodResponse {
  status: number;
  data: Data[];
}

export interface Data {
  food_id: number;
  user_id?: number;
  created_at: string;
  updated_at: string;
  name: string;
  category?: string;
  image_url: string;
  description?: string;
  image_urls: string[];
  serving_size_amount: number;
  serving_size_measurement: string;
  serving_weight_grams: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  gluten_free?: boolean;
  dairy_free?: boolean;
  nut_free?: boolean;
  soy_free?: boolean;
  egg_free?: boolean;
  is_vegan?: boolean;
  is_paleo?: boolean;
  is_halal?: boolean;
  is_kosher?: boolean;
  is_public: boolean;
  id: string;
  instruction: any;
  is_deleted?: boolean;
}
