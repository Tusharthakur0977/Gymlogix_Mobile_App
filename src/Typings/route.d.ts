import {NavigatorScreenParams} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WeeklyStructure} from '../Seeds/TrainingPLans';

export type RootStackParams = {
  splash: undefined;
  authStack: NavigatorScreenParams<AuthStackParams>;
  mainStack: NavigatorScreenParams<MainStackParams>;
};

export type AuthStackParams = {
  welcome: undefined;
  signIn: undefined;
  signUp: undefined;
  forgotpassword: undefined;
  resetPassword: {
    isEmail: string;
  };
};

export type MainStackParams = {
  tabs: NavigatorScreenParams<BottomTabParams>;
  mealDetails: {
    mealId: number;
    isFromMyMeal?: boolean;
  };
  editMealDetails: {
    mealId: number;
  };
  programDetails: {
    programId: string;
  };
  programsList: {
    data: any;
    title: string;
  };
  logMeal: {
    mealId: string | number;
  };
  workoutProgramDetails: {
    programId: string | number;
    day: WeeklyStructure[];
    selectedProgram: any;
    ScheduleHistoryData: any;
    isFrom: boolean;
    sets: any;
  };
  workoutResult: {
    workoutData: any;
  };
  exerciseList: {
    fromTrainingPlan?: {
      programId: string;
      dayIndex: number;
      dayId: string;
      exerciseIds?: string[];
    };
  };
  addNewWorkout: undefined;
  addNewExercise: undefined;
  savedWorkouts: undefined;
  exerciseSettings: {exerciseId: string};
  addNewMeal: undefined;
  ingredientList: {
    isFrom?: string;
    mealId?: number | string;
  };
};

export type BottomTabParams = {
  HOME: undefined;
  PLAN: undefined;
  STATS: undefined;
  INSIGHT: undefined;
  SETTINGS: undefined;
};

// SCREEN PROPS -------------------------------------------------------------------------------

// Splash Screens
export type SplashProps = NativeStackScreenProps<RootStackParams, 'splash'>;

// Auth Screens

export type WelcomeProps = NativeStackScreenProps<AuthStackParams, 'welcome'>;
export type SignInProps = NativeStackScreenProps<
  AuthStackParams & RootStackParams,
  'signIn'
>;
export type SignUpProps = NativeStackScreenProps<
  AuthStackParams & RootStackParams,
  'signUp'
>;
export type ForgotPasswordProps = NativeStackScreenProps<
  AuthStackParams,
  'forgotpassword'
>;
export type ResetPasswordProps = NativeStackScreenProps<
  AuthStackParams,
  'resetPassword'
>;

// Main Screens
export type HomeTabScreenProps = NativeStackScreenProps<
  MainStackParams & BottomTabParams,
  'HOME'
>;

export type PlanTabScreenProps = NativeStackScreenProps<
  MainStackParams & BottomTabParams,
  'PLAN'
>;

// Meal Screen Props
export type MealDetailScreenProps = NativeStackScreenProps<
  MainStackParams,
  'mealDetails'
>;

// Meal Screen Props
export type EditMealDetailScreenProps = NativeStackScreenProps<
  MainStackParams,
  'editMealDetails'
>;

// Log Meal Screen Props
export type LogMealScreenProps = NativeStackScreenProps<
  MainStackParams,
  'logMeal'
>;

// Log Workout Program Details Screen Props
export type LogWorkoutProgramDetailsScreenProps = NativeStackScreenProps<
  MainStackParams,
  'workoutProgramDetails'
>;

// Workout Result Screen Props
export type WorkoutResultScreenProps = NativeStackScreenProps<
  MainStackParams,
  'workoutResult'
>;

// Workout Result Screen Props
export type ExerciseListScreenProps = NativeStackScreenProps<
  MainStackParams,
  'exerciseList'
>;
// Add New Workout Screen Props
export type AddNewWorkoutScreenProps = NativeStackScreenProps<
  MainStackParams,
  'addNewWorkout'
>;

// Add New Exercise Screen Props
export type AddNewExerciseScreenProps = NativeStackScreenProps<
  MainStackParams,
  'addNewExercise'
>;

// Saved Workouts Screen Props
export type SavedWorkoutsScreenProps = NativeStackScreenProps<
  MainStackParams,
  'savedWorkouts'
>;

// Exercise Settings Screen Props
export type ExerciseSettingsScreenProps = NativeStackScreenProps<
  MainStackParams,
  'exerciseSettings'
>;

// Exercise Settings Screen Props
export type AddNewMealScreenProps = NativeStackScreenProps<
  MainStackParams,
  'addNewMeal'
>;

// Ingredient List Screen Props
export type IngredientScreenProps = NativeStackScreenProps<
  MainStackParams,
  'ingredientList'
>;
export type SettingScreenProps = NativeStackScreenProps<
  BottomTabParams & RootStackParams,
  'SETTINGS'
>;
