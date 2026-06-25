import { getLocalStorageData } from "../Utilities/Helpers";
import { AddCustomerAddressApiResponse } from "./ApiResponseTypes/Add_Customer_Address";
import { AddToCartApiResponse } from "./ApiResponseTypes/Add_To_Cart";
import { CollectionListResponse } from "./ApiResponseTypes/Collection_List";
import { CollectionProductsResponse } from "./ApiResponseTypes/Collection_Product_List";
import { CreateCartApiResponse } from "./ApiResponseTypes/Create_Cart";
import { FetchCartApiResponse } from "./ApiResponseTypes/Fetch_Cart";
import { forgotPasswordApiResponse } from "./ApiResponseTypes/ForgotPassword";
import { LoginApiResponse } from "./ApiResponseTypes/Login";
import { ProductDetailResponse } from "./ApiResponseTypes/Product_Detail";
import { RecommendedProductsApiResponse } from "./ApiResponseTypes/Reccomended_Products";
import { RegisterApiResponse } from "./ApiResponseTypes/Register";
import { RemoveCartApiResponse } from "./ApiResponseTypes/Remove_Cart";
import { SearchProductApiResponse } from "./ApiResponseTypes/Search_Product";
import { ShopPoliciesApiResponse } from "./ApiResponseTypes/Shop_Policies";
import { UpdateCartApiResponse } from "./ApiResponseTypes/Update_Cart";
import { API_ENDPOINTS } from "./endPoints";
import graphqlApi, { graphqlAuthApi } from "./graphqlApi";
import STORAGE_KEYS from "./StorageKeys";

