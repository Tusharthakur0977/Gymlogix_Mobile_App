import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { Exercise, ExerciseSet } from "../../Seeds/ExerciseCatalog";

// Define types for workout history
export type HistoryExerciseSet = ExerciseSet & {
  id: string;
  setNumber: number;
  difficulty?: "easy" | "medium" | "hard" | "failure";
  notes?: string;
  dropSets?: {
    id: string;
    reps: number;
    weight?: number;
    distance?: number;
    time?: number;
  }[];
};

export type HistoryExercise = {
  id: string;
  exercise: Exercise; // Full exercise data from ExerciseCatalog
  sets: HistoryExerciseSet[];
  notes?: string;
  personalRecord?: {
    type: "weight" | "reps" | "time" | "distance";
    value: number;
    date: string;
  };
};

export type WorkoutHistory = {
  id: string;
  date: string; // ISO date string
  startTime: string; // ISO datetime string
  endTime?: string; // ISO datetime string
  duration?: number; // Duration in minutes
  workoutName: string;
  trainingPlanId?: string; // Reference to training plan if applicable
  dayId?: string; // Reference to specific day in training plan
  exercises: HistoryExercise[];
  totalVolume: number; // Total weight lifted (sum of all sets * weight * reps)
  totalSets: number;
  totalReps: number;
  averageRestTime?: number; // Average rest time in seconds
  notes?: string;
  mood?: "excellent" | "good" | "average" | "poor" | "terrible";
  energy?: "high" | "medium" | "low";
  location: "gym" | "home" | "outdoor";
  tags?: string[];
};

export type PersonalRecord = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  type: "weight" | "reps" | "time" | "distance" | "1rm";
  value: number;
  date: string;
  workoutId: string;
  previousRecord?: number;
};

export type WorkoutStats = {
  totalWorkouts: number;
  totalDuration: number; // Total minutes worked out
  totalVolume: number; // Total weight lifted
  totalSets: number;
  totalReps: number;
  averageWorkoutDuration: number;
  averageVolume: number;
  currentStreak: number; // Current workout streak in days
  longestStreak: number; // Longest workout streak in days
  lastWorkoutDate?: string;
  favoriteExercises: string[]; // Exercise IDs
  mostUsedEquipment: string[];
  preferredLocation: "gym" | "home" | "outdoor";
};

// Define the slice state
interface HistorySlice {
  workouts: WorkoutHistory[];
  personalRecords: PersonalRecord[];
  stats: WorkoutStats;
  isLoading: boolean;
  searchQuery: string;
  filterBy: {
    dateRange?: {
      start: string;
      end: string;
    };
    exerciseIds?: string[];
    location?: "gym" | "home" | "outdoor";
    trainingPlanId?: string;
    tags?: string[];
  };
  sortBy: "date" | "duration" | "volume" | "name";
  sortOrder: "asc" | "desc";
}

// Helper function to update workout totals
const updateWorkoutTotals = (workout: WorkoutHistory) => {
  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;

  workout.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      totalSets++;
      totalReps += set.reps;
      if (set.weight) {
        totalVolume += set.reps * set.weight;
      }
      // Add drop sets to totals
      if (set.dropSets) {
        set.dropSets.forEach(dropSet => {
          totalSets++;
          totalReps += dropSet.reps;
          if (dropSet.weight) {
            totalVolume += dropSet.reps * dropSet.weight;
          }
        });
      }
    });
  });

  workout.totalVolume = totalVolume;
  workout.totalSets = totalSets;
  workout.totalReps = totalReps;
};

