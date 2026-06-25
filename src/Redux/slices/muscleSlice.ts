import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

// Define muscle group types
export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs"
  | "Core"
  | "Neck"
  | "Glutes"
  | "Cardio";

// Define specific muscle types
export type SpecificMuscle =
  // Front muscles
  | "biceps"
  | "traps"
  | "foreArms"
  | "quads"
  | "twins"
  | "shoulders"
  | "chest"
  | "abs"
  | "obliques"
  // Back muscles
  | "back"
  | "triceps"
  | "hamstrings"
  | "calf"
  | "glutes"
  | "lats"
  | "rhomboids"
  | "erectorSpinae"
  // Additional muscles
  | "neck"
  | "deltoids"
  | "pectorals"
  | "serratus"
  | "hip flexors";

// Define muscle data structure
export interface MuscleData {
  id: string;
  name: string;
  displayName: string;
  group: MuscleGroup;
  side: "front" | "back" | "both";
  description?: string;
  synonyms?: string[]; // Alternative names
}

// Define muscle selection state
export interface MuscleSelection {
  front: SpecificMuscle[];
  back: SpecificMuscle[];
}

// Define the slice state
interface MuscleSlice {
  muscleDatabase: MuscleData[];
  muscleGroups: MuscleGroup[];
  selectedMuscles: MuscleSelection;
  isLoading: boolean;
}

// Comprehensive muscle database
const muscleDatabase: MuscleData[] = [
  // Front muscles
  {
    id: "biceps",
    name: "biceps",
    displayName: "Biceps",
    group: "Arms",
    side: "front",
    description: "Front arm muscles responsible for elbow flexion",
    synonyms: ["bicep", "biceps brachii"]
  },
  {
    id: "traps",
    name: "traps",
    displayName: "Trapezius",
    group: "Back",
    side: "front",
    description: "Upper back and neck muscles",
    synonyms: ["trapezius", "trap"]
  },
  {
    id: "foreArms",
    name: "foreArms",
    displayName: "Forearms",
    group: "Arms",
    side: "front",
    description: "Lower arm muscles",
    synonyms: ["forearm", "wrist flexors"]
  },
  {
    id: "quads",
    name: "quads",
    displayName: "Quadriceps",
    group: "Legs",
    side: "front",
    description: "Front thigh muscles",
    synonyms: ["quadriceps", "quad", "thigh"]
  },
  {
    id: "twins",
    name: "twins",
    displayName: "Calves",
    group: "Legs",
    side: "front",
    description: "Lower leg muscles",
    synonyms: ["calves", "calf", "gastrocnemius"]
  },
  {
    id: "shoulders",
    name: "shoulders",
    displayName: "Shoulders",
    group: "Shoulders",
    side: "front",
    description: "Shoulder muscles",
    synonyms: ["deltoids", "delts", "shoulder"]
  },
  {
    id: "chest",
    name: "chest",
    displayName: "Chest",
    group: "Chest",
    side: "front",
    description: "Chest muscles",
    synonyms: ["pectorals", "pecs", "chest"]
  },
  {
    id: "abs",
    name: "abs",
    displayName: "Abdominals",
    group: "Core",
    side: "front",
    description: "Core abdominal muscles",
    synonyms: ["abdominals", "rectus abdominis", "six pack"]
  },
  {
    id: "obliques",
    name: "obliques",
    displayName: "Obliques",
    group: "Core",
    side: "front",
    description: "Side abdominal muscles",
    synonyms: ["external obliques", "internal obliques"]
  },

  // Back muscles
  {
    id: "back",
    name: "back",
    displayName: "Back",
    group: "Back",
    side: "back",
    description: "General back muscles",
    synonyms: ["latissimus dorsi", "lats", "upper back"]
  },
  {
    id: "triceps",
    name: "triceps",
    displayName: "Triceps",
    group: "Arms",
    side: "back",
    description: "Back arm muscles responsible for elbow extension",
    synonyms: ["tricep", "triceps brachii"]
  },
  {
    id: "hamstrings",
    name: "hamstrings",
    displayName: "Hamstrings",
    group: "Legs",
    side: "back",
    description: "Back thigh muscles",
    synonyms: ["hamstring", "biceps femoris"]
  },
  {
    id: "calf",
    name: "calf",
    displayName: "Calves",
    group: "Legs",
    side: "back",
    description: "Back lower leg muscles",
    synonyms: ["calves", "gastrocnemius", "soleus"]
  },
  {
    id: "glutes",
    name: "glutes",
    displayName: "Glutes",
    group: "Glutes",
    side: "back",
    description: "Buttock muscles",
    synonyms: ["gluteus", "glute", "buttocks"]
  },
  {
    id: "lats",
    name: "lats",
    displayName: "Latissimus Dorsi",
    group: "Back",
    side: "back",
    description: "Large back muscles",
    synonyms: ["latissimus dorsi", "lat", "wings"]
  },
  {
    id: "rhomboids",
    name: "rhomboids",
    displayName: "Rhomboids",
    group: "Back",
    side: "back",
    description: "Upper back muscles between shoulder blades",
    synonyms: ["rhomboid"]
  },
  {
    id: "erectorSpinae",
    name: "erectorSpinae",
    displayName: "Erector Spinae",
    group: "Back",
    side: "back",
    description: "Lower back muscles",
    synonyms: ["lower back", "spinal erectors"]
  },

  // Additional muscles
  {
    id: "neck",
    name: "neck",
    displayName: "Neck",
    group: "Neck",
    side: "both",
    description: "Neck muscles",
    synonyms: ["cervical", "sternocleidomastoid"]
  },
  {
    id: "deltoids",
    name: "deltoids",
    displayName: "Deltoids",
    group: "Shoulders",
    side: "both",
    description: "Shoulder deltoid muscles",
    synonyms: ["delts", "anterior deltoid", "posterior deltoid"]
  }
];

