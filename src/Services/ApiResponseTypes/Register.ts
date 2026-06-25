export interface RegisterApiResponse {
  customerCreate: CustomerCreate;
}

export interface CustomerCreate {
  customer: any;
  customerUserErrors: CustomerUserError[];
}

export interface CustomerUserError {
  field: string[];
  message: string;
  code: string;
}
