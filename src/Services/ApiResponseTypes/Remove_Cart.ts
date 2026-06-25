export interface RemoveCartApiResponse {
  cartLinesRemove: CartLinesRemove;
}

export interface CartLinesRemove {
  cart: Cart;
  userErrors: UserError[];
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
}

export interface Merchandise {
  id: string;
  title: string;
}

export interface EstimatedCost {
  totalAmount: TotalAmount;
}

export interface TotalAmount {
  amount: string;
  currencyCode: string;
}

export interface UserError {
  field: string[];
  message: string;
}
