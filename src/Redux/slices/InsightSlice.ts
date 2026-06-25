import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';

// Define a type for the slice state
interface InsightSlice {
  insightData: any;
}

// Define the initial state using that type
const initialState: InsightSlice = {
  insightData: [],
};

export const insightSlice = createSlice({
  name: 'insight',
  initialState,
  reducers: {
    setInsightData: (state, action: PayloadAction<any>) => {
      state.insightData = action.payload;
    },
  },
});

export const {setInsightData} = insightSlice.actions;

export default insightSlice.reducer;
