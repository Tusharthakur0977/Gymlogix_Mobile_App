import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

// Define a type for the slice state
interface ModalSlice {
  isUploadImageOptionModal: boolean;
}

// Define the initial state using that type
const initialState: ModalSlice = {
  isUploadImageOptionModal: false,
};

export const modalSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    setIsUploadImageOptionModal: (state, action: PayloadAction<boolean>) => {
      state.isUploadImageOptionModal = action.payload;
    },
  },
});

export const { setIsUploadImageOptionModal } = modalSlice.actions;

export default modalSlice.reducer;
