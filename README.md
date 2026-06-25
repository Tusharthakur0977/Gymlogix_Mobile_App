# 🏋️ GymLogix Mobile App

A high-performance, feature-rich fitness and workout tracking mobile application built with **React Native**. GymLogix empowers users to design custom workout routines, track live workout sessions with complex metrics (like supersets and rest timers), monitor nutrition, and visualize fitness progress over time. 

Designed with modern architectural patterns and advanced state management, this project showcases my ability to build production-ready, scalable mobile applications that solve complex real-world user interactions.

---

## 🚀 Tech Stack

- **Core Framework:** React Native (v0.77.1) with TypeScript
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`) & React-Redux
- **Routing & Navigation:** React Navigation v7 (Native Stack, Bottom Tabs, Drawer)
- **Authentication:** Firebase Auth (`@react-native-firebase/auth`) & Google Sign-In
- **Networking:** Axios for REST API interactions
- **Local Storage:** AsyncStorage (`@react-native-async-storage/async-storage`)
- **UI & Animations:** 
  - `react-native-reanimated` & `react-native-gesture-handler` (60fps animations)
  - `lottie-react-native` (complex vector animations)
  - `react-native-linear-gradient` (modern UI styling)
- **Data Visualization & Tools:**
  - `react-native-gifted-charts` (performance analytics)
  - `react-native-calendars` (workout scheduling)
  - `react-native-draggable-flatlist` (custom workout builder)
- **Monetization:** `react-native-iap` (In-App Purchases)

---

## ⭐ Spotlight Feature: The Live Workout Engine (`WorkoutProgramDetails`)

The most technically complex feature of GymLogix is the **Live Workout Tracker**. This engine handles real-time workout execution, serving as the core interactive hub for the user while they are at the gym.

### **Engineering Challenges & Solutions:**
- **Superset & Grouped Exercise Logic:** The engine isn't just a simple list. It dynamically handles both individual exercises and "Supersets" (grouped exercises performed back-to-back). This required creating a complex union type (`Exercise | Superset`) and a recursive rendering tree to manage nested states and UI without performance degradation.
- **Concurrent Timer Management:** The app tracks individual time-under-tension for specific exercises while simultaneously tracking overall workout duration and rest periods between sets. I utilized Redux middleware and `InteractionManager` to ensure timers stay accurate even when the app goes into the background or the JS thread is busy.
- **Resilient State Persistence (Draft Workouts):** Since users might accidentally close the app or lose connection, the Redux store (`LogWorkoutSlice`) handles "Draft" states. Actions like `setWorkoutProgress`, `pauseExerciseTimer`, and `setSupersetData` ensure every single rep and second is saved locally before pushing to the backend.
- **Multi-Tab Performance Context:** The screen integrates four distinct contexts (Exercises, History, Details, and Coach’s Corner) inside a single fluid view. By memoizing components (`useMemo`, `useCallback`) and lazily loading history data via RTK, the app maintains a silky smooth 60fps even with hundreds of logged sets.

---

## 🛠 Key Features

- **Custom Routine Builder:** Drag-and-drop interface (`react-native-draggable-flatlist`) allowing users to easily reorder exercises and construct personalized workout plans.
- **Interactive Progress Charts:** Visualizing strength gains and volume metrics over time using `react-native-gifted-charts`.
- **Comprehensive Nutrition Tracking:** Full meal logging modules (`LogMeal`, `AddNewMeal`, `IngredientList`) that integrate daily macro and calorie goals.
- **Workout Scheduling:** Integrated calendar view (`react-native-calendars`) to plan future workouts and review past completion history.
- **Premium Subscriptions:** Fully integrated in-app purchases (`react-native-iap`) providing seamless access to pro features and expert Coach's Corner insights.
- **Secure Authentication:** Robust multi-provider login flow leveraging Firebase Auth and Google Sign-in.

---

## 💡 Why This Project Stands Out

GymLogix isn't just a typical CRUD application—it is a deeply interactive, state-heavy mobile client that demands high performance. Building this required overcoming significant challenges in **background timer execution**, **complex state normalization (Redux Toolkit)**, and **UI thread optimization (Reanimated/Gesture Handler)**. 

By designing a bespoke Live Workout Engine capable of handling supersets, dynamic timers, and draft persistence, I successfully bridged the gap between a complex data architecture and an intuitive, premium user experience. This project demonstrates my proficiency in pushing the limits of React Native to deliver fluid, robust, and scalable mobile products.
