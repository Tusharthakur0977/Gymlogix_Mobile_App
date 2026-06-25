export interface forgotPasswordApiResponse {
  data: Data;
}

export interface Data {
  customerRecover: CustomerRecover;
}

export interface CustomerRecover {
  userErrors: any[];
}
