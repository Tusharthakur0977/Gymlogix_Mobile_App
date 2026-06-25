import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SetDetail} from '../../Seeds/TrainingPLans';
import {store} from '../store';

// 🔥 GLOBAL interval registry (survives screen unmount)
const exerciseTimerIntervals: Record<string, NodeJS.Timeout> = {};

// types/workout.ts
export type SetData = {
  weight: string;
  reps: string;
  time: string;
  count: number;
  difficulty?: 'Warmup' | 'Easy' | 'Medium' | 'Hard'; // Optional difficulty level
  distance?: string; // Optional distance field for cardio exercises
  dropSets?: SetDetail[]; // Optional drop sets
  exerciseID?: string;
  logTime: string;
};

export type ExerciseLog = {
  exercise_id: string;
  setsData: SetData[];
  isDropSet: boolean;
  logTime: string;
};

export type DraftWorkout = {
  workoutPlanId: number;
  workoutId: number; // program/workout id
  exercises: ExerciseLog[];
};

export type SupersetData = {
  workoutPlanId: number;
  workoutId: number;
  exerciseData: any[]; // Array of exercises and supersets
};

interface WorkoutState {
  draftWorkout: DraftWorkout[];
  supersetData: SupersetData[]; // Store superset structure for each workout
  workoutPlanId: number | null; // Track selected plan
  workoutId: number | null;
  workoutTime: number | null;
  workoutProgress: string;
  currentWorkout: {
    planId: number | null;
    workoutName: string | null;
    dayName: string | null;
  };
  currentCompletedExerciseIds: string[];
  exerciseTimers: {exerciseId: string; timeInSeconds: number}[];
  startCurrentExercise: string[];
}

const initialState: WorkoutState = {
  draftWorkout: [],
  supersetData: [],
  workoutPlanId: null, // Track selected plan
  workoutId: null,
  workoutTime: 0,
  workoutProgress: '',
  currentWorkout: {planId: null, workoutName: null, dayName: null},
  currentCompletedExerciseIds: [],
  exerciseTimers: [],
  startCurrentExercise: [],
};

