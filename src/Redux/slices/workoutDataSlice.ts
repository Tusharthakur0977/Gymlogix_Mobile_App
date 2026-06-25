import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface WorkoutState {
  isFinish: any[]; // Replace 'any' with a specific type for better type safety
  copiedExerciseIds: any[]; // Store copied exercise objects (with exerciseSettings) for paste functionality
  copiedSupersets: any[]; // Store copied superset data for paste functionality
  copiedFromPlanId: string | number | null; // Store the plan ID where exercises were copied from
  copiedFromDayIndex: number | null; // Store the day index where exercises were copied from
  // Other existing state properties
}

const initialState: WorkoutState = {
  isFinish: [],
  copiedExerciseIds: [],
  copiedSupersets: [],
  copiedFromPlanId: null,
  copiedFromDayIndex: null,
  // Other initial state properties
};

const workoutDataSlice = createSlice({
  name: 'workoutData',
  initialState,
  reducers: {
    setIsFinish(state, action: PayloadAction<any[]>) {
      state.isFinish = action.payload;
    },
    updateIsFinish(state, action: PayloadAction<any[]>) {
      state.isFinish = action.payload;
    },
    setCopiedExerciseIds(state, action: PayloadAction<any[]>) {
      state.copiedExerciseIds = action.payload;
    },
    clearCopiedExerciseIds(state) {
      state.copiedExerciseIds = [];
    },
    setCopiedSupersets(state, action: PayloadAction<any[]>) {
      state.copiedSupersets = action.payload;
    },
    clearCopiedSupersets(state) {
      state.copiedSupersets = [];
    },
    setCopiedSource(
      state,
      action: PayloadAction<{planId: string | number; dayIndex: number}>,
    ) {
      state.copiedFromPlanId = action.payload.planId;
      state.copiedFromDayIndex = action.payload.dayIndex;
    },
    clearAllCopiedData(state) {
      state.copiedExerciseIds = [];
      state.copiedSupersets = [];
      state.copiedFromPlanId = null;
      state.copiedFromDayIndex = null;
    },
    // Add other actions as needed
  },
});

export const {
  setIsFinish,
  updateIsFinish,
  setCopiedExerciseIds,
  clearCopiedExerciseIds,
  setCopiedSupersets,
  clearCopiedSupersets,
  setCopiedSource,
  clearAllCopiedData,
} = workoutDataSlice.actions;
export default workoutDataSlice.reducer;