// Initial state
const initialState: HistorySlice = {
  workouts: [],
  personalRecords: [],
  stats: {
    totalWorkouts: 0,
    totalDuration: 0,
    totalVolume: 0,
    totalSets: 0,
    totalReps: 0,
    averageWorkoutDuration: 0,
    averageVolume: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteExercises: [],
    mostUsedEquipment: [],
    preferredLocation: "gym",
  },
  isLoading: false,
  searchQuery: "",
  filterBy: {},
  sortBy: "date",
  sortOrder: "desc",
};

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    // Workout Management
    addWorkout: (state, action: PayloadAction<WorkoutHistory>) => {
      state.workouts.unshift(action.payload); // Add to beginning for latest first
      // Update stats will be called separately
    },

    updateWorkout: (state, action: PayloadAction<WorkoutHistory>) => {
      const index = state.workouts.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.workouts[index] = action.payload;
        // Update stats will be called separately
      }
    },

    deleteWorkout: (state, action: PayloadAction<string>) => {
      state.workouts = state.workouts.filter(w => w.id !== action.payload);
      // Remove related personal records
      state.personalRecords = state.personalRecords.filter(pr => pr.workoutId !== action.payload);
      // Update stats will be called separately
    },

    // Exercise Management within Workout
    addExerciseToWorkout: (state, action: PayloadAction<{
      workoutId: string;
      exercise: HistoryExercise;
    }>) => {
      const workout = state.workouts.find(w => w.id === action.payload.workoutId);
      if (workout) {
        workout.exercises.push(action.payload.exercise);
        updateWorkoutTotals(workout);
      }
    },

    updateExerciseInWorkout: (state, action: PayloadAction<{
      workoutId: string;
      exerciseId: string;
      exercise: HistoryExercise;
    }>) => {
      const workout = state.workouts.find(w => w.id === action.payload.workoutId);
      if (workout) {
        const exerciseIndex = workout.exercises.findIndex(e => e.id === action.payload.exerciseId);
        if (exerciseIndex !== -1) {
          workout.exercises[exerciseIndex] = action.payload.exercise;
          updateWorkoutTotals(workout);
        }
      }
    },

    removeExerciseFromWorkout: (state, action: PayloadAction<{
      workoutId: string;
      exerciseId: string;
    }>) => {
      const workout = state.workouts.find(w => w.id === action.payload.workoutId);
      if (workout) {
        workout.exercises = workout.exercises.filter(e => e.id !== action.payload.exerciseId);
        updateWorkoutTotals(workout);
      }
    },

    // Set Management
    addSetToExercise: (state, action: PayloadAction<{
      workoutId: string;
      exerciseId: string;
      set: HistoryExerciseSet;
    }>) => {
      const workout = state.workouts.find(w => w.id === action.payload.workoutId);
      if (workout) {
        const exercise = workout.exercises.find(e => e.id === action.payload.exerciseId);
        if (exercise) {
          exercise.sets.push(action.payload.set);
          updateWorkoutTotals(workout);
        }
      }
    },

    updateSetInExercise: (state, action: PayloadAction<{
      workoutId: string;
      exerciseId: string;
      setId: string;
      set: HistoryExerciseSet;
    }>) => {
      const workout = state.workouts.find(w => w.id === action.payload.workoutId);
      if (workout) {
        const exercise = workout.exercises.find(e => e.id === action.payload.exerciseId);
        if (exercise) {
          const setIndex = exercise.sets.findIndex(s => s.id === action.payload.setId);
          if (setIndex !== -1) {
            exercise.sets[setIndex] = action.payload.set;
            updateWorkoutTotals(workout);
          }
        }
      }
    },

    removeSetFromExercise: (state, action: PayloadAction<{
      workoutId: string;
      exerciseId: string;
      setId: string;
    }>) => {
      const workout = state.workouts.find(w => w.id === action.payload.workoutId);
      if (workout) {
        const exercise = workout.exercises.find(e => e.id === action.payload.exerciseId);
        if (exercise) {
          exercise.sets = exercise.sets.filter(s => s.id !== action.payload.setId);
          updateWorkoutTotals(workout);
        }
      }
    },

    // Personal Records
    addPersonalRecord: (state, action: PayloadAction<PersonalRecord>) => {
      // Remove existing record for same exercise and type
      state.personalRecords = state.personalRecords.filter(
        pr => !(pr.exerciseId === action.payload.exerciseId && pr.type === action.payload.type)
      );
      state.personalRecords.push(action.payload);
    },

    updatePersonalRecord: (state, action: PayloadAction<PersonalRecord>) => {
      const index = state.personalRecords.findIndex(pr => pr.id === action.payload.id);
      if (index !== -1) {
        state.personalRecords[index] = action.payload;
      }
    },

    deletePersonalRecord: (state, action: PayloadAction<string>) => {
      state.personalRecords = state.personalRecords.filter(pr => pr.id !== action.payload);
    },

    // Search and Filter
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setFilter: (state, action: PayloadAction<Partial<HistorySlice["filterBy"]>>) => {
      state.filterBy = { ...state.filterBy, ...action.payload };
    },

    clearFilters: (state) => {
      state.filterBy = {};
      state.searchQuery = "";
    },

    setSorting: (state, action: PayloadAction<{
      sortBy: HistorySlice["sortBy"];
      sortOrder: HistorySlice["sortOrder"];
    }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // Utility Actions
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },



    // Helper function to update overall stats
    updateStats: (state) => {
      const workouts = state.workouts;
      
      state.stats.totalWorkouts = workouts.length;
      state.stats.totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      state.stats.totalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);
      state.stats.totalSets = workouts.reduce((sum, w) => sum + w.totalSets, 0);
      state.stats.totalReps = workouts.reduce((sum, w) => sum + w.totalReps, 0);
      
      state.stats.averageWorkoutDuration = workouts.length > 0 
        ? state.stats.totalDuration / workouts.length 
        : 0;
      
      state.stats.averageVolume = workouts.length > 0 
        ? state.stats.totalVolume / workouts.length 
        : 0;

      // Calculate streaks
      const sortedWorkouts = [...workouts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      if (sortedWorkouts.length > 0) {
        state.stats.lastWorkoutDate = sortedWorkouts[0].date;
        
        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (const workout of sortedWorkouts) {
          const workoutDate = new Date(workout.date);
          workoutDate.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === currentStreak || (currentStreak === 0 && daysDiff <= 1)) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        state.stats.currentStreak = currentStreak;
      }

      // Calculate favorite exercises and equipment
      const exerciseCount: { [key: string]: number } = {};
      const equipmentCount: { [key: string]: number } = {};
      const locationCount: { [key: string]: number } = {};

      workouts.forEach(workout => {
        locationCount[workout.location] = (locationCount[workout.location] || 0) + 1;
        
        workout.exercises.forEach(exercise => {
          exerciseCount[exercise.exercise.id] = (exerciseCount[exercise.exercise.id] || 0) + 1;
          equipmentCount[exercise.exercise.equipment] = (equipmentCount[exercise.exercise.equipment] || 0) + 1;
        });
      });

      state.stats.favoriteExercises = Object.entries(exerciseCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id);

      state.stats.mostUsedEquipment = Object.entries(equipmentCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([equipment]) => equipment);

      state.stats.preferredLocation = Object.entries(locationCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as "gym" | "home" | "outdoor" || "gym";
    },

    // Bulk operations
    importWorkouts: (state, action: PayloadAction<WorkoutHistory[]>) => {
      state.workouts = [...action.payload, ...state.workouts];
      // Update stats will be called separately
    },

    resetHistory: (state) => {
      state.workouts = [];
      state.personalRecords = [];
      state.stats = initialState.stats;
      state.searchQuery = "";
      state.filterBy = {};
    },
  },
});

