import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import {IngredientItem, Ingredients} from '../../Seeds/MealPlansData';

// Interface for the training plans slice state
interface IngredientSlice {
  ingreidnetList: IngredientItem[];
}

// Define the initial state using that type
const initialState: IngredientSlice = {
  ingreidnetList: [],
};

export const IngredientSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    addnewIngredient: (state, action: PayloadAction<IngredientItem>) => {
      state.ingreidnetList.push(action.payload);
    },
    setIngredients: (state, action: PayloadAction<IngredientItem[]>) => {
      state.ingreidnetList = action.payload;
    },
  },
});

export const {addnewIngredient, setIngredients} = IngredientSlice.actions;

export default IngredientSlice.reducer;
