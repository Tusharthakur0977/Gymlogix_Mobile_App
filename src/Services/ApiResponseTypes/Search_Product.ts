export interface SearchProductApiResponse {
  data: Data;
}

export interface Data {
  products: Products;
}

export interface Products {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  id: string;
  title: string;
  handle: string;
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
  altText?: string;
}
