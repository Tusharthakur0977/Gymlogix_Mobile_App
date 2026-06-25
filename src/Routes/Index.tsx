import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import BottomTabBar from "../Components/BottomTabBar";
import AddNewExercise from "../Screens/AddNewExercise";
import AddNewMeal from "../Screens/AddNewMeal";
import AddNewWorkout from "../Screens/AddNewWorkout";
import EditMealDetails from "../Screens/EditMealDetails";
import ExerciseList from "../Screens/ExerciseList";
import ExerciseSettings from "../Screens/ExerciseSettings";
import ForgotPassword from "../Screens/ForgotPassword";
import HOME from "../Screens/Home";
import IngredientList from "../Screens/IngredientList";
import INSIGHT from "../Screens/Insight";
import LogMeal from "../Screens/LogMeal";
import MealDetails from "../Screens/MealDetails";
import PLAN from "../Screens/Plan";
import ResetPassword from "../Screens/ResetPassword";
import SavedWorkouts from "../Screens/SavedWorkouts";
import SETTINGS from "../Screens/Settings";
import SignIn from "../Screens/SignIn";
import SignUp from "../Screens/SignUp";
import Splash from "../Screens/Splash";
import STATS from "../Screens/Stats";
import Welcome from "../Screens/Welcome";
import WorkoutProgramDetails from "../Screens/WorkoutProgramDetails";
import WorkoutResult from "../Screens/WorkoutResult";
import {
  AuthStackParams,
  BottomTabParams,
  MainStackParams,
  RootStackParams,
} from "../Typings/route";

const RootStack = createNativeStackNavigator<RootStackParams>();
const Auth = createNativeStackNavigator<AuthStackParams>();
const Tabs = createBottomTabNavigator<BottomTabParams>();
const Main = createNativeStackNavigator<MainStackParams>();

const Routing = () => {
  function AuthStack() {
    return (
      <Auth.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Auth.Screen name="welcome" component={Welcome} />
        <Auth.Screen name="signIn" component={SignIn} />
        <Auth.Screen name="signUp" component={SignUp} />
        <Auth.Screen name="forgotpassword" component={ForgotPassword} />
        <Auth.Screen name="resetPassword" component={ResetPassword} />
      </Auth.Navigator>
    );
  }

  function TabStack() {
    return (
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <BottomTabBar {...props} />}
      >
        <Tabs.Screen
          options={{
            title: "HOME",
          }}
          name="HOME"
          component={HOME}
        />
        <Tabs.Screen
          options={{
            title: "PLAN",
          }}
          name="PLAN"
          component={PLAN}
        />
        <Tabs.Screen
          options={{
            title: "STATS",
          }}
          name="STATS"
          component={STATS}
        />
        <Tabs.Screen
          options={{
            title: "INSIGHT",
          }}
          name="INSIGHT"
          component={INSIGHT}
        />
        <Tabs.Screen
          options={{
            title: "SETTINGS",
          }}
          name="SETTINGS"
          component={SETTINGS}
        />
      </Tabs.Navigator>
    );
  }

  function MianStack() {
    return (
      <Main.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Main.Screen name="tabs" component={TabStack} />
        <Main.Screen name="mealDetails" component={MealDetails} />
        <Main.Screen name="editMealDetails" component={EditMealDetails} />
        <Main.Screen name="logMeal" component={LogMeal} />
        <Main.Screen
          name="workoutProgramDetails"
          component={WorkoutProgramDetails}
        />
        <Main.Screen name="workoutResult" component={WorkoutResult} />
        <Main.Screen name="exerciseList" component={ExerciseList} />
        <Main.Screen name="addNewWorkout" component={AddNewWorkout} />
        <Main.Screen name="addNewExercise" component={AddNewExercise} />
        <Main.Screen name="savedWorkouts" component={SavedWorkouts} />
        <Main.Screen name="exerciseSettings" component={ExerciseSettings} />
        <Main.Screen name="addNewMeal" component={AddNewMeal} />
        <Main.Screen name="ingredientList" component={IngredientList} />
      </Main.Navigator>
    );
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <RootStack.Screen name="splash" component={Splash} />
      <RootStack.Screen name="authStack" component={AuthStack} />
      <RootStack.Screen name="mainStack" component={MianStack} />
    </RootStack.Navigator>
  );
};

export default Routing;
