// macroSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Ingredient {
  id: string | number;
  title: string;
  percentage: number;
  calories: number[]; // [calories, fat, protein, carbs]
}

interface MacroState {
  ingredients: Ingredient[];
  totalMacros: {
    calories: number;
    fat: number;
    protein: number;
    carbs: number;
  };
}

const initialState: MacroState = {
  ingredients: [],
  totalMacros: {
    calories: 0,
    fat: 0,
    protein: 0,
    carbs: 0,
  },
};

const macroSlice = createSlice({
  name: 'macros',
  initialState,
  reducers: {
    setIngredients: (state, action: PayloadAction<Ingredient[]>) => {
      state.ingredients = action.payload;
      state.totalMacros = calculateTotals(state.ingredients);
    },
    updateIngredientPercentage: (
      state,
      action: PayloadAction<{
        id: string | number;
        direction: 'increase' | 'decrease';
      }>,
    ) => {
      state.ingredients = state.ingredients.map(item => {
        if (String(item.id) === String(action.payload.id)) {
          const currentPercentage = item.percentage ?? 100;
          const newPercentage =
            action.payload.direction === 'increase'
              ? Math.min(200, currentPercentage + 10)
              : Math.max(0, currentPercentage - 10);
          return {...item, percentage: newPercentage};
        }
        return item;
      });
      state.totalMacros = calculateTotals(state.ingredients);
    },
  },
});

const calculateTotals = (ingredients: Ingredient[]) => {
  return ingredients.reduce(
    (acc, item) => {
      const factor = (item.percentage ?? 100) / 100;
      acc.calories += item.calories[0] * factor;
      acc.fat += item.calories[1] * factor;
      acc.protein += item.calories[2] * factor;
      acc.carbs += item.calories[3] * factor;
      return acc;
    },
    {calories: 0, fat: 0, protein: 0, carbs: 0},
  );
};

export const {setIngredients, updateIngredientPercentage} = macroSlice.actions;
export default macroSlice.reducer;
