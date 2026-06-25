export interface FetchCartApiResponse {
  cart: Cart;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  createdAt: string;
  updatedAt: string;
  lines: Lines;
  estimatedCost: EstimatedCost;
  attributes: any[];
}

export interface Lines {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  id: string;
  quantity: number;
  merchandise: Merchandise;
  attributes: Attribute[];
}

export interface Merchandise {
  id: string;
  title: string;
  price: Price;
  product: Product;
}

export interface Price {
  amount: string;
  currencyCode: string;
}

export interface Product {
  title: string;
  images: Images;
}

export interface Images {
  edges: Edge2[];
}

export interface Edge2 {
  node: Node2;
}

export interface Node2 {
  url: string;
  altText: any;
}

export interface Attribute {
  key: string;
  value: string;
}

export interface EstimatedCost {
  totalAmount: TotalAmount;
  subtotalAmount: SubtotalAmount;
  totalTaxAmount: any;
}

export interface TotalAmount {
  amount: string;
  currencyCode: string;
}

export interface SubtotalAmount {
  amount: string;
  currencyCode: string;
}