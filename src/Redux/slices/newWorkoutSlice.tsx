import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import {Asset} from 'react-native-image-picker';
import {Exercise} from '../../Seeds/ExerciseCatalog';

// Define a type for a Superset
export type Superset = {
  id: string;
  type: 'superset';
  exercises: Exercise[];
};

// Define a union type for workout exercise items (either a single exercise or a superset)
export type WorkoutExerciseItem = Exercise | Superset;

export type ExerciseListItem = {
  id: string;
  day: number;
  color: string;
  exercise: WorkoutExerciseItem[];
  dayInstruction: string;
  dayName: string;
  restPeriod: number;
};

export type WorkoutData = {
  name: string;
  description: string;
  coverImage: Asset | null;
  images: Asset[];
  instruction: string;
  goal: string | null;
  mainMuscle: string;
  secondaryMuscle: string[];
  difficulty: number;
  location: string | null;
  durationInWeeks: number;
  daysInWeek: number;
  exerciseList: ExerciseListItem[];
};

// Define a type for the slice state
interface NewWorkoutSlice {
  workoutData: WorkoutData;
  activeStep: number;
  tempSelectedExerciseIds: string[];
}

// Define the initial state using that type
const initialState: NewWorkoutSlice = {
  workoutData: {
    name: '',
    description: '',
    coverImage: null,
    images: [],
    instruction: '',
    goal: '',
    mainMuscle: '',
    secondaryMuscle: [],
    difficulty: 1,
    location: '',
    durationInWeeks: 0,
    daysInWeek: 3,
    exerciseList: [
      {
        id: '1',
        day: 1,
        color: '#FF3B5C',
        dayInstruction: '',
        dayName: 'Day 1',
        restPeriod: 1,
        exercise: [],
      },
    ],
  },
  activeStep: 1,
  tempSelectedExerciseIds: [],
};

