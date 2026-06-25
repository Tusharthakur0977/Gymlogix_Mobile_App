export interface ProductDetailResponse {
  product: Product;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: Images;
  variants: Variants;
  metafields: Metafields;
}

export interface Images {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  altText: string;
  url: string;
}

export interface Variants {
  edges: Edge2[];
}

export interface Edge2 {
  node: Node2;
}

export interface Node2 {
  id: string;
  title: string;
  sku: string;
  presentmentPrices: PresentmentPrices;
}

export interface PresentmentPrices {
  edges: Edge3[];
}

export interface Edge3 {
  node: Node3;
}

export interface Node3 {
  price: Price;
}

export interface Price {
  amount: string;
  currencyCode: string;
}

export interface Metafields {
  edges: Edge4[];
}

export interface Edge4 {
  node: Node4;
}

export interface Node4 {
  key: string;
  value: string;
}

export interface Extensions {
  cost: Cost;
}

export interface Cost {
  requestedQueryCost: number;
  actualQueryCost: number;
  throttleStatus: ThrottleStatus;
}

export interface ThrottleStatus {
  maximumAvailable: number;
  currentlyAvailable: number;
  restoreRate: number;
}