// Fetch collections
export const fetchCollectionsList = async (
  first: number = 250,
  after: string | null = null,
  handle: string | null = null
) => {
  const query = `
   query CustomCollectionList($first: Int!, $after: String) {
  collections(first: $first, after: $after) {
    nodes {
      id
      handle
      title      
      descriptionHtml
      image {            
            originalSrc            
        }      
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

  const variables = { first, after, handle };

  return graphqlApi.query<CollectionListResponse>(
    API_ENDPOINTS.COLLECTION_LIST,
    query,
    variables
  );
};

// Fetch Collection Products
export const fetchCollectionProducts = async (
  handle: string,
  first: number = 50,
  after: string | null = null
) => {
  const query = `
    query collectionByHandle($handle: String!, $first: Int!, $after: String) {
      collectionByHandle(handle: $handle) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              images(first: 10) {
                edges {
                  node {
                    altText
                    url
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    presentmentPrices(first: 1) {
                      edges {
                        node {
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }          
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const variables = { handle, first, after };

  return graphqlApi.query<CollectionProductsResponse>(
    API_ENDPOINTS.COLLECTION_PRODUCTS_LIST,
    query,
    variables
  );
};

// Fetch Product Details
export const fetchProductDetails = async (
  productId: string,
  after: string | null = null
) => {
  const query = `
    query GetProductDetails($productId: ID!) {
      product(id: $productId) {
        id
        title
        tags
        description
        images(first: 10) {
          edges {
            node { 
              altText          
              url
            }
          }
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              sku        
              presentmentPrices(first: 1) {
                edges {
                  node {
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }         
            }
          }
        }
        metafields(first: 100) { 
          edges {
            node {
              key
              value            
            }
          }
        }
      }
    }
  `;

  const variables = { productId };

  return graphqlApi.query<ProductDetailResponse>(
    API_ENDPOINTS.PRODUCT_DETAILS,
    query,
    variables
  );
};

// Login Customer
export const loginCustomer = async (email: string, password: string) => {
  const mutation = `
    mutation LoginCustomer($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      email,
      password,
    },
  };

  return graphqlAuthApi.mutate<LoginApiResponse>(
    API_ENDPOINTS.LOGIN,
    mutation,
    variables
  );
};

// register Api response
export const registerUserApi = async (inputFields: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  acceptsMarketing: boolean;
}) => {
  const query = `
 mutation customerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer {
      id
      firstName
      lastName
      email
      phone
      acceptsMarketing
    }
    customerUserErrors {
      field
      message
      code
    }
  }
}
  `;

  const variables = {
    input: inputFields,
  };

  return graphqlAuthApi.mutate<RegisterApiResponse>(
    API_ENDPOINTS.REGISTER,
    query,
    variables
  );
};

// Forgot Password
export const forgotPasswordApi = async (email: string) => {
  const query = `
 mutation ForgotPassword($email: String!) {
  customerRecover(email: $email) {
    userErrors {
      field
      message
    }
  }
}
  `;

  const variables = {
    email,
  };

  return graphqlAuthApi.mutate<forgotPasswordApiResponse>(
    API_ENDPOINTS.FORGOT_PASSWORD,
    query,
    variables
  );
};

// Fetch Cart
export const fetchCart = async (cartId: string) => {
  const query = `
   query GetCart($cartId: ID!) { cart(id: $cartId) { id checkoutUrl createdAt updatedAt lines(first: 10) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title images(first: 1) { edges { node { url altText } } } } } } attributes { key value } } } } estimatedCost { totalAmount { amount currencyCode } subtotalAmount { amount currencyCode } totalTaxAmount { amount currencyCode } } attributes { key value } } }
  `;

  const variables = {
    cartId,
  };

  return graphqlApi.query<FetchCartApiResponse>(
    API_ENDPOINTS.FETCH_CART,
    query,
    variables
  );
};

// Update Cart
export const updateCart = async (
  cartId: string,
  lineId: string,
  quantity: number
) => {
  const query = `
    mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart {
      id
      lines(first: 10) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
              }
            }
            attributes {
              key
              value
            }
          }
        }
      }
      estimatedCost {
        totalAmount {
          amount
          currencyCode
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}

  `;

  const variables = {
    cartId,
    lines: [
      {
        id: lineId,
        quantity,
      },
    ],
  };

  return graphqlApi.mutate<UpdateCartApiResponse>(
    API_ENDPOINTS.UPDATE_CART,
    query,
    variables
  );
};

// Create Cart
export const createCart = async (merchandiseId: string, quantity: number) => {
  const query = `
  mutation CreateCart($input: CartInput) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      lines(first: 10) {
        edges {
          node {
            id
            merchandise {
              ... on ProductVariant {
                id
                title
              }
            }
            quantity
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
  `;

  const token = await getLocalStorageData(STORAGE_KEYS.accessToken);

  const variables = {
    input: {
      buyerIdentity: {
        customerAccessToken: token,
      },
      lines: [
        {
          merchandiseId,
          quantity,
        },
      ],
    },
  };

  return graphqlApi.mutate<CreateCartApiResponse>(
    API_ENDPOINTS.CREATE_CART,
    query,
    variables
  );
};

// Remove Cart
export const removeCart = async (cartId: string, lineIds: string[]) => {
  const query = `
  mutation RemoveCartItem($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
      id
      lines(first: 10) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
              }
            }
          }
        }
      }
      estimatedCost {
        totalAmount {
          amount
          currencyCode
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
  `;

  const variables = {
    cartId,
    lineIds,
  };

  return graphqlApi.mutate<RemoveCartApiResponse>(
    API_ENDPOINTS.REMOVE_CART,
    query,
    variables
  );
};

// Add To Cart
export const addToCart = async (
  cartId: string,
  merchandiseId: string,
  quantity: number
) => {
  const query = `
mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      lines(first: 10) {
        edges {
          node {
            id
            merchandise {
              ... on ProductVariant {
                id
                title
              }
            }
            quantity
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
  `;

  const variables = {
    cartId,
    lines: [
      {
        merchandiseId,
        quantity,
      },
    ],
  };

  return graphqlApi.mutate<AddToCartApiResponse>(
    API_ENDPOINTS.ADD_TO_CART,
    query,
    variables
  );
};

// Add Customer Address
export const addCustomerAddress = async (
  customerAccessToken: string,
  address: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    zip: string;
    country: string;
    phone: string;
  }
) => {
  const mutation = `
          mutation customerAddressCreate($address: MailingAddressInput!, $customerAccessToken: String!) {
  customerAddressCreate(address: $address, customerAccessToken: $customerAccessToken) {
    customerAddress {
        id
        firstName
        lastName
        name
        phone
        address1
        address2
        city
        company
        country
        countryCodeV2
        province
        provinceCode
        zip
    }
    customerUserErrors {
        field
        message
    }
    userErrors {
      field
      message
    }
  }
}
  `;

  const variables = {
    customerAccessToken,
    address,
  };

  try {
    console.log("Adding customer address with token:", customerAccessToken);
    return await graphqlAuthApi.mutate<AddCustomerAddressApiResponse>(
      API_ENDPOINTS.ADD_CUSTOMER_ADDRESS,
      mutation,
      variables
    );
  } catch (error) {
    console.error("Add Customer Address API Error:", error);
    throw error;
  }
};

// Recommended Products
export const fetchRecommendedProducts = async (
  productId: string = "gid://shopify/Product/8673967669460"
) => {
  const query = `
 query getProductRecommendations($productId: ID!) {
  productRecommendations(productId: $productId) {
    id
    title
    handle    
    images(first: 1) {
      edges {
        node {
          url
          altText
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
}
  `;

  const variables = {
    productId,
  };

  return graphqlApi.query<RecommendedProductsApiResponse>(
    API_ENDPOINTS.RECOMMENDED_PRODUCTS,
    query,
    variables
  );
};

// Search Products
export const searchProducts = async (query: string) => {
  const searchQuery = `
query searchProducts($query: String!) {
  products(first: 10, query: $query) {
    edges {
      node {
        id
        title
        handle
        images(first: 1) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    }
  }
}
  `;

  const variables = {
    query,
  };

  return graphqlApi.query<SearchProductApiResponse>(
    API_ENDPOINTS.SEARCH_PRODUCTS,
    searchQuery,
    variables
  );
};

// Shop Policies
export const fetchShopPolicies = async () => {
  const query = `
  query GetPolicies {
  shop {
    privacyPolicy {
      title
      body
      url
    }
    refundPolicy {
      title
      body
      url
    }
    termsOfService {
      title
      body
      url
    }
    shippingPolicy {
      title
      body
      url
    }
    subscriptionPolicy {
      title
      body
      url
    }
  }
}
  `;

  return graphqlApi.query<ShopPoliciesApiResponse>(
    API_ENDPOINTS.SHOP_POLICIES,
    query
  );
};
