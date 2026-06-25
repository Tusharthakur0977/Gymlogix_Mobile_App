export interface RecommendedProductsApiResponse {
  productRecommendations: ProductRecommendation[];
}

export interface ProductRecommendation {
  id: string;
  title: string;
  handle: string;
  images: Images;
  priceRange: PriceRange;
}

export interface Images {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  url: string;
  altText?: string;
}

export interface PriceRange {
  minVariantPrice: MinVariantPrice;
}

export interface MinVariantPrice {
  amount: string;
  currencyCode: string;
}
