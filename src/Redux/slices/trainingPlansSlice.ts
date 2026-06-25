import type {PayloadAction} from '@reduxjs/toolkit';
import {createSelector, createSlice} from '@reduxjs/toolkit';
import {Exercise} from '../../Seeds/ExerciseCatalog';
import TrainingPlansData, {
  TrainingPlan,
  WeeklyStructure,
} from '../../Seeds/TrainingPLans';

// Interface for the training plans slice state
interface TrainingPlansSlice {
  plans: TrainingPlan[];
  activePlanId: string | null;
  searchQuery: string;
  selectedTags: string[];
  isLoading: boolean;
  lastUpdated: string | null;
}

// Define the initial state using that type
const initialState: TrainingPlansSlice = {
  plans: [], // Load initial training plans from seed data
  activePlanId: null,
  searchQuery: '',
  selectedTags: [],
  isLoading: false,
  lastUpdated: null,
};

export const trainingPlansSlice = createSlice({
  name: 'trainingPlans',
  initialState,
  reducers: {
    // Add a new training plan
    addTrainingPlan: (state, action: PayloadAction<TrainingPlan>) => {
      state.plans.push(action.payload);
      state.lastUpdated = new Date().toISOString();
    },

    // Update an existing training plan
    updateTrainingPlan: (state, action: PayloadAction<TrainingPlan>) => {
      const index = state.plans.findIndex(
        plan => plan.id === action.payload.id,
      );
      if (index !== -1) {
        state.plans[index] = action.payload;
        state.lastUpdated = new Date().toISOString();
      }
    },

    // Delete a training plan
    deleteTrainingPlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
      if (state.activePlanId === action.payload) {
        state.activePlanId = null;
      }
      state.lastUpdated = new Date().toISOString();
    },

    // Set active training plan
    setActivePlan: (state, action: PayloadAction<string>) => {
      state.activePlanId = action.payload;
    },

    // Clear active training plan
    clearActivePlan: state => {
      state.activePlanId = null;
    },

    // Add exercises to a specific day in a training plan
    addExercisesToDay: (
      state,
      action: PayloadAction<{
        planId: any;
        dayId: string;
        exercises: Exercise[];
      }>,
    ) => {
      const {planId, dayId, exercises} = action.payload;

      console.log(planId, dayId, exercises, 'JJJJJ');

      const planIndex = state.plans.findIndex(plan => plan.id === planId);

      console.log(planIndex, 'LLLLL');

      if (planIndex !== -1) {
        const plan = state.plans[planIndex];
        const dayIndex = plan.weeklyStructure.findIndex(
          day => day.day === dayId,
        );

        if (dayIndex !== -1) {
          // Add exercises to the existing exercises array
          plan.weeklyStructure[dayIndex].exercises.push(...exercises);
          state.lastUpdated = new Date().toISOString();
        }
      }
    },

    // Remove exercise from a specific day in a training plan
    removeExerciseFromDay: (
      state,
      action: PayloadAction<{
        planId: string;
        dayId: string;
        exerciseId: string;
      }>,
    ) => {
      const {planId, dayId, exerciseId} = action.payload;
      const planIndex = state.plans.findIndex(plan => plan.id === planId);

      if (planIndex !== -1) {
        const plan = state.plans[planIndex];
        const dayIndex = plan.weeklyStructure.findIndex(
          day => day.day === dayId,
        );

        if (dayIndex !== -1) {
          plan.weeklyStructure[dayIndex].exercises = plan.weeklyStructure[
            dayIndex
          ].exercises.filter(exercise => exercise.id !== exerciseId);
          state.lastUpdated = new Date().toISOString();
        }
      }
    },

    // Update day details (warmUp, coolDown, etc.)
    updateDayDetails: (
      state,
      action: PayloadAction<{
        planId: string;
        dayId: string;
        updates: Partial<WeeklyStructure>;
      }>,
    ) => {
      const {planId, dayId, updates} = action.payload;
      const planIndex = state.plans.findIndex(plan => plan.id === planId);

      if (planIndex !== -1) {
        const plan = state.plans[planIndex];
        const dayIndex = plan.weeklyStructure.findIndex(
          day => day.day === dayId,
        );

        if (dayIndex !== -1) {
          plan.weeklyStructure[dayIndex] = {
            ...plan.weeklyStructure[dayIndex],
            ...updates,
          };
          state.lastUpdated = new Date().toISOString();
        }
      }
    },

    // Add a new day to a training plan
    addDayToPlan: (
      state,
      action: PayloadAction<{
        planId: string;
        day: WeeklyStructure;
      }>,
    ) => {
      const {planId, day} = action.payload;
      const planIndex = state.plans.findIndex(plan => plan.id === planId);

      if (planIndex !== -1) {
        state.plans[planIndex].weeklyStructure.push(day);
        state.lastUpdated = new Date().toISOString();
      }
    },

    // Remove a day from a training plan
    removeDayFromPlan: (
      state,
      action: PayloadAction<{
        planId: string;
        dayId: string;
      }>,
    ) => {
      const {planId, dayId} = action.payload;
      const planIndex = state.plans.findIndex(plan => plan.id === planId);

      if (planIndex !== -1) {
        state.plans[planIndex].weeklyStructure = state.plans[
          planIndex
        ].weeklyStructure.filter(day => day.day !== dayId);
        state.lastUpdated = new Date().toISOString();
      }
    },

    // Search and filter actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload;
    },

    clearFilters: state => {
      state.searchQuery = '';
      state.selectedTags = [];
    },

    // Loading state
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Reset all training plans to initial state
    resetTrainingPlans: state => {
      state.plans = TrainingPlansData;
      state.activePlanId = null;
      state.searchQuery = '';
      state.selectedTags = [];
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const {
  addTrainingPlan,
  updateTrainingPlan,
  deleteTrainingPlan,
  setActivePlan,
  clearActivePlan,
  addExercisesToDay,
  removeExerciseFromDay,
  updateDayDetails,
  addDayToPlan,
  removeDayFromPlan,
  setSearchQuery,
  setSelectedTags,
  clearFilters,
  setIsLoading,
  resetTrainingPlans,
} = trainingPlansSlice.actions;

export default trainingPlansSlice.reducer;

// Base selectors for accessing state
const selectTrainingPlans = (state: {trainingPlans: TrainingPlansSlice}) =>
  state.trainingPlans.plans;

const selectActivePlanId = (state: {trainingPlans: TrainingPlansSlice}) =>
  state.trainingPlans.activePlanId;

const selectSearchQuery = (state: {trainingPlans: TrainingPlansSlice}) =>
  state.trainingPlans.searchQuery;

const selectSelectedTags = (state: {trainingPlans: TrainingPlansSlice}) =>
  state.trainingPlans.selectedTags;

const selectIsLoading = (state: {trainingPlans: TrainingPlansSlice}) =>
  state.trainingPlans.isLoading;

const selectLastUpdated = (state: {trainingPlans: TrainingPlansSlice}) =>
  state.trainingPlans.lastUpdated;

// Memoized selectors for better performance
export const selectAllTrainingPlans = createSelector(
  [selectTrainingPlans],
  plans => plans,
);

export const selectActivePlan = createSelector(
  [selectTrainingPlans, selectActivePlanId],
  (plans, activePlanId) =>
    activePlanId ? plans.find(plan => plan.id === activePlanId) : null,
);

export const selectPlanById = createSelector(
  [selectTrainingPlans, (state: any, planId: string) => planId],
  (plans, planId) => plans.find(plan => plan.id === planId),
);

export const selectFilteredTrainingPlans = createSelector(
  [selectTrainingPlans, selectSearchQuery, selectSelectedTags],
  (plans, searchQuery, selectedTags) => {
    let filteredPlans = plans;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPlans = filteredPlans.filter(
        plan =>
          plan.name.toLowerCase().includes(query) ||
          plan.goal.toLowerCase().includes(query) ||
          plan.targetAudience.toLowerCase().includes(query) ||
          plan.tags.some(tag => tag.toLowerCase().includes(query)),
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filteredPlans = filteredPlans.filter(plan =>
        selectedTags.every(tag => plan.tags.includes(tag)),
      );
    }

    return filteredPlans;
  },
);

export const selectAllTags = createSelector([selectTrainingPlans], plans => {
  const allTags = plans.flatMap(plan => plan.tags);
  return Array.from(new Set(allTags)).sort();
});

export const selectPlansByGoal = createSelector(
  [selectTrainingPlans],
  plans => {
    const plansByGoal: {[key: string]: TrainingPlan[]} = {};
    plans.forEach(plan => {
      if (!plansByGoal[plan.goal]) {
        plansByGoal[plan.goal] = [];
      }
      plansByGoal[plan.goal].push(plan);
    });
    return plansByGoal;
  },
);
