export interface UpdateCartApiResponse {
  cartLinesUpdate: CartLinesUpdate;
}

export interface CartLinesUpdate {
  cart: Cart;
  userErrors: any[];
}

export interface Cart {
  id: string;
  lines: Lines;
  estimatedCost: EstimatedCost;
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
}

export interface Attribute {
  key: string;
  value: string;
}

export interface EstimatedCost {
  totalAmount: TotalAmount;
}

export interface TotalAmount {
  amount: string;
  currencyCode: string;
}
