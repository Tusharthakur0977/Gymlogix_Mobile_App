export interface CreateCartApiResponse {
  cartCreate?: CartCreate;
}

export interface CartCreate {
  cart: Cart;
  userErrors: UserError[];
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  lines: Lines;
  estimatedCost?: EstimatedCost;
}

export interface Lines {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  id: string;
  merchandise: Merchandise;
  quantity: number;
}

export interface Merchandise {
  id: string;
  title: string;
  product?: {
    title: string;
  };
}

export interface EstimatedCost {
  totalAmount: Amount;
  subtotalAmount: Amount;
}

export interface Amount {
  amount: string;
  currencyCode: string;
}

export interface UserError {
  field?: string[];
  message: string;
}
