// tempExerciseSelectionSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type TempSelectionState = {
  selectedExerciseIds: string[];
};

const initialState: TempSelectionState = {
  selectedExerciseIds: [],
};

const tempExerciseSelectionSlice = createSlice({
  name: 'tempExerciseSelection',
  initialState,
  reducers: {
    setTempSelectedExercises(state, action: PayloadAction<string[]>) {
      state.selectedExerciseIds = action.payload;
    },
    clearTempSelectedExercises(state) {
      state.selectedExerciseIds = [];
    },
  },
});

export const {setTempSelectedExercises, clearTempSelectedExercises} =
  tempExerciseSelectionSlice.actions;

export default tempExerciseSelectionSlice.reducer;
