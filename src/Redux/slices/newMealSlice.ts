import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import {IngredientItem, Ingredients} from '../../Seeds/MealPlansData';
import {Asset} from 'react-native-image-picker';
import {CapturedPhoto} from '../../Screens/AddNewMeal';

// Interface for the training plans slice state
interface MealSlice {
  coverImage: CapturedPhoto | null;
  title: string;
  description: string;
  macros: {
    calories: string;
    fat: string;
    carbs: string;
    protein: string;
  };
  instructions: string;
  fileData: null;
  ingredients: IngredientItem[];
  mealImages: Asset[];
}

// Define the initial state using that type
const initialState: MealSlice = {
  coverImage: null,
  title: '',
  description: '',
  macros: {
    calories: '512',
    fat: '12',
    carbs: '9',
    protein: '30',
  },
  instructions: '',
  fileData: null,
  ingredients: [],
  mealImages: [],
};

export const MealSlice = createSlice({
  name: 'newmeal',
  initialState,
  reducers: {
    // Action to set the cover image
    setCoverImage: (state, action: PayloadAction<CapturedPhoto>) => {
      state.coverImage = action.payload;
    },

    // Action to set the title
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },

    // Action to set the description
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },

    // Action to set the instrutions
    setInstructions: (state, action: PayloadAction<string>) => {
      state.instructions = action.payload;
    },

    // Action to set macros
    setMacros: (
      state,
      action: PayloadAction<{
        calories?: string;
        fat?: string;
        carbs?: string;
        protein?: string;
      }>,
    ) => {
      state.macros = {
        ...state.macros,
        ...action.payload,
      };
    },

    // Action to add an ingredient
    addIngredient: (state, action: PayloadAction<IngredientItem>) => {
      state.ingredients.push(action.payload);
    },
    // Action to set ingredients
    setIngredient: (state, action: PayloadAction<IngredientItem[]>) => {
      const existingIds = new Set(state.ingredients.map(item => item.id));

      const uniqueItems = action.payload.filter(
        item => !existingIds.has(item.id),
      );
      state.ingredients.push(...uniqueItems);
    },

    // Action to remove an ingredient by ID
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        ingredient => ingredient.id !== action.payload,
      );
    },

    // Action to add a meal image
    addMealImage: (state, action: PayloadAction<Asset>) => {
      state.mealImages.push(action.payload);
    },

    setMealImages: (state, action: PayloadAction<Asset[]>) => {
      state.mealImages = action.payload;
    },

    // Action to remove a meal image
    removeMealImage: (state, action: PayloadAction<number>) => {
      state.mealImages = state.mealImages.filter(
        (_, index) => index !== action.payload,
      );
    },

    setFileData: (state, action) => {
      state.fileData = action.payload;
    },

    // Action to add a complete meal
    addNewMeal: (
      state,
      action: PayloadAction<{
        coverImage: CapturedPhoto;
        title: string;
        description: string;
        macros: {
          calories: string;
          fat: string;
          carbs: string;
          protein: string;
        };
        ingredients: IngredientItem[];
        mealImages: Asset[];
      }>,
    ) => {
      state.coverImage = action.payload.coverImage;
      state.title = action.payload.title;
      state.description = action.payload.description;
      state.macros = action.payload.macros;
      state.ingredients = action.payload.ingredients;
      state.mealImages = action.payload.mealImages;
    },

    // Action to reset the meal state
    resetMeal: state => {
      return initialState;
    },
  },
});

// Export actions
export const {
  setCoverImage,
  setTitle,
  setDescription,
  setInstructions,
  setMealImages,
  setMacros,
  addIngredient,
  removeIngredient,
  setIngredient,
  addMealImage,
  removeMealImage,
  addNewMeal,
  resetMeal,
  setFileData,
} = MealSlice.actions;

// Export reducer
export default MealSlice.reducer;
