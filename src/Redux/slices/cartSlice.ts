import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { Cart } from "../../Services/ApiResponseTypes/Add_To_Cart";

interface CartSlice {
  cartData: Cart | null;
  cartItems: number;
  cartId: string | null;
  isLoading: boolean;
}

const initialState: CartSlice = {
  cartData: null,
  cartItems: 0,
  cartId: null,
  isLoading: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartData: (state, action: PayloadAction<Cart | null>) => {
      state.cartData = action.payload;
      // Update cart items count based on lines
      state.cartItems = action.payload?.lines?.edges?.length || 0;
    },
    setCartItems: (state, action: PayloadAction<number>) => {
      state.cartItems = action.payload;
    },
    setCartId: (state, action: PayloadAction<string | null>) => {
      state.cartId = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearCartData: (state) => {
      // Reset cart state to initial values
      state.cartData = null;
      state.cartItems = 0;
      state.cartId = null;
      state.isLoading = false;
    },
  },
});

export const {
  setCartData,
  setCartItems,
  setCartId,
  setIsLoading,
  clearCartData,
} = cartSlice.actions;

export default cartSlice.reducer;
