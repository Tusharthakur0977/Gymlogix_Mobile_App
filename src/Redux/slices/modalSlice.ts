import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface ModalSlice {
  isCountryPickerVisible: boolean;
  isSideDrawerVisible: boolean;
  isAddAddressVisible: boolean;
  isFilterVisible: boolean;
}

const initialState: ModalSlice = {
  isCountryPickerVisible: false,
  isSideDrawerVisible: false,
  isAddAddressVisible: false,
  isFilterVisible: false,
};

export const modalSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    setIsCountryPickerVisible: (state, action: PayloadAction<boolean>) => {
      state.isCountryPickerVisible = action.payload;
    },
    setIsSideDrawerVisible: (state, action: PayloadAction<boolean>) => {
      state.isSideDrawerVisible = action.payload;
    },
    setIsAddAddressVisible: (state, action: PayloadAction<boolean>) => {
      state.isAddAddressVisible = action.payload;
    },
    setIsFilterVisible: (state, action: PayloadAction<boolean>) => {
      state.isFilterVisible = action.payload;
    },
  },
});

export const {
  setIsCountryPickerVisible,
  setIsSideDrawerVisible,
  setIsAddAddressVisible,
  setIsFilterVisible,
} = modalSlice.actions;

export default modalSlice.reducer;
