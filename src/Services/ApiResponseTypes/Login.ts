export interface LoginApiResponse {
  customerAccessTokenCreate: CustomerAccessTokenCreate;
}

export interface CustomerAccessTokenCreate {
  customerAccessToken: CustomerAccessToken;
  userErrors: any[];
}

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}