// Define muscle groups
const muscleGroups: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Neck",
  "Glutes",
  "Cardio"
];

// Define the initial state
const initialState: MuscleSlice = {
  muscleDatabase,
  muscleGroups,
  selectedMuscles: {
    front: [],
    back: []
  },
  isLoading: false,
};

export const muscleSlice = createSlice({
  name: "muscle",
  initialState,
  reducers: {
    // Set selected muscles
    setSelectedMuscles: (state, action: PayloadAction<MuscleSelection>) => {
      state.selectedMuscles = action.payload;
    },

    // Add muscle to selection
    addMuscleToSelection: (
      state,
      action: PayloadAction<{ muscle: SpecificMuscle; side: "front" | "back" }>
    ) => {
      const { muscle, side } = action.payload;
      if (!state.selectedMuscles[side].includes(muscle)) {
        state.selectedMuscles[side].push(muscle);
      }
    },

    // Remove muscle from selection
    removeMuscleFromSelection: (
      state,
      action: PayloadAction<{ muscle: SpecificMuscle; side: "front" | "back" }>
    ) => {
      const { muscle, side } = action.payload;
      state.selectedMuscles[side] = state.selectedMuscles[side].filter(
        (m) => m !== muscle
      );
    },

    // Toggle muscle selection
    toggleMuscleSelection: (
      state,
      action: PayloadAction<{ muscle: SpecificMuscle; side: "front" | "back" }>
    ) => {
      const { muscle, side } = action.payload;
      const isSelected = state.selectedMuscles[side].includes(muscle);

      if (isSelected) {
        state.selectedMuscles[side] = state.selectedMuscles[side].filter(
          (m) => m !== muscle
        );
      } else {
        state.selectedMuscles[side].push(muscle);
      }
    },

    // Clear all muscle selections
    clearMuscleSelection: (state) => {
      state.selectedMuscles = {
        front: [],
        back: []
      };
    },

    // Clear muscle selection for specific side
    clearMuscleSelectionBySide: (state, action: PayloadAction<"front" | "back">) => {
      state.selectedMuscles[action.payload] = [];
    },

    // Set loading state
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Add custom muscle to database
    addCustomMuscle: (state, action: PayloadAction<MuscleData>) => {
      state.muscleDatabase.push(action.payload);
    },

    // Update muscle data
    updateMuscleData: (state, action: PayloadAction<MuscleData>) => {
      const index = state.muscleDatabase.findIndex(
        (muscle) => muscle.id === action.payload.id
      );
      if (index !== -1) {
        state.muscleDatabase[index] = action.payload;
      }
    },

    // Remove muscle from database
    removeMuscleFromDatabase: (state, action: PayloadAction<string>) => {
      state.muscleDatabase = state.muscleDatabase.filter(
        (muscle) => muscle.id !== action.payload
      );
    },
  },
});

