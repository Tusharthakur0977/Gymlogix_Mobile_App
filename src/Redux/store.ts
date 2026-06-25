import {configureStore} from '@reduxjs/toolkit';
import {useDispatch, useSelector} from 'react-redux';
import initialReducer from './slices/initialSlice';
import modalReducer from './slices/modalSlice';
import newWorkoutReducer from './slices/newWorkoutSlice';
import exerciseCatalogReducer from './slices/exerciseCatalogSlice';
import historyReducer, {
  importWorkouts,
  addPersonalRecord,
  updateStats,
} from './slices/historySlice';
import muscleReducer from './slices/muscleSlice';
import ingredientReducer from './slices/ingredientSlice';
import savedWorkoutsReducer from './slices/savedWorkoutsSlice';
import trainingPlansReducer from './slices/trainingPlansSlice';
import newMealReducer from './slices/newMealSlice';
import myMealReducer from './slices/myMealsSlice';
import {workoutHistoryData, personalRecordsData} from '../Seeds/WorkoutHistory';
import userReducer from './slices/UserSlice';
import PlanReducer from './slices/PlanDataSlice';
import foodDataReducer from './slices/foodSlice';
import exerciseReducer from './slices/ExerciseSlice';
import scheduleReducer from './slices/ScheduleSlice';
import insightReducer from './slices/InsightSlice';
import quickReducer from './slices/QuickMeals';
import macroReducer from './slices/macroSlice';
import logWorkoutReducer from './slices/LogWorkoutSlice';
import workoutDataReducer from './slices/workoutDataSlice';
import tempExerciseSelectionReducer from './slices/tempExerciseSelectionSlice';

export const store = configureStore({
  reducer: {
    initial: initialReducer,
    modals: modalReducer,
    newWorkout: newWorkoutReducer,
    exerciseCatalog: exerciseCatalogReducer,
    history: historyReducer,
    muscle: muscleReducer,
    savedWorkouts: savedWorkoutsReducer,
    trainingPlans: trainingPlansReducer,
    ingredients: ingredientReducer,
    newMeal: newMealReducer,
    myMeals: myMealReducer,
    userData: userReducer,
    planData: PlanReducer,
    foodData: foodDataReducer,
    exerciseData: exerciseReducer,
    scheduleData: scheduleReducer,
    insightData: insightReducer,
    quickMeals: quickReducer,
    macros: macroReducer,
    logWorkoutData: logWorkoutReducer,
    workoutData: workoutDataReducer,
    tempExerciseSelection: tempExerciseSelectionReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Initialize history with seed data
store.dispatch(importWorkouts(workoutHistoryData));
personalRecordsData.forEach(pr => store.dispatch(addPersonalRecord(pr)));
store.dispatch(updateStats());
