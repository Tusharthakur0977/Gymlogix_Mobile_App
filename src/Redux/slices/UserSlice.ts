import {createSlice, PayloadAction} from '@reduxjs/toolkit'; // adjust the import path to your actual file
import {User} from '../../Typings/ApiResponse/UserResponse';

interface UserState {
  userData: User | null;
  exerciseHashChanged: boolean;
  foodHashChanged: boolean;
  plandHashChanged: boolean;
}

const initialState: UserState = {
  userData: null,
  exerciseHashChanged: false,
  foodHashChanged: false,
  plandHashChanged: false,
};

const userSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    setUserData(state, action: PayloadAction<User>) {
      state.userData = action.payload;
    },
    clearUserData(state) {
      state.userData = null;
    },
    setExerciseHashChanged(state, action: PayloadAction<boolean>) {
      state.exerciseHashChanged = action.payload;
    },
    setFoodHashChanged(state, action: PayloadAction<boolean>) {
      state.foodHashChanged = action.payload;
    },
    setPlanHashChanged(state, action: PayloadAction<boolean>) {
      state.plandHashChanged = action.payload;
    },
  },
});

export const {
  setUserData,
  clearUserData,
  setExerciseHashChanged,
  setFoodHashChanged,
  setPlanHashChanged,
} = userSlice.actions;
export default userSlice.reducer;