export const {
  setSelectedMuscles,
  addMuscleToSelection,
  removeMuscleFromSelection,
  toggleMuscleSelection,
  clearMuscleSelection,
  clearMuscleSelectionBySide,
  setIsLoading,
  addCustomMuscle,
  updateMuscleData,
  removeMuscleFromDatabase,
} = muscleSlice.actions;

export default muscleSlice.reducer;

// Selectors
export const selectMuscleDatabase = (state: { muscle: MuscleSlice }) => {
  return state.muscle.muscleDatabase;
};

export const selectMuscleGroups = (state: { muscle: MuscleSlice }) => {
  return state.muscle.muscleGroups;
};

export const selectSelectedMuscles = (state: { muscle: MuscleSlice }) => {
  return state.muscle.selectedMuscles;
};

export const selectMusclesByGroup = (state: { muscle: MuscleSlice }, group: MuscleGroup) => {
  return state.muscle.muscleDatabase.filter((muscle) => muscle.group === group);
};

export const selectMusclesBySide = (state: { muscle: MuscleSlice }, side: "front" | "back") => {
  return state.muscle.muscleDatabase.filter((muscle) => muscle.side === side || muscle.side === "both");
};

export const selectFrontMuscles = (state: { muscle: MuscleSlice }) => {
  return state.muscle.muscleDatabase.filter((muscle) => muscle.side === "front" || muscle.side === "both");
};

export const selectBackMuscles = (state: { muscle: MuscleSlice }) => {
  return state.muscle.muscleDatabase.filter((muscle) => muscle.side === "back" || muscle.side === "both");
};

export const selectMuscleById = (state: { muscle: MuscleSlice }, muscleId: string) => {
  return state.muscle.muscleDatabase.find((muscle) => muscle.id === muscleId);
};

export const selectMuscleByName = (state: { muscle: MuscleSlice }, muscleName: string) => {
  return state.muscle.muscleDatabase.find(
    (muscle) =>
      muscle.name.toLowerCase() === muscleName.toLowerCase() ||
      muscle.displayName.toLowerCase() === muscleName.toLowerCase() ||
      muscle.synonyms?.some(synonym => synonym.toLowerCase() === muscleName.toLowerCase())
  );
};

export const selectSelectedMuscleNames = (state: { muscle: MuscleSlice }) => {
  const { front, back } = state.muscle.selectedMuscles;
  const allSelected = [...front, ...back];

  return allSelected.map(muscleName => {
    const muscle = state.muscle.muscleDatabase.find(m => m.name === muscleName);
    return muscle ? muscle.displayName : muscleName;
  });
};

export const selectPrimaryMuscleGroup = (state: { muscle: MuscleSlice }) => {
  const { front, back } = state.muscle.selectedMuscles;
  const allSelected = [...front, ...back];

  if (allSelected.length === 0) return null;

  // Find the most common muscle group
  const groupCounts: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;

  allSelected.forEach(muscleName => {
    const muscle = state.muscle.muscleDatabase.find(m => m.name === muscleName);
    if (muscle) {
      groupCounts[muscle.group] = (groupCounts[muscle.group] || 0) + 1;
    }
  });

  return Object.entries(groupCounts).reduce((a, b) =>
    groupCounts[a[0] as MuscleGroup] > groupCounts[b[0] as MuscleGroup] ? a : b
  )[0] as MuscleGroup;
};

export const selectIsLoading = (state: { muscle: MuscleSlice }) => {
  return state.muscle.isLoading;
};
