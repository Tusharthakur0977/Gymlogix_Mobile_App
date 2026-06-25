export interface CollectionProductsResponse {
  collectionByHandle: CollectionByHandle;
}

export interface CollectionByHandle {
  products: Products;
}

export interface Products {
  edges: Edge[];
  pageInfo: PageInfo;
}

export interface Edge {
  node: Node;
  cursor: string;
}

export interface Node {
  id: string;
  title: string;
  images: Images;
  variants: Variants;
}

export interface Images {
  edges: Edge2[];
}

export interface Edge2 {
  node: Node2;
}

export interface Node2 {
  altText: string;
  url: string;
}

export interface Variants {
  edges: Edge3[];
}

export interface Edge3 {
  node: Node3;
}

export interface Node3 {
  id: string;
  title: string;
  presentmentPrices: PresentmentPrices;
}

export interface PresentmentPrices {
  edges: Edge4[];
}

export interface Edge4 {
  node: Node4;
}

export interface Node4 {
  price: Price;
}

export interface Price {
  amount: string;
  currencyCode: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
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
