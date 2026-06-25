import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ExerciseAPIData} from '../../Typings/ApiResponse/ExerciseResponse';

interface exerciseState {
  exerciseData: ExerciseAPIData[] | null;
}

const initialState: exerciseState = {
  exerciseData: null,
};

const exerciseSlice = createSlice({
  name: 'exerciseData',
  initialState,
  reducers: {
    setExerciseData(state, action: PayloadAction<ExerciseAPIData[]>) {
      state.exerciseData = action.payload;
    },
    updateExerciseOrder(state, action: PayloadAction<ExerciseAPIData[]>) {
      state.exerciseData = action.payload;
    },
    deleteMultipleExercises(state, action: PayloadAction<number[]>) {
      const idsToDelete = action.payload;
      if (state.exerciseData) {
        state.exerciseData = state.exerciseData.filter(
          (exercise: any) => !idsToDelete.includes(exercise.id),
        );
      }
    },
  },
});

export const {setExerciseData, updateExerciseOrder, deleteMultipleExercises} =
  exerciseSlice.actions;
export default exerciseSlice.reducer;