export const NewWorkoutSlice = createSlice({
  name: 'newWorkout',
  initialState,
  reducers: {
    setWorkoutData: (state, action: PayloadAction<WorkoutData>) => {
      state.workoutData = action.payload;
    },

    addDay: (state, action: PayloadAction<string>) => {
      state.workoutData.exerciseList.push({
        id: Math.random().toString(),
        day: state.workoutData.exerciseList.length + 1,
        color: action.payload,
        exercise: [],
        dayInstruction: '',
        dayName: `Day ${state.workoutData.exerciseList.length + 1}`,
        restPeriod: 1,
      });
    },
    removeDay: (state, action: PayloadAction<string>) => {
      state.workoutData.exerciseList = state.workoutData.exerciseList.filter(
        day => day.id !== action.payload,
      );
    },
    updateDayColor: (
      state,
      action: PayloadAction<{id: string; color: string}>,
    ) => {
      state.workoutData.exerciseList = state.workoutData.exerciseList.map(day =>
        day.id === action.payload.id
          ? {...day, color: action.payload.color}
          : day,
      );
    },
    updateDayName: (
      state,
      action: PayloadAction<{id: string; name: string}>,
    ) => {
      state.workoutData.exerciseList = state.workoutData.exerciseList.map(day =>
        day.id === action.payload.id
          ? {...day, dayName: action.payload.name}
          : day,
      );
    },
    updateDayInstruction: (
      state,
      action: PayloadAction<{id: string; instruction: string}>,
    ) => {
      state.workoutData.exerciseList = state.workoutData.exerciseList.map(day =>
        day.id === action.payload.id
          ? {...day, dayInstruction: action.payload.instruction}
          : day,
      );
    },
    addExercise: (
      state,
      action: PayloadAction<{id: string; exercises: Exercise[]}>,
    ) => {
      state.workoutData.exerciseList = state.workoutData.exerciseList.map(day =>
        day.id === action.payload.id
          ? {
              ...day,
              exercise: [...day.exercise, ...action.payload.exercises],
            }
          : day,
      );
    },
    removeExercise: (state, action: PayloadAction<string>) => {
      state.workoutData.exerciseList = state.workoutData.exerciseList.map(
        day => ({
          ...day,
          exercise: day.exercise.filter(
            exercise => exercise.id !== action.payload,
          ),
        }),
      );
    },
    updateDayExercises: (
      state,
      action: PayloadAction<{id: string; exercises: Exercise[]}>,
    ) => {
      state.workoutData.exerciseList = state.workoutData.exerciseList.map(day =>
        day.id === action.payload.id
          ? {
              ...day,
              exercise: action.payload.exercises,
            }
          : day,
      );
    },
    updateExercise: (state, action: PayloadAction<Exercise>) => {
      state.workoutData.exerciseList = state.workoutData.exerciseList.map(
        day => ({
          ...day,
          exercise: day.exercise.map(exercise =>
            exercise.id === action.payload.id ? action.payload : exercise,
          ),
        }),
      );
    },
    updateDayRestPeriod: (
      state,
      action: PayloadAction<{id: string; restPeriod: number}>,
    ) => {
      state.workoutData.exerciseList = state.workoutData.exerciseList.map(day =>
        day.id === action.payload.id
          ? {...day, restPeriod: action.payload.restPeriod}
          : day,
      );
    },
    updateExerciseOrder: (state, action: PayloadAction<ExerciseListItem[]>) => {
      state.workoutData.exerciseList = action.payload;
    },
    updateDayOrder: (state, action: PayloadAction<ExerciseListItem[]>) => {
      state.workoutData.exerciseList = action.payload;
    },
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },

    createSuperset: (
      state,
      action: PayloadAction<{dayId: string; exerciseIds: string[]}>,
    ) => {
      const {dayId, exerciseIds} = action.payload;

      // Find the day
      const dayIndex = state.workoutData.exerciseList.findIndex(
        day => day.id === dayId,
      );

      if (dayIndex === -1 || exerciseIds.length < 2) return;

      const day = state.workoutData.exerciseList[dayIndex];

      // Find all exercises to include in the superset
      const exercisesToInclude: Exercise[] = [];
      const remainingExercises: WorkoutExerciseItem[] = [];

      // Separate exercises to include in superset from those to keep as is
      day.exercise.forEach(item => {
        if ('type' in item && item.type === 'superset') {
          // If it's already a superset, check if any of its exercises are selected
          const selectedExercises = item.exercises.filter(ex =>
            exerciseIds.includes(ex.id),
          );

          const unselectedExercises = item.exercises.filter(
            ex => !exerciseIds.includes(ex.id),
          );

          // Add selected exercises to the new superset
          exercisesToInclude.push(...selectedExercises);

          // If there are unselected exercises, keep them as a superset
          if (unselectedExercises.length > 1) {
            remainingExercises.push({
              id: Math.random().toString(),
              type: 'superset',
              exercises: unselectedExercises,
            });
          } else if (unselectedExercises.length === 1) {
            // If only one exercise remains, it's no longer a superset
            remainingExercises.push(unselectedExercises[0]);
          }
        } else {
          // Regular exercise
          if (exerciseIds.includes(item.id)) {
            exercisesToInclude.push(item);
          } else {
            remainingExercises.push(item);
          }
        }
      });

      // Create the new superset
      const newSuperset: Superset = {
        id: Math.random().toString(),
        type: 'superset',
        exercises: exercisesToInclude,
      };

      // Update the day with the new superset and remaining exercises
      state.workoutData.exerciseList[dayIndex] = {
        ...day,
        exercise: [newSuperset, ...remainingExercises],
      };
    },

    // Remove an exercise from a superset
    removeExerciseFromSuperset: (
      state,
      action: PayloadAction<{
        dayId: string;
        supersetId: string;
        exerciseId: string;
      }>,
    ) => {
      const {dayId, supersetId, exerciseId} = action.payload;

      // Find the day
      const dayIndex = state.workoutData.exerciseList.findIndex(
        day => day.id === dayId,
      );

      if (dayIndex === -1) return;

      const day = state.workoutData.exerciseList[dayIndex];
      const updatedExercises: WorkoutExerciseItem[] = [];

      // Process each exercise or superset in the day
      day.exercise.forEach(item => {
        if (
          'type' in item &&
          item.type === 'superset' &&
          item.id === supersetId
        ) {
          // This is the superset we want to modify
          const remainingExercises = item.exercises.filter(
            ex => ex.id !== exerciseId,
          );

          // If we have more than one exercise left, keep it as a superset
          if (remainingExercises.length > 1) {
            updatedExercises.push({
              ...item,
              exercises: remainingExercises,
            });
          }
          // If only one exercise remains, it's no longer a superset
          else if (remainingExercises.length === 1) {
            updatedExercises.push(remainingExercises[0]);
          }
          // If no exercises remain, don't add anything (effectively removing the superset)
        } else {
          // Keep other exercises and supersets as they are
          updatedExercises.push(item);
        }
      });

      // Update the day with the modified exercises
      state.workoutData.exerciseList[dayIndex] = {
        ...day,
        exercise: updatedExercises,
      };
    },

    // Delete an entire superset
    deleteSuperset: (
      state,
      action: PayloadAction<{dayId: string; supersetId: string}>,
    ) => {
      const {dayId, supersetId} = action.payload;

      // Find the day
      const dayIndex = state.workoutData.exerciseList.findIndex(
        day => day.id === dayId,
      );

      if (dayIndex === -1) return;

      const day = state.workoutData.exerciseList[dayIndex];

      // Filter out the superset to delete
      const updatedExercises = day.exercise.filter(
        item =>
          !(
            'type' in item &&
            item.type === 'superset' &&
            item.id === supersetId
          ),
      );

      // Update the day with the filtered exercises
      state.workoutData.exerciseList[dayIndex] = {
        ...day,
        exercise: updatedExercises,
      };
    },

    resetNewWorkoutSlice: state => {
      state.workoutData = initialState.workoutData;
      state.activeStep = initialState.activeStep;
    },

    setTempSelectedExercises: (state, action: PayloadAction<string[]>) => {
      state.tempSelectedExerciseIds = action.payload;
    },

    addToTempSelection: (state, action: PayloadAction<string>) => {
      if (!state.tempSelectedExerciseIds.includes(action.payload)) {
        state.tempSelectedExerciseIds.push(action.payload);
      }
    },

    removeFromTempSelection: (state, action: PayloadAction<string>) => {
      state.tempSelectedExerciseIds = state.tempSelectedExerciseIds.filter(
        id => id !== action.payload,
      );
    },

    clearTempSelection: state => {
      state.tempSelectedExerciseIds = [];
    },
  },
});

export const {
  setWorkoutData,
  addDay,
  removeDay,
  addExercise,
  updateDayExercises,
  removeExercise,
  updateExercise,
  updateExerciseOrder,
  updateDayOrder,
  updateDayColor,
  updateDayName,
  updateDayInstruction,
  updateDayRestPeriod,
  setActiveStep,
  createSuperset,
  removeExerciseFromSuperset,
  deleteSuperset,
  resetNewWorkoutSlice,
  setTempSelectedExercises,
  addToTempSelection,
  removeFromTempSelection,
  clearTempSelection,
} = NewWorkoutSlice.actions;

export default NewWorkoutSlice.reducer;
