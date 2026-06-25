export interface ShopPoliciesApiResponse {
  shop: Shop;
}

export interface Shop {
  privacyPolicy: PrivacyPolicy;
  refundPolicy: RefundPolicy;
  termsOfService: TermsOfService;
  shippingPolicy: ShippingPolicy;
  subscriptionPolicy: any;
}

export interface PrivacyPolicy {
  title: string;
  body: string;
  url: string;
}

export interface RefundPolicy {
  title: string;
  body: string;
  url: string;
}

export interface TermsOfService {
  title: string;
  body: string;
  url: string;
}

export interface ShippingPolicy {
  title: string;
  body: string;
  url: string;
}
