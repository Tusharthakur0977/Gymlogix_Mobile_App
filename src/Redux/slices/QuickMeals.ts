// quickMealsSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface QuickMealsState {
  meals: any[];
  source: string | null; // to track which screen you came from
}

const initialState: QuickMealsState = {
  meals: [],
  source: null,
};

const quickMealsSlice = createSlice({
  name: 'quickMeals',
  initialState,
  reducers: {
    setQuickMeals: (state, action: PayloadAction<any[]>) => {
      state.meals = action.payload;
    },
    addQuickMeal: (state, action: PayloadAction<any>) => {
      state.meals.push(action.payload);
    },
    clearQuickMeals: state => {
      state.meals = [];
      state.source = null;
    },
    removeQuickMeals: (state, action: PayloadAction<string[]>) => {
      state.meals = state.meals.filter(
        item => !action.payload.includes(item.title),
      );
    },
    setSource: (state, action: PayloadAction<string | null>) => {
      state.source = action.payload;
    },
  },
});

export const {
  setQuickMeals,
  addQuickMeal,
  clearQuickMeals,
  setSource,
  removeQuickMeals,
} = quickMealsSlice.actions;

export default quickMealsSlice.reducer;