export const {
  addWorkout,
  updateWorkout,
  deleteWorkout,
  addExerciseToWorkout,
  updateExerciseInWorkout,
  removeExerciseFromWorkout,
  addSetToExercise,
  updateSetInExercise,
  removeSetFromExercise,
  addPersonalRecord,
  updatePersonalRecord,
  deletePersonalRecord,
  setSearchQuery,
  setFilter,
  clearFilters,
  setSorting,
  setIsLoading,
  importWorkouts,
  resetHistory,
  updateStats,
} = historySlice.actions;

export default historySlice.reducer;

// Selectors
export const selectAllWorkouts = (state: { history: HistorySlice }) => state.history.workouts;
export const selectWorkoutById = (state: { history: HistorySlice }, id: string) =>
  state.history.workouts.find(workout => workout.id === id);

export const selectPersonalRecords = (state: { history: HistorySlice }) => state.history.personalRecords;
export const selectPersonalRecordsByExercise = (state: { history: HistorySlice }, exerciseId: string) =>
  state.history.personalRecords.filter(pr => pr.exerciseId === exerciseId);

export const selectWorkoutStats = (state: { history: HistorySlice }) => state.history.stats;

export const selectFilteredWorkouts = (state: { history: HistorySlice }) => {
  let workouts = state.history.workouts;
  const { searchQuery, filterBy, sortBy, sortOrder } = state.history;

  // Apply search filter
  if (searchQuery) {
    workouts = workouts.filter(workout =>
      workout.workoutName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.exercises.some(exercise =>
        exercise.exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }

  // Apply filters
  if (filterBy.dateRange) {
    workouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      const startDate = new Date(filterBy.dateRange!.start);
      const endDate = new Date(filterBy.dateRange!.end);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  }

  if (filterBy.location) {
    workouts = workouts.filter(workout => workout.location === filterBy.location);
  }

  if (filterBy.trainingPlanId) {
    workouts = workouts.filter(workout => workout.trainingPlanId === filterBy.trainingPlanId);
  }

  if (filterBy.exerciseIds && filterBy.exerciseIds.length > 0) {
    workouts = workouts.filter(workout =>
      workout.exercises.some(exercise =>
        filterBy.exerciseIds!.includes(exercise.exercise.id)
      )
    );
  }

  if (filterBy.tags && filterBy.tags.length > 0) {
    workouts = workouts.filter(workout =>
      workout.tags?.some(tag => filterBy.tags!.includes(tag))
    );
  }

  // Apply sorting
  workouts.sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case "date":
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case "duration":
        aValue = a.duration || 0;
        bValue = b.duration || 0;
        break;
      case "volume":
        aValue = a.totalVolume;
        bValue = b.totalVolume;
        break;
      case "name":
        aValue = a.workoutName.toLowerCase();
        bValue = b.workoutName.toLowerCase();
        break;
      default:
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return workouts;
};

export const selectRecentWorkouts = (state: { history: HistorySlice }, limit: number = 5) =>
  state.history.workouts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

export const selectWorkoutsByExercise = (state: { history: HistorySlice }, exerciseId: string) =>
  state.history.workouts.filter(workout =>
    workout.exercises.some(exercise => exercise.exercise.id === exerciseId)
  );

export const selectExerciseHistory = (state: { history: HistorySlice }, exerciseId: string) => {
  const workouts = selectWorkoutsByExercise(state, exerciseId);
  const exerciseHistory: Array<{
    date: string;
    workoutId: string;
    workoutName: string;
    sets: HistoryExerciseSet[];
    notes?: string;
  }> = [];

  workouts.forEach(workout => {
    const exercise = workout.exercises.find(ex => ex.exercise.id === exerciseId);
    if (exercise) {
      exerciseHistory.push({
        date: workout.date,
        workoutId: workout.id,
        workoutName: workout.workoutName,
        sets: exercise.sets,
        notes: exercise.notes,
      });
    }
  });

  return exerciseHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const selectWorkoutsByDateRange = (
  state: { history: HistorySlice },
  startDate: string,
  endDate: string
) =>
  state.history.workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return workoutDate >= start && workoutDate <= end;
  });

export const selectIsLoading = (state: { history: HistorySlice }) => state.history.isLoading;
export const selectSearchQuery = (state: { history: HistorySlice }) => state.history.searchQuery;
export const selectFilters = (state: { history: HistorySlice }) => state.history.filterBy;
export const selectSorting = (state: { history: HistorySlice }) => ({
  sortBy: state.history.sortBy,
  sortOrder: state.history.sortOrder,
});
