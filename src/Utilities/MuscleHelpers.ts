import { MuscleGroup, SpecificMuscle, MuscleSelection } from "../Redux/slices/muscleSlice";

/**
 * Utility functions for muscle data management
 */

// Mapping from exercise catalog muscle names to our standardized muscle names
export const MUSCLE_NAME_MAPPING: Record<string, SpecificMuscle> = {
  // Common mappings
  "Chest": "chest",
  "Back": "back", 
  "Shoulders": "shoulders",
  "Biceps": "biceps",
  "Triceps": "triceps",
  "Quads": "quads",
  "Quadriceps": "quads",
  "Hamstrings": "hamstrings",
  "Calves": "twins",
  "Glutes": "glutes",
  "Trapezius": "traps",
  "Forearms": "foreArms",
  "Neck": "neck",
  "Abs": "abs",
  "Abdominals": "abs",
  "Obliques": "obliques",
  "Lats": "lats",
  "Latissimus Dorsi": "lats",
  "Rhomboids": "rhomboids",
  "Erector Spinae": "erectorSpinae",
  "Lower Back": "erectorSpinae",
  "Deltoids": "deltoids",
  "Pectorals": "chest",
  "Gastrocnemius": "twins",
  "Soleus": "calf",
  "Calf": "calf",
};

// Reverse mapping for display purposes
export const DISPLAY_NAME_MAPPING: Record<SpecificMuscle, string> = {
  biceps: "Biceps",
  traps: "Trapezius", 
  foreArms: "Forearms",
  quads: "Quadriceps",
  twins: "Calves",
  shoulders: "Shoulders",
  chest: "Chest",
  abs: "Abdominals",
  obliques: "Obliques",
  back: "Back",
  triceps: "Triceps",
  hamstrings: "Hamstrings",
  calf: "Calves",
  glutes: "Glutes",
  lats: "Latissimus Dorsi",
  rhomboids: "Rhomboids",
  erectorSpinae: "Erector Spinae",
  neck: "Neck",
  deltoids: "Deltoids",
  pectorals: "Pectorals",
  serratus: "Serratus",
  "hip flexors": "Hip Flexors",
};

// Muscle group mappings
export const MUSCLE_TO_GROUP_MAPPING: Record<SpecificMuscle, MuscleGroup> = {
  biceps: "Arms",
  triceps: "Arms",
  foreArms: "Arms",
  chest: "Chest",
  pectorals: "Chest",
  back: "Back",
  lats: "Back",
  rhomboids: "Back",
  erectorSpinae: "Back",
  traps: "Back",
  shoulders: "Shoulders",
  deltoids: "Shoulders",
  quads: "Legs",
  hamstrings: "Legs",
  twins: "Legs",
  calf: "Legs",
  glutes: "Glutes",
  abs: "Core",
  obliques: "Core",
  neck: "Neck",
  serratus: "Core",
  "hip flexors": "Core",
};

/**
 * Convert a muscle name from exercise catalog to standardized muscle name
 */
export const standardizeMuscle = (muscleName: string): SpecificMuscle | null => {
  const standardized = MUSCLE_NAME_MAPPING[muscleName];
  if (standardized) return standardized;
  
  // Try case-insensitive match
  const lowerName = muscleName.toLowerCase();
  for (const [key, value] of Object.entries(MUSCLE_NAME_MAPPING)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  return null;
};

/**
 * Get display name for a muscle
 */
export const getMuscleDisplayName = (muscle: SpecificMuscle): string => {
  return DISPLAY_NAME_MAPPING[muscle] || muscle;
};

/**
 * Get muscle group for a specific muscle
 */
export const getMuscleGroup = (muscle: SpecificMuscle): MuscleGroup => {
  return MUSCLE_TO_GROUP_MAPPING[muscle] || "Core";
};

/**
 * Convert array of muscle names to MuscleSelection format
 */
export const convertToMuscleSelection = (
  muscles: string[], 
  defaultSide: "front" | "back" = "front"
): MuscleSelection => {
  const selection: MuscleSelection = { front: [], back: [] };
  
  muscles.forEach(muscleName => {
    const standardized = standardizeMuscle(muscleName);
    if (standardized) {
      // Determine which side this muscle belongs to
      const side = getFrontBackSide(standardized) || defaultSide;
      if (!selection[side].includes(standardized)) {
        selection[side].push(standardized);
      }
    }
  });
  
  return selection;
};

/**
 * Determine if a muscle is typically on front or back
 */
export const getFrontBackSide = (muscle: SpecificMuscle): "front" | "back" | null => {
  const frontMuscles: SpecificMuscle[] = [
    "biceps", "chest", "abs", "obliques", "quads", "twins", "shoulders", "foreArms", "pectorals"
  ];
  
  const backMuscles: SpecificMuscle[] = [
    "triceps", "back", "lats", "rhomboids", "erectorSpinae", "hamstrings", "calf", "glutes", "traps"
  ];
  
  if (frontMuscles.includes(muscle)) return "front";
  if (backMuscles.includes(muscle)) return "back";
  return null; // For muscles that can be both (like deltoids, neck)
};

/**
 * Convert MuscleSelection back to array of muscle names
 */
export const muscleSelectionToArray = (selection: MuscleSelection): string[] => {
  return [...selection.front, ...selection.back];
};

/**
 * Get primary muscle from selection (first selected muscle)
 */
export const getPrimaryMuscle = (selection: MuscleSelection): SpecificMuscle | null => {
  if (selection.front.length > 0) return selection.front[0];
  if (selection.back.length > 0) return selection.back[0];
  return null;
};

/**
 * Get secondary muscle from selection (second selected muscle)
 */
export const getSecondaryMuscle = (selection: MuscleSelection): SpecificMuscle | null => {
  const allMuscles = [...selection.front, ...selection.back];
  return allMuscles.length > 1 ? allMuscles[1] : null;
};

/**
 * Check if a muscle is selected in the selection
 */
export const isMuscleSelected = (muscle: SpecificMuscle, selection: MuscleSelection): boolean => {
  return selection.front.includes(muscle) || selection.back.includes(muscle);
};

/**
 * Get all unique muscle groups from a selection
 */
export const getMuscleGroupsFromSelection = (selection: MuscleSelection): MuscleGroup[] => {
  const allMuscles = [...selection.front, ...selection.back];
  const groups = allMuscles.map(muscle => getMuscleGroup(muscle));
  return [...new Set(groups)]; // Remove duplicates
};

/**
 * Validate muscle selection (ensure at least one muscle is selected)
 */
export const isValidMuscleSelection = (selection: MuscleSelection): boolean => {
  return selection.front.length > 0 || selection.back.length > 0;
};

/**
 * Clear muscle selection
 */
export const clearMuscleSelection = (): MuscleSelection => ({
  front: [],
  back: []
});

/**
 * Merge two muscle selections
 */
export const mergeMuscleSelections = (
  selection1: MuscleSelection, 
  selection2: MuscleSelection
): MuscleSelection => ({
  front: [...new Set([...selection1.front, ...selection2.front])],
  back: [...new Set([...selection1.back, ...selection2.back])]
});
