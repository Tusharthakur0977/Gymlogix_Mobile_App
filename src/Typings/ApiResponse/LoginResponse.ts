export interface LoginResponse {
  status: number;
  token: string;
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
  user_id: number;
  updated_at: string;
  created_at: string;
  id: string;
}