const logWorkoutSlice = createSlice({
  name: 'logWorkoutData',
  initialState,
  reducers: {
    setDraftWorkout(state, action: PayloadAction<DraftWorkout>) {
      // Check if a draftWorkout with the same workoutPlanId and workoutId exists
      const existingIndex = state.draftWorkout.findIndex(
        workout =>
          workout.workoutPlanId === action.payload.workoutPlanId &&
          workout.workoutId === action.payload.workoutId,
      );
      if (existingIndex >= 0) {
        // Update existing draftWorkout
        state.draftWorkout[existingIndex] = action.payload;
      } else {
        // Add new draftWorkout
        state.draftWorkout.push(action.payload);
      }
    },
    updateExercise(
      state,
      action: PayloadAction<
        ExerciseLog & {workoutPlanId: number; workoutId: number}
      >,
    ) {
      // Find the draftWorkout for the given workoutPlanId and workoutId
      const workout = state.draftWorkout.find(
        w =>
          w.workoutPlanId === action.payload.workoutPlanId &&
          w.workoutId === action.payload.workoutId,
      );
      if (!workout) {
        // If no draftWorkout exists, create one
        state.draftWorkout.push({
          workoutPlanId: action.payload.workoutPlanId,
          workoutId: action.payload.workoutId,
          exercises: [action.payload],
        });
      } else {
        const idx = workout.exercises.findIndex(
          ex => ex.exercise_id === action.payload.exercise_id,
        );
        if (idx >= 0) {
          workout.exercises[idx] = action.payload;
        } else {
          workout.exercises.push(action.payload);
        }
      }
    },

    setSupersetData(state, action: PayloadAction<SupersetData>) {
      // Check if superset data for this workout already exists
      const existingIndex = state.supersetData.findIndex(
        data =>
          data.workoutPlanId === action.payload.workoutPlanId &&
          data.workoutId === action.payload.workoutId,
      );
      if (existingIndex >= 0) {
        // Update existing superset data
        state.supersetData[existingIndex] = action.payload;
      } else {
        // Add new superset data
        state.supersetData.push(action.payload);
      }
    },
    clearSupersetData(
      state,
      action: PayloadAction<{workoutPlanId: number; workoutId: number}>,
    ) {
      state.supersetData = state.supersetData.filter(
        data =>
          !(
            data.workoutPlanId === action.payload.workoutPlanId &&
            data.workoutId === action.payload.workoutId
          ),
      );
    },
    clearDraftWorkout(state) {
      state.draftWorkout = [];
      state.supersetData = []; // Also clear superset data
      state.currentCompletedExerciseIds = []; // Clear completed exercises
      console.log(
        '🧹 Redux: Cleared draftWorkout, supersetData, and completedExerciseIds',
      );
    },
    // Optional: Add reducer to clear a specific workout
    clearSpecificDraftWorkout(
      state,
      action: PayloadAction<{workoutPlanId: number; workoutId: number}>,
    ) {
      state.draftWorkout = state.draftWorkout.filter(
        workout =>
          !(
            workout.workoutPlanId === action.payload.workoutPlanId &&
            workout.workoutId === action.payload.workoutId
          ),
      );
      // Also clear superset data for this workout
      state.supersetData = state.supersetData.filter(
        data =>
          !(
            data.workoutPlanId === action.payload.workoutPlanId &&
            data.workoutId === action.payload.workoutId
          ),
      );
    },
    setWorkoutTime(state, action: PayloadAction<number | null>) {
      state.workoutTime = action.payload;
    },
    setWorkoutProgress(state, action: PayloadAction<string>) {
      state.workoutProgress = action.payload;
    },
    setCurrentWorkout(
      state,
      action: PayloadAction<{
        planId: number;
        workoutName: string | any;
        dayName: string;
      }>,
    ) {
      state.currentWorkout = action.payload;
    },

    setCurrentCompletedExerciseIds(state, action: PayloadAction<string>) {
      // Check if the ID already exists to avoid duplicates
      if (!state.currentCompletedExerciseIds.includes(action.payload)) {
        console.log(
          '✅ Redux: Adding to completedExerciseIds:',
          action.payload,
        );
        console.log('  - Before:', state.currentCompletedExerciseIds);
        state.currentCompletedExerciseIds.push(action.payload);
        console.log('  - After:', state.currentCompletedExerciseIds);
      } else {
        console.log('⚠️ Redux: ID already exists:', action.payload);
      }
    },

    resetWorkout(state) {
      state.workoutTime = 0;
      state.workoutProgress = '';
      state.currentWorkout = {planId: null, workoutName: null, dayName: null};
    },
    // Manage per-exercise timers (time in seconds)
    setExerciseTimer(
      state,
      action: PayloadAction<{exerciseId: string; timeInSeconds: number}>,
    ) {
      const {exerciseId, timeInSeconds} = action.payload;
      const idx = state.exerciseTimers.findIndex(
        t => String(t.exerciseId) === String(exerciseId),
      );
      if (idx >= 0) {
        state.exerciseTimers[idx].timeInSeconds = timeInSeconds;
      } else {
        state.exerciseTimers.push({exerciseId, timeInSeconds});
      }
    },
    incrementExerciseTimer(state, action: PayloadAction<string>) {
      const exerciseId = action.payload;
      const idx = state.exerciseTimers.findIndex(
        t => String(t.exerciseId) === String(exerciseId),
      );
      if (idx >= 0) {
        state.exerciseTimers[idx].timeInSeconds += 1;
      } else {
        state.exerciseTimers.push({exerciseId, timeInSeconds: 1});
      }
    },
    resetExerciseTimers(state) {
      state.exerciseTimers = [];
    },
    setStartCurrentExercise(state, action: PayloadAction<string | number>) {
      const id = String(action.payload);

      if (!state.startCurrentExercise.includes(id)) {
        state.startCurrentExercise.push(id);
      } else {
        console.log('⚠️ Redux: ID already exists:', id);
      }
    },

    clearStartCurrentExercise(state) {
      state.startCurrentExercise = [];
    },

    startExerciseTimer(state, action: PayloadAction<string>) {
      const exerciseId = String(action.payload);

      // Prevent duplicate intervals
      if (exerciseTimerIntervals[exerciseId]) return;

      exerciseTimerIntervals[exerciseId] = setInterval(() => {
        // IMPORTANT: dispatch increment from store
        // (store import required)
        store.dispatch(incrementExerciseTimer(exerciseId));
      }, 1000);
    },

    pauseExerciseTimer(state, action: PayloadAction<string>) {
      const exerciseId = String(action.payload);

      const interval = exerciseTimerIntervals[exerciseId];
      if (interval) {
        clearInterval(interval);
        delete exerciseTimerIntervals[exerciseId];
      }
    },
    clearAllExerciseTimers(state) {
      // 🔴 Stop all running intervals
      Object.keys(exerciseTimerIntervals).forEach(exerciseId => {
        clearInterval(exerciseTimerIntervals[exerciseId]);
        delete exerciseTimerIntervals[exerciseId];
      });

      // 🧹 Clear redux timer state
      state.exerciseTimers = [];
      state.startCurrentExercise = [];
    },
  },
});

export const {
  setDraftWorkout,
  updateExercise,
  setSupersetData,
  clearSupersetData,
  clearDraftWorkout,
  clearSpecificDraftWorkout,
  setWorkoutProgress,
  setWorkoutTime,
  resetWorkout,
  setCurrentCompletedExerciseIds,
  setCurrentWorkout,
  setExerciseTimer,
  incrementExerciseTimer,
  resetExerciseTimers,
  setStartCurrentExercise,
  clearStartCurrentExercise,
  startExerciseTimer,
  pauseExerciseTimer,
  clearAllExerciseTimers,
} = logWorkoutSlice.actions;

export default logWorkoutSlice.reducer;
