export interface AddCustomerAddressApiResponse {
  customerAddressCreate: CustomerAddressCreate;
}

export interface CustomerAddressCreate {
  customerAddress: CustomerAddress;
  customerUserErrors: any[];
  userErrors: any[];
}

export interface CustomerAddress {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  address1: string;
  address2: any;
  city: string;
  company: any;
  country: string;
  countryCodeV2: string;
  province: string;
  provinceCode: string;
  zip: string;
}
