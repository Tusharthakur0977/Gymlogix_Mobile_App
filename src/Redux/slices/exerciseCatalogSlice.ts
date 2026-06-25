import type {PayloadAction} from '@reduxjs/toolkit';
import {createSelector, createSlice} from '@reduxjs/toolkit';
import exerciseCatalog, {
  Exercise,
  ExerciseCatalog,
  ExerciseSettings,
} from '../../Seeds/ExerciseCatalog';

// Interface for the exercise catalog slice state
interface ExerciseCatalogSlice {
  catalog: ExerciseCatalog;
  customExercises: Exercise[]; // User-created exercises
  searchQuery: string;
  selectedCategory: string | null;
  isLoading: boolean;
}

// Define the initial state using that type
const initialState: ExerciseCatalogSlice = {
  catalog: exerciseCatalog, // Load initial exercises from seed data
  customExercises: [], // Start with no custom exercises
  searchQuery: '',
  selectedCategory: null,
  isLoading: false,
};

export const exerciseCatalogSlice = createSlice({
  name: 'exerciseCatalog',
  initialState,
  reducers: {
    // Add a new custom exercise
    addCustomExercise: (state, action: PayloadAction<Exercise>) => {
      state.customExercises.push(action.payload);
    },
    setExerciseCatalog: (state, action: PayloadAction<ExerciseCatalog>) => {
      state.catalog = action.payload;
    },

    // Update an existing custom exercise
    updateCustomExercise: (state, action: PayloadAction<Exercise>) => {
      const index = state.customExercises.findIndex(
        exercise => exercise.id === action.payload.id,
      );
      if (index !== -1) {
        state.customExercises[index] = action.payload;
      }
    },

    // Remove a custom exercise
    removeCustomExercise: (state, action: PayloadAction<string>) => {
      state.customExercises = state.customExercises.filter(
        exercise => exercise.id !== action.payload,
      );
    },

    // Set search query for filtering exercises
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Set selected category for filtering
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },

    // Set loading state
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Reset search and filters
    resetFilters: state => {
      state.searchQuery = '';
      state.selectedCategory = null;
    },

    // Add exercise to a specific category in the catalog
    addExerciseToCategory: (
      state,
      action: PayloadAction<{categoryName: string; exercise: Exercise}>,
    ) => {
      const {categoryName, exercise} = action.payload;
      const categoryIndex = state.catalog.categories.findIndex(
        category => category.bodyPart === categoryName,
      );

      if (categoryIndex !== -1) {
        state.catalog.categories[categoryIndex].exercises.push(exercise);
      } else {
        // Create new category if it doesn't exist
        state.catalog.categories.push({
          bodyPart: categoryName,
          exercises: [exercise],
        });
      }
    },
    updateExerciseSettings: (
      state,
      action: PayloadAction<{
        id: string;
        settings: ExerciseSettings;
      }>,
    ) => {
      const {id, settings} = action.payload;

      // Search in both catalog exercises and custom exercises
      let exercise = state.catalog.categories
        .flatMap(category => category.exercises)
        .find(exercise => exercise.id === id);

      // If not found in catalog, search in custom exercises
      if (!exercise) {
        exercise = state.customExercises.find(exercise => exercise.id === id);
      }

      if (exercise) {
        exercise.exerciseSettings = settings;
      }
    },

    updateAlternateExerciseInSettings: (
      state,
      action: PayloadAction<{
        id: string;
        alternateExercise: string | undefined;
      }>,
    ) => {
      const {id, alternateExercise} = action.payload;

      // Search in both catalog exercises and custom exercises
      let exercise = state.catalog.categories
        .flatMap(category => category.exercises)
        .find(exercise => exercise.id === id);

      // If not found in catalog, search in custom exercises
      if (!exercise) {
        exercise = state.customExercises.find(exercise => exercise.id === id);
      }

      if (exercise) {
        // If exerciseSettings doesn't exist, create a minimal object with just the alternate exercise
        if (!exercise.exerciseSettings) {
          exercise.exerciseSettings = {
            alternateExercise: alternateExercise,
          };
        } else {
          // Just update the alternate exercise, preserve all other settings
          exercise.exerciseSettings.alternateExercise = alternateExercise;
        }
      }
    },

    // Reset the entire catalog to initial state
    resetCatalog: state => {
      state.catalog = exerciseCatalog;
      state.customExercises = [];
      state.searchQuery = '';
      state.selectedCategory = null;
      state.isLoading = false;
    },
  },
});

