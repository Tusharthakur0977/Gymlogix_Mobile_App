export interface UserResponse {
  status: number;
  user: User;
}

export interface User {
  google_id: any;
  gender: any;
  first_name: any;
  last_name: any;
  age: any;
  locale: string;
  email: string;
  password: string;
  pic_URL: any;
  signup_at: string;
  signin_at: any;
  platform: string;
  signup_type: string;
  device_id: string;
  is_premium: boolean;
  premium_expiration: any;
  user_type: string;
  email_verified_at: any;
  is_verified: boolean;
  personal_settings: PersonalSettings;
  user_id: number;
  updated_at: string;
  created_at: string;
  activated_plan: any[];
  id: string;
}

export interface PersonalSettings {
  height: any;
  height_measurement: any;
  workout_exp_years: any;
}
