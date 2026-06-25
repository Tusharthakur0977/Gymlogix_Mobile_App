import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import {DayItem} from '../../Components/CalendarList';

// Define a type for the slice state
interface initialSlice {
  dates: DayItem[];
  month: string;
  datesLoading: boolean;
  initialIndex: number;
  currentRoute: string | null;

  planTab: number;

  activePlanIndex: number;

  activeNutritionprogramIndex: number;
  activeWorkoutprogramIndex: number;

  currentProgramId: number | null;
  currentProgramList: {
    title: string;
    data: any[];
  };

  homeActiveIndex: number;

  logMealActiveIndex: number;
}

// Define the initial state using that type
const initialState: initialSlice = {
  dates: [],
  month: '',
  datesLoading: false,
  initialIndex: -1,
  currentRoute: null,

  planTab: 0,

  activePlanIndex: 0,
  activeWorkoutprogramIndex: 0,

  activeNutritionprogramIndex: 0,
  currentProgramId: null,
  currentProgramList: {
    title: '',
    data: [],
  },

  homeActiveIndex: 0,

  logMealActiveIndex: 1,
};

export const initialSlice = createSlice({
  name: 'initial',
  initialState,
  reducers: {
    setDates: (state, action: PayloadAction<DayItem[]>) => {
      state.dates = action.payload;
    },
    setMonth: (state, action: PayloadAction<string>) => {
      state.month = action.payload;
    },
    setDatesLoading: (state, action: PayloadAction<boolean>) => {
      state.datesLoading = action.payload;
    },
    setInitialIndex: (state, action: PayloadAction<number>) => {
      state.initialIndex = action.payload;
    },
    setPlanTab: (state, action: PayloadAction<number>) => {
      state.planTab = action.payload;
    },

    setActivePlanIndex: (state, action: PayloadAction<number>) => {
      state.activePlanIndex = action.payload;
    },
    setActiveNutritionprogramIndex: (state, action: PayloadAction<number>) => {
      state.activeNutritionprogramIndex = action.payload;
    },
    setActiveWorkoutprogramIndex: (state, action: PayloadAction<number>) => {
      state.activeWorkoutprogramIndex = action.payload;
    },

    setCurrentRoute: (state, action: PayloadAction<string | null>) => {
      state.currentRoute = action.payload;
    },
    setCurrentprogramId: (state, action: PayloadAction<number | null>) => {
      state.currentProgramId = action.payload;
    },
    setHomeActiveIndex: (state, action: PayloadAction<number>) => {
      state.homeActiveIndex = action.payload;
    },
    setCurrentProgramList: (
      state,
      action: PayloadAction<{title: string; data: any}>,
    ) => {
      state.currentProgramList = action.payload;
    },

    setLogMealActiveIndex: (state, action: PayloadAction<number>) => {
      state.logMealActiveIndex = action.payload;
    },
  },
});

export const {
  setDates,
  setMonth,
  setDatesLoading,
  setInitialIndex,
  setPlanTab,
  setCurrentRoute,
  setActiveNutritionprogramIndex,
  setActiveWorkoutprogramIndex,
  setCurrentprogramId,
  setHomeActiveIndex,
  setCurrentProgramList,
  setActivePlanIndex,
  setLogMealActiveIndex,
} = initialSlice.actions;

export default initialSlice.reducer;