export const {
  addCustomExercise,
  updateCustomExercise,
  removeCustomExercise,
  setSearchQuery,
  setSelectedCategory,
  setIsLoading,
  resetFilters,
  addExerciseToCategory,
  resetCatalog,
  updateExerciseSettings,
  updateAlternateExerciseInSettings,
  setExerciseCatalog,
} = exerciseCatalogSlice.actions;

export default exerciseCatalogSlice.reducer;

// Base selectors for accessing state
const selectCatalog = (state: {exerciseCatalog: ExerciseCatalogSlice}) =>
  state.exerciseCatalog.catalog;

const selectCustomExercises = (state: {
  exerciseCatalog: ExerciseCatalogSlice;
}) => state.exerciseCatalog.customExercises;

const selectSearchQuery = (state: {exerciseCatalog: ExerciseCatalogSlice}) =>
  state.exerciseCatalog.searchQuery;

const selectSelectedCategory = (state: {
  exerciseCatalog: ExerciseCatalogSlice;
}) => state.exerciseCatalog.selectedCategory;

// Memoized selectors using createSelector
export const selectAllExercises = createSelector(
  [selectCatalog, selectCustomExercises],
  (catalog, customExercises) => {
    const catalogExercises = (catalog.categories ?? []).flatMap(
      category => category.exercises ?? [],
    );
    return [...catalogExercises, ...customExercises];
  },
);

export const selectFilteredExercises = createSelector(
  [selectAllExercises, selectSearchQuery, selectSelectedCategory],
  (allExercises, searchQuery, selectedCategory) => {
    return allExercises.filter(exercise => {
      const matchesSearch = searchQuery
        ? exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exercise.mainMuscle
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          exercise.equipment
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          exercise.secondaryMuscle.some(muscle =>
            muscle.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : true;

      const matchesCategory = selectedCategory
        ? exercise.mainMuscle === selectedCategory ||
          exercise.targetMuscles.includes(selectedCategory) ||
          exercise.secondaryMuscle.includes(selectedCategory)
        : true;

      return matchesSearch && matchesCategory;
    });
  },
);

export const selectExercisesByCategory = createSelector(
  [selectCatalog, selectCustomExercises],
  (catalog, customExercises) => {
    // Create a deep copy of catalog categories to avoid mutation issues
    const categoriesWithCustom = (catalog.categories ?? []).map(category => ({
      ...category,
      exercises: [...(category.exercises ?? [])], // Create a new array for exercises
    }));

    // Add custom exercises to appropriate categories or create new ones
    customExercises.forEach(exercise => {
      const categoryIndex = categoriesWithCustom.findIndex(
        category =>
          category.bodyPart?.toLowerCase() ===
          exercise.mainMuscle?.toLowerCase(),
      );

      if (categoryIndex !== -1) {
        categoriesWithCustom[categoryIndex].exercises.push(exercise);
      } else {
        categoriesWithCustom.push({
          bodyPart: exercise.mainMuscle,
          exercises: [exercise],
        });
      }
    });

    return categoriesWithCustom;
  },
);

// Export the base selector as the public API
export {selectCustomExercises};

export const selectExerciseById = (
  state: {exerciseCatalog: ExerciseCatalogSlice},
  exerciseId: string,
) => {
  const allExercises = selectAllExercises(state);
  return allExercises.find(exercise => exercise.id === exerciseId);
};
