import type { PayloadAction } from "@reduxjs/toolkit";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import { WorkoutData } from "./newWorkoutSlice";

// Interface for a saved workout with additional metadata
export interface SavedWorkout extends WorkoutData {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isActive: boolean; // Whether this workout is currently being used
  completedSessions: number; // Number of times this workout has been completed
  lastCompletedAt?: string; // ISO date string of last completion
  tags: string[]; // Custom tags for categorization
  rating?: number; // User rating 1-5
  notes?: string; // Additional notes about the workout
}

// Interface for the saved workouts slice state
interface SavedWorkoutsSlice {
  workouts: SavedWorkout[];
  activeWorkoutId: string | null; // Currently active workout
  isLoading: boolean;
  searchQuery: string;
  selectedTags: string[];
  sortBy: "name" | "createdAt" | "updatedAt" | "rating" | "completedSessions";
  sortOrder: "asc" | "desc";
}

// Define the initial state
const initialState: SavedWorkoutsSlice = {
  workouts: [],
  activeWorkoutId: null,
  isLoading: false,
  searchQuery: "",
  selectedTags: [],
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const savedWorkoutsSlice = createSlice({
  name: "savedWorkouts",
  initialState,
  reducers: {
    // Save a new workout
    saveWorkout: (state, action: PayloadAction<WorkoutData>) => {
      const newWorkout: SavedWorkout = {
        ...action.payload,
        id: `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        completedSessions: 0,
        tags: [],
      };
      state.workouts.push(newWorkout);
    },

    // Update an existing workout
    updateWorkout: (state, action: PayloadAction<SavedWorkout>) => {
      const index = state.workouts.findIndex(
        (workout) => workout.id === action.payload.id
      );
      if (index !== -1) {
        state.workouts[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    // Delete a workout
    deleteWorkout: (state, action: PayloadAction<string>) => {
      state.workouts = state.workouts.filter(
        (workout) => workout.id !== action.payload
      );
      // If the deleted workout was active, clear the active workout
      if (state.activeWorkoutId === action.payload) {
        state.activeWorkoutId = null;
      }
    },

    // Set a workout as active
    setActiveWorkout: (state, action: PayloadAction<string>) => {
      // Set all workouts to inactive
      state.workouts.forEach((workout) => {
        workout.isActive = false;
      });

      // Set the selected workout as active
      const workout = state.workouts.find(
        (workout) => workout.id === action.payload
      );
      if (workout) {
        workout.isActive = true;
        state.activeWorkoutId = action.payload;
      }
    },

    // Clear active workout
    clearActiveWorkout: (state) => {
      state.workouts.forEach((workout) => {
        workout.isActive = false;
      });
      state.activeWorkoutId = null;
    },

    // Increment completed sessions for a workout
    incrementCompletedSessions: (state, action: PayloadAction<string>) => {
      const workout = state.workouts.find(
        (workout) => workout.id === action.payload
      );
      if (workout) {
        workout.completedSessions += 1;
        workout.lastCompletedAt = new Date().toISOString();
        workout.updatedAt = new Date().toISOString();
      }
    },

    // Add tags to a workout
    addTagsToWorkout: (
      state,
      action: PayloadAction<{ workoutId: string; tags: string[] }>
    ) => {
      const { workoutId, tags } = action.payload;
      const workout = state.workouts.find((workout) => workout.id === workoutId);
      if (workout) {
        // Add new tags that don't already exist
        const newTags = tags.filter((tag) => !workout.tags.includes(tag));
        workout.tags.push(...newTags);
        workout.updatedAt = new Date().toISOString();
      }
    },

    // Remove tags from a workout
    removeTagsFromWorkout: (
      state,
      action: PayloadAction<{ workoutId: string; tags: string[] }>
    ) => {
      const { workoutId, tags } = action.payload;
      const workout = state.workouts.find((workout) => workout.id === workoutId);
      if (workout) {
        workout.tags = workout.tags.filter((tag) => !tags.includes(tag));
        workout.updatedAt = new Date().toISOString();
      }
    },

    // Rate a workout
    rateWorkout: (
      state,
      action: PayloadAction<{ workoutId: string; rating: number }>
    ) => {
      const { workoutId, rating } = action.payload;
      const workout = state.workouts.find((workout) => workout.id === workoutId);
      if (workout) {
        workout.rating = Math.max(1, Math.min(5, rating)); // Ensure rating is between 1-5
        workout.updatedAt = new Date().toISOString();
      }
    },

    // Add notes to a workout
    addNotesToWorkout: (
      state,
      action: PayloadAction<{ workoutId: string; notes: string }>
    ) => {
      const { workoutId, notes } = action.payload;
      const workout = state.workouts.find((workout) => workout.id === workoutId);
      if (workout) {
        workout.notes = notes;
        workout.updatedAt = new Date().toISOString();
      }
    },

    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Set selected tags for filtering
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload;
    },

    // Set sorting options
    setSortBy: (
      state,
      action: PayloadAction<"name" | "createdAt" | "updatedAt" | "rating" | "completedSessions">
    ) => {
      state.sortBy = action.payload;
    },

    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
    },

    // Set loading state
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Reset filters
    resetFilters: (state) => {
      state.searchQuery = "";
      state.selectedTags = [];
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
    },

    // Clear all workouts (for testing/reset purposes)
    clearAllWorkouts: (state) => {
      state.workouts = [];
      state.activeWorkoutId = null;
    },
  },
});

export const {
  saveWorkout,
  updateWorkout,
  deleteWorkout,
  setActiveWorkout,
  clearActiveWorkout,
  incrementCompletedSessions,
  addTagsToWorkout,
  removeTagsFromWorkout,
  rateWorkout,
  addNotesToWorkout,
  setSearchQuery,
  setSelectedTags,
  setSortBy,
  setSortOrder,
  setIsLoading,
  resetFilters,
  clearAllWorkouts,
} = savedWorkoutsSlice.actions;

export default savedWorkoutsSlice.reducer;

// Base selectors for accessing state
const selectWorkouts = (state: { savedWorkouts: SavedWorkoutsSlice }) =>
  state.savedWorkouts.workouts;

const selectActiveWorkoutId = (state: { savedWorkouts: SavedWorkoutsSlice }) =>
  state.savedWorkouts.activeWorkoutId;

const selectSearchQuery = (state: { savedWorkouts: SavedWorkoutsSlice }) =>
  state.savedWorkouts.searchQuery;

const selectSelectedTags = (state: { savedWorkouts: SavedWorkoutsSlice }) =>
  state.savedWorkouts.selectedTags;

const selectSortBy = (state: { savedWorkouts: SavedWorkoutsSlice }) =>
  state.savedWorkouts.sortBy;

const selectSortOrder = (state: { savedWorkouts: SavedWorkoutsSlice }) =>
  state.savedWorkouts.sortOrder;

// Memoized selectors using createSelector
export const selectAllWorkouts = createSelector(
  [selectWorkouts],
  (workouts) => workouts
);

export const selectActiveWorkout = createSelector(
  [selectWorkouts, selectActiveWorkoutId],
  (workouts, activeWorkoutId) => {
    return workouts.find((workout) => workout.id === activeWorkoutId);
  }
);

export const selectWorkoutById = (
  state: { savedWorkouts: SavedWorkoutsSlice },
  workoutId: string
) => {
  return selectWorkouts(state).find((workout) => workout.id === workoutId);
};

export const selectFilteredAndSortedWorkouts = createSelector(
  [selectWorkouts, selectSearchQuery, selectSelectedTags, selectSortBy, selectSortOrder],
  (workouts, searchQuery, selectedTags, sortBy, sortOrder) => {
    // Filter workouts
    let filteredWorkouts = workouts.filter((workout) => {
      // Search filter
      const matchesSearch = searchQuery
        ? workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workout.mainMuscle.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Tags filter
      const matchesTags = selectedTags.length > 0
        ? selectedTags.every((tag) => workout.tags.includes(tag))
        : true;

      return matchesSearch && matchesTags;
    });

    // Sort workouts
    filteredWorkouts.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case "completedSessions":
          comparison = a.completedSessions - b.completedSessions;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filteredWorkouts;
  }
);

export const selectAllTags = createSelector(
  [selectWorkouts],
  (workouts) => {
    const allTags = workouts.flatMap((workout) => workout.tags);
    return [...new Set(allTags)].sort(); // Remove duplicates and sort
  }
);

export const selectWorkoutStats = createSelector(
  [selectWorkouts],
  (workouts) => {
    return {
      totalWorkouts: workouts.length,
      activeWorkouts: workouts.filter((w) => w.isActive).length,
      totalCompletedSessions: workouts.reduce((sum, w) => sum + w.completedSessions, 0),
      averageRating: workouts.filter((w) => w.rating).length > 0
        ? workouts.reduce((sum, w) => sum + (w.rating || 0), 0) / workouts.filter((w) => w.rating).length
        : 0,
      mostCompletedWorkout: workouts.reduce((max, w) =>
        w.completedSessions > (max?.completedSessions || 0) ? w : max, null as SavedWorkout | null
      ),
    };
  }
);
