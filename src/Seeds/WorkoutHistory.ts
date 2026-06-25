import { WorkoutHistory, HistoryExercise, HistoryExerciseSet, PersonalRecord } from "../Redux/slices/historySlice";
import exerciseCatalog from "./ExerciseCatalog";

// Helper function to get exercise by ID from catalog
const getExerciseById = (id: string) => {
  for (const category of exerciseCatalog.categories) {
    const exercise = category.exercises.find(ex => ex.id === id);
    if (exercise) return exercise;
  }
  throw new Error(`Exercise with ID ${id} not found in catalog`);
};

// Helper function to create a set
const createSet = (
  setNumber: number,
  reps: number,
  weight?: number,
  distance?: number,
  time?: number,
  difficulty?: "easy" | "medium" | "hard" | "failure",
  notes?: string
): HistoryExerciseSet => ({
  id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  setNumber,
  reps,
  weight,
  distance,
  time,
  restTime: 60, // Default rest time
  difficulty,
  notes,
});

// Helper function to create a history exercise
const createHistoryExercise = (
  exerciseId: string,
  sets: HistoryExerciseSet[],
  notes?: string
): HistoryExercise => ({
  id: `exercise-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  exercise: getExerciseById(exerciseId),
  sets,
  notes,
});

// Sample workout history data
const workoutHistoryData: WorkoutHistory[] = [
  // Recent Workout - Push Day
  {
    id: "workout-1",
    date: "2024-01-15",
    startTime: "2024-01-15T09:00:00Z",
    endTime: "2024-01-15T10:30:00Z",
    duration: 90,
    workoutName: "Push Day - Chest & Shoulders",
    trainingPlanId: "plan-1",
    dayId: "Day 1",
    exercises: [
      createHistoryExercise("exercise-4", [ // Bench Press
        createSet(1, 12, 135, undefined, undefined, "medium"),
        createSet(2, 10, 155, undefined, undefined, "medium"),
        createSet(3, 8, 175, undefined, undefined, "hard"),
        createSet(4, 6, 185, undefined, undefined, "hard", "New PR!"),
      ], "Felt strong today, hit a new PR on the last set"),
      
      createHistoryExercise("exercise-5", [ // Incline Dumbbell Press
        createSet(1, 12, 30, undefined, undefined, "medium"),
        createSet(2, 10, 35, undefined, undefined, "medium"),
        createSet(3, 8, 40, undefined, undefined, "hard"),
      ]),
      
      createHistoryExercise("exercise-10", [ // Overhead Shoulder Press
        createSet(1, 10, 95, undefined, undefined, "medium"),
        createSet(2, 8, 105, undefined, undefined, "hard"),
        createSet(3, 6, 115, undefined, undefined, "hard"),
      ]),
      
      createHistoryExercise("exercise-12", [ // Lateral Raise
        createSet(1, 15, 15, undefined, undefined, "easy"),
        createSet(2, 12, 20, undefined, undefined, "medium"),
        createSet(3, 10, 25, undefined, undefined, "hard"),
      ]),
    ],
    totalVolume: 8420,
    totalSets: 14,
    totalReps: 142,
    averageRestTime: 90,
    notes: "Great workout! Hit a new bench press PR.",
    mood: "excellent",
    energy: "high",
    location: "gym",
    tags: ["push", "chest", "shoulders", "pr"],
  },

  // Pull Day
  {
    id: "workout-2",
    date: "2024-01-13",
    startTime: "2024-01-13T10:00:00Z",
    endTime: "2024-01-13T11:15:00Z",
    duration: 75,
    workoutName: "Pull Day - Back & Biceps",
    trainingPlanId: "plan-1",
    dayId: "Day 2",
    exercises: [
      createHistoryExercise("exercise-7", [ // Pull-Ups
        createSet(1, 10, undefined, undefined, undefined, "medium"),
        createSet(2, 8, undefined, undefined, undefined, "medium"),
        createSet(3, 6, undefined, undefined, undefined, "hard"),
        createSet(4, 4, undefined, undefined, undefined, "failure"),
      ], "Bodyweight pull-ups, going for max reps"),
      
      createHistoryExercise("exercise-8", [ // Barbell Row
        createSet(1, 12, 95, undefined, undefined, "medium"),
        createSet(2, 10, 115, undefined, undefined, "medium"),
        createSet(3, 8, 135, undefined, undefined, "hard"),
      ]),
      
      createHistoryExercise("exercise-9", [ // Conventional Deadlift
        createSet(1, 8, 185, undefined, undefined, "medium"),
        createSet(2, 6, 225, undefined, undefined, "hard"),
        createSet(3, 4, 275, undefined, undefined, "hard"),
        createSet(4, 2, 315, undefined, undefined, "failure", "Almost got 3 reps!"),
      ]),
      
      createHistoryExercise("exercise-24", [ // Bicep Curls
        createSet(1, 15, 25, undefined, undefined, "easy"),
        createSet(2, 12, 30, undefined, undefined, "medium"),
        createSet(3, 10, 35, undefined, undefined, "hard"),
      ]),
    ],
    totalVolume: 6890,
    totalSets: 14,
    totalReps: 130,
    averageRestTime: 120,
    notes: "Deadlifts felt heavy but good form throughout.",
    mood: "good",
    energy: "medium",
    location: "gym",
    tags: ["pull", "back", "biceps", "deadlift"],
  },

  // Leg Day
  {
    id: "workout-3",
    date: "2024-01-11",
    startTime: "2024-01-11T08:30:00Z",
    endTime: "2024-01-11T10:00:00Z",
    duration: 90,
    workoutName: "Leg Day - Quads & Glutes",
    trainingPlanId: "plan-1",
    dayId: "Day 3",
    exercises: [
      createHistoryExercise("exercise-16", [ // Squats
        createSet(1, 12, 135, undefined, undefined, "medium"),
        createSet(2, 10, 155, undefined, undefined, "medium"),
        createSet(3, 8, 185, undefined, undefined, "hard"),
        createSet(4, 6, 205, undefined, undefined, "hard"),
      ], "Deep squats, focused on form"),
      
      createHistoryExercise("exercise-9", [ // Conventional Deadlift (Romanian style)
        createSet(1, 12, 95, undefined, undefined, "medium"),
        createSet(2, 10, 115, undefined, undefined, "medium"),
        createSet(3, 8, 135, undefined, undefined, "hard"),
      ], "Romanian deadlift variation"),

      createHistoryExercise("exercise-16", [ // More Squats (different variation)
        createSet(1, 15, 95, undefined, undefined, "medium"),
        createSet(2, 12, 115, undefined, undefined, "medium"),
        createSet(3, 10, 135, undefined, undefined, "hard"),
      ], "High rep squats for volume"),
    ],
    totalVolume: 7240,
    totalSets: 10,
    totalReps: 108,
    averageRestTime: 120,
    notes: "Legs are getting stronger! Squats felt smooth.",
    mood: "good",
    energy: "medium",
    location: "gym",
    tags: ["legs", "squats", "quads", "glutes"],
  },

  // Home Workout
  {
    id: "workout-4",
    date: "2024-01-09",
    startTime: "2024-01-09T07:00:00Z",
    endTime: "2024-01-09T07:45:00Z",
    duration: 45,
    workoutName: "Morning Home Workout",
    exercises: [
      createHistoryExercise("exercise-6", [ // Push-Ups
        createSet(1, 15, undefined, undefined, undefined, "medium"),
        createSet(2, 12, undefined, undefined, undefined, "medium"),
        createSet(3, 10, undefined, undefined, undefined, "hard"),
        createSet(4, 8, undefined, undefined, undefined, "hard"),
      ], "Bodyweight push-ups, good morning pump"),
      
      createHistoryExercise("exercise-19", [ // Plank
        createSet(1, 1, undefined, undefined, 30, "medium"),
        createSet(2, 1, undefined, undefined, 45, "medium"),
        createSet(3, 1, undefined, undefined, 60, "hard"),
        createSet(4, 1, undefined, undefined, 90, "failure", "Held as long as possible"),
      ], "Core work to finish the session"),
    ],
    totalVolume: 0, // Bodyweight exercises
    totalSets: 8,
    totalReps: 49,
    averageRestTime: 45,
    notes: "Quick morning session before work. Felt energized!",
    mood: "good",
    energy: "high",
    location: "home",
    tags: ["morning", "bodyweight", "quick"],
  },

  // Upper Body Focus
  {
    id: "workout-5",
    date: "2024-01-07",
    startTime: "2024-01-07T18:00:00Z",
    endTime: "2024-01-07T19:30:00Z",
    duration: 90,
    workoutName: "Upper Body Strength",
    exercises: [
      createHistoryExercise("exercise-4", [ // Bench Press
        createSet(1, 10, 155, undefined, undefined, "medium"),
        createSet(2, 8, 175, undefined, undefined, "hard"),
        createSet(3, 6, 185, undefined, undefined, "hard"),
      ]),
      
      createHistoryExercise("exercise-8", [ // Barbell Row
        createSet(1, 10, 115, undefined, undefined, "medium"),
        createSet(2, 8, 135, undefined, undefined, "hard"),
        createSet(3, 6, 145, undefined, undefined, "hard"),
      ]),
      
      createHistoryExercise("exercise-13", [ // Tricep Dips
        createSet(1, 12, undefined, undefined, undefined, "medium"),
        createSet(2, 10, undefined, undefined, undefined, "medium"),
        createSet(3, 8, undefined, undefined, undefined, "hard"),
      ]),
      
      createHistoryExercise("exercise-24", [ // Bicep Curls
        createSet(1, 12, 30, undefined, undefined, "medium"),
        createSet(2, 10, 35, undefined, undefined, "hard"),
        createSet(3, 8, 40, undefined, undefined, "hard"),
      ]),
    ],
    totalVolume: 5890,
    totalSets: 12,
    totalReps: 107,
    averageRestTime: 90,
    notes: "Focused on upper body strength. Good session overall.",
    mood: "good",
    energy: "medium",
    location: "gym",
    tags: ["upper", "strength", "bench", "rows"],
  },
];

// Sample personal records
const personalRecordsData: PersonalRecord[] = [
  {
    id: "pr-1",
    exerciseId: "exercise-4",
    exerciseName: "Bench Press",
    type: "weight",
    value: 185,
    date: "2024-01-15",
    workoutId: "workout-1",
    previousRecord: 175,
  },
  {
    id: "pr-2",
    exerciseId: "exercise-9",
    exerciseName: "Conventional Deadlift",
    type: "weight",
    value: 315,
    date: "2024-01-13",
    workoutId: "workout-2",
    previousRecord: 295,
  },
  {
    id: "pr-3",
    exerciseId: "exercise-16",
    exerciseName: "Squats",
    type: "weight",
    value: 205,
    date: "2024-01-11",
    workoutId: "workout-3",
    previousRecord: 185,
  },
  {
    id: "pr-4",
    exerciseId: "exercise-7",
    exerciseName: "Pull-Ups",
    type: "reps",
    value: 10,
    date: "2024-01-13",
    workoutId: "workout-2",
    previousRecord: 8,
  },
  {
    id: "pr-6",
    exerciseId: "exercise-24",
    exerciseName: "Bicep Curls",
    type: "weight",
    value: 40,
    date: "2024-01-07",
    workoutId: "workout-5",
    previousRecord: 35,
  },
  {
    id: "pr-5",
    exerciseId: "exercise-19",
    exerciseName: "Plank",
    type: "time",
    value: 90,
    date: "2024-01-09",
    workoutId: "workout-4",
    previousRecord: 75,
  },
];

export { workoutHistoryData, personalRecordsData };
export default workoutHistoryData;
