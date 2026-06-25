import {
  DrawerNavigationProp,
  DrawerScreenProps,
} from "@react-navigation/drawer";
import {
  CompositeNavigationProp,
  NavigatorScreenParams,
  RouteProp,
} from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

export type RootStackParams = {
  splash: undefined;
  mainStack: NavigatorScreenParams<MainStackParams>;
};

export type MainStackParams = {
  tabs: NavigatorScreenParams<BottomStackTabParams>;
  login: undefined;
  cart: { cartId: String };
  singleProduct: { productId: string; productTitle: string };
  collection: undefined;
  registerScreen: undefined;
  forgotPassword: undefined;
  updatePassword: undefined;
  termsOfServices: undefined;
  privacyCookies: undefined;
  refundPolicy: undefined;
  faqScreen: undefined;
  findAStore: undefined;
  hijabDesign: undefined;
  howToBuy: undefined;
  paymentOption: undefined;
};

export type BottomStackTabParams = {
  home: undefined;
  shop: {
    collectionId?: string;
    collectionHandle?: string;
    collectionTitle?: string;
  };
  search: {
    collectionHandle?: string;
    collectionTitle?: string;
  };
  styleGuide: undefined;
  account: undefined;
};

export type SplashScreenProps = NativeStackScreenProps<
  RootStackParams,
  "splash"
>;

export type HomeScreenProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "home"
>;
export type ShopScreenProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "shop"
>;
export type SearchScreenProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "search"
>;
export type StyleGuideScreenProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "styleGuide"
>;
export type AccountScreenProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "account"
>;
export type CartProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "cart"
>;
export type SingleProductProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "singleProduct"
>;
export type LoginProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "login"
>;
export type CollectionProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "collection"
>;
export type RegisterScreenProps = NativeStackScreenProps<
  MainStackParams & BottomStackTabParams,
  "registerScreen"
>;
export type ForgotPasswordProps = NativeStackScreenProps<
  MainStackParams,
  "forgotPassword"
>;
export type UpdatePasswordProps = NativeStackScreenProps<
  MainStackParams,
  "updatePassword"
>;
export type TermsOfServicesProps = NativeStackScreenProps<
  MainStackParams,
  "termsOfServices"
>;
export type PrivacyCookiesProps = NativeStackScreenProps<
  MainStackParams,
  "privacyCookies"
>;
export type faqScreenProps = NativeStackScreenProps<
  MainStackParams,
  "faqScreen"
>;
export type FindAStoreProps = NativeStackScreenProps<
  MainStackParams,
  "findAStore"
>;
export type HijabDesignProps = NativeStackScreenProps<
  MainStackParams,
  "hijabDesign"
>;
export type HowToBuyProps = NativeStackScreenProps<MainStackParams, "howToBuy">;
export type PaymentOptionProps = NativeStackScreenProps<
  MainStackParams,
  "paymentOption"
>;
