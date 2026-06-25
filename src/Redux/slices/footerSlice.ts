import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface FooterSlice {
  selectedCountry: {
    code: string;
    name: string;
    countryCode: string;
  };
}

const initialState: FooterSlice = {
  selectedCountry: {
    name: "USA",
    code: "USD",
    countryCode: "US",
  },
};

export const modalSlice = createSlice({
  name: "footer",
  initialState,
  reducers: {
    setSelectedCountry: (
      state,
      action: PayloadAction<{
        code: string;
        name: string;
        countryCode: string;
      }>
    ) => {
      state.selectedCountry = action.payload;
    },
  },
});

export const { setSelectedCountry } = modalSlice.actions;

export default modalSlice.reducer;
