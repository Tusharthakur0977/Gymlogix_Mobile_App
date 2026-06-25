import {Asset} from 'react-native-image-picker';

// Interface for a set in an exercise
export type ExerciseSet = {
  reps: number;
  weight?: number; // Optional for bodyweight exercises
  distance?: number; // For cardio exercises (in meters)
  time?: number; // For timed exercises (in seconds)
  restTime: number; // Rest time after the set (in seconds)
};

// Interface for an exercise in the catalog
export type Exercise = {
  id: string;
  name: string;
  coverImage: Asset | null;
  images: Asset[];
  instruction: string;
  description: string;
  mainMuscle: string;
  secondaryMuscle: string[];
  difficulty: number;
  location: 'gym' | 'home' | 'outdoor';
  type: 'isolation' | 'compound' | 'other';
  force: 'pull' | 'push';
  equipment: string;
  targetMuscles: string[];
  defaultSets?: ExerciseSet[]; // Default sets for this exercise (optional)
  recommendedSets?: number; // Recommended number of sets (optional)
  recommendedReps?: number; // Recommended number of reps per set (optional)
  exerciseSettings?: ExerciseSettings | null; // Optional settings for the exercise
};

export type LogType = 'Time' | 'Weight' | 'Distance';

export type ExerciseSettings = {
  sets?: number;
  reps?: number;
  loggingType?: LogType[];
  timing?: {
    warmUp: string; //Warm up reset time
    workingSet: string; //Working set reset time
    finishExercise: string; //Finish exercise rest time
  };
  alternateExercise?: string; // Optional alternate exercise
};

// Interface for a body part category
export interface BodyPartCategory {
  bodyPart: string;
  exercises: Exercise[];
}

// Interface for the entire exercise catalog
export interface ExerciseCatalog {
  categories: BodyPartCategory[];
}

const exerciseCatalog: ExerciseCatalog = {
  categories: [
    {
      bodyPart: 'Neck',
      exercises: [
        {
          id: 'exercise-1',
          name: 'Smith Machine Shrug',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'smith_machine_shrug.jpg',
          },
          images: [],
          instruction:
            'Shrug your shoulders using a Smith machine to target the upper traps and neck muscles.',
          description:
            'Shrug your shoulders using a Smith machine to target the upper traps and neck muscles.',
          mainMuscle: 'biceps',
          secondaryMuscle: ['Neck'],
          difficulty: 1,
          location: 'gym',
          type: 'compound',
          force: 'pull',
          equipment: 'Barbell',
          targetMuscles: ['Trapezius', 'Neck'],
          defaultSets: [
            {reps: 12, weight: 45, restTime: 60},
            {reps: 10, weight: 55, restTime: 60},
            {reps: 8, weight: 65, restTime: 90},
          ],
          recommendedSets: 3,
          recommendedReps: 10,
        },
        {
          id: 'exercise-2',
          name: 'Dumbbell Shrug',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'dumbbell_shrug.jpg',
          },
          images: [],
          instruction:
            'Hold dumbbells at your sides and shrug your shoulders to build trap and neck strength.',
          description:
            'Hold dumbbells at your sides and shrug your shoulders to build trap and neck strength.',
          mainMuscle: 'Trapezius',
          secondaryMuscle: ['Neck'],
          difficulty: 2,
          location: 'gym',
          type: 'isolation',
          force: 'pull',
          equipment: 'Dumbbell',
          targetMuscles: ['Trapezius', 'Neck'],
          defaultSets: [
            {reps: 15, weight: 20, restTime: 60},
            {reps: 12, weight: 25, restTime: 60},
            {reps: 10, weight: 30, restTime: 90},
          ],
          recommendedSets: 3,
          recommendedReps: 12,
        },
        {
          id: 'exercise-3',
          name: 'Neck Harness Raise',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'neck_harness_raise.jpg',
          },
          images: [],
          instruction:
            'Use a neck harness to add resistance while flexing and extending your neck.',
          description:
            'Use a neck harness to add resistance while flexing and extending your neck.',
          mainMuscle: 'Neck',
          secondaryMuscle: [],
          difficulty: 3,
          location: 'gym',
          type: 'isolation',
          force: 'pull',
          equipment: 'Neck Harness',
          targetMuscles: ['Neck'],
          defaultSets: [
            {reps: 15, weight: 5, restTime: 60},
            {reps: 12, weight: 7.5, restTime: 60},
            {reps: 10, weight: 10, restTime: 90},
          ],
          recommendedSets: 3,
          recommendedReps: 12,
        },
      ],
    },
    {
      bodyPart: 'Chest',
      exercises: [
        {
          id: 'exercise-4',
          name: 'Bench Press',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'bench_press.jpg',
          },
          images: [],
          instruction:
            'Lie on a bench and press a barbell to target your chest, triceps, and shoulders.',
          description:
            'Lie on a bench and press a barbell to target your chest, triceps, and shoulders.',
          mainMuscle: 'Chest',
          secondaryMuscle: ['Triceps'],
          difficulty: 2,
          location: 'gym',
          type: 'compound',
          force: 'push',
          equipment: 'Barbell',
          targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
          defaultSets: [
            {reps: 12, weight: 135, restTime: 90},
            {reps: 10, weight: 155, restTime: 90},
            {reps: 8, weight: 175, restTime: 120},
            {reps: 6, weight: 185, restTime: 120},
          ],
          recommendedSets: 4,
          recommendedReps: 8,
        },
        {
          id: 'exercise-5',
          name: 'Incline Dumbbell Press',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'incline_dumbbell_press.jpg',
          },
          images: [],
          instruction:
            'Press dumbbells on an incline bench to focus on the upper chest.',
          description:
            'Press dumbbells on an incline bench to focus on the upper chest.',
          mainMuscle: 'Chest',
          secondaryMuscle: ['Shoulders'],
          difficulty: 2,
          location: 'gym',
          type: 'compound',
          force: 'push',
          equipment: 'Dumbbell',
          targetMuscles: ['Chest', 'Shoulders'],
          defaultSets: [
            {reps: 12, weight: 30, restTime: 90},
            {reps: 10, weight: 35, restTime: 90},
            {reps: 8, weight: 40, restTime: 120},
          ],
          recommendedSets: 3,
          recommendedReps: 10,
        },
        {
          id: 'exercise-6',
          name: 'Push-Ups',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'push_ups.jpg',
          },
          images: [],
          instruction:
            'Perform push-ups to build chest strength using your body weight.',
          description:
            'Perform push-ups to build chest strength using your body weight.',
          mainMuscle: 'Chest',
          secondaryMuscle: ['Triceps'],
          difficulty: 1,
          location: 'home',
          type: 'compound',
          force: 'push',
          equipment: 'Bodyweight',
          targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
          defaultSets: [
            {reps: 15, restTime: 60},
            {reps: 12, restTime: 60},
            {reps: 10, restTime: 60},
            {reps: 8, restTime: 60},
          ],
          recommendedSets: 4,
          recommendedReps: 12,
        },
      ],
    },
    {
      bodyPart: 'Back',
      exercises: [
        {
          id: 'exercise-7',
          name: 'Pull-Ups',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1534369239879-2b4b1e91b4b8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'pull_ups.jpg',
          },
          images: [],
          instruction:
            'Pull your body up on a bar to target your lats and biceps.',
          description:
            'Pull your body up on a bar to target your lats and biceps.',
          mainMuscle: 'Back',
          secondaryMuscle: ['Biceps'],
          difficulty: 2,
          location: 'gym',
          type: 'compound',
          force: 'pull',
          equipment: 'Bodyweight',
          targetMuscles: ['Back', 'Biceps'],
          defaultSets: [
            {reps: 10, restTime: 90},
            {reps: 8, restTime: 90},
            {reps: 6, restTime: 90},
            {reps: 4, restTime: 90},
          ],
          recommendedSets: 4,
          recommendedReps: 8,
        },
        {
          id: 'exercise-8',
          name: 'Barbell Row',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1534369239879-2b4b1e91b4b8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'barbell_row.jpg',
          },
          images: [],
          instruction:
            'Row a barbell to your torso to build back thickness and strength.',
          description:
            'Row a barbell to your torso to build back thickness and strength.',
          mainMuscle: 'Back',
          secondaryMuscle: ['Biceps'],
          difficulty: 2,
          location: 'gym',
          type: 'compound',
          force: 'pull',
          equipment: 'Barbell',
          targetMuscles: ['Back', 'Biceps'],
          defaultSets: [
            {reps: 12, weight: 95, restTime: 90},
            {reps: 10, weight: 115, restTime: 90},
            {reps: 8, weight: 135, restTime: 120},
          ],
          recommendedSets: 3,
          recommendedReps: 10,
        },
        {
          id: 'exercise-9',
          name: 'Conventional Deadlift',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1534369239879-2b4b1e91b4b8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'conventional_deadlift.jpg',
          },
          images: [],
          instruction:
            'Lift a barbell from the ground to target your entire posterior chain.',
          description:
            'Lift a barbell from the ground to target your entire posterior chain.',
          mainMuscle: 'Back',
          secondaryMuscle: ['Hamstrings'],
          difficulty: 3,
          location: 'gym',
          type: 'compound',
          force: 'pull',
          equipment: 'Barbell',
          targetMuscles: ['Back', 'Hamstrings', 'Glutes'],
          defaultSets: [
            {reps: 8, weight: 185, restTime: 120},
            {reps: 6, weight: 225, restTime: 120},
            {reps: 4, weight: 275, restTime: 180},
            {reps: 2, weight: 315, restTime: 180},
          ],
          recommendedSets: 4,
          recommendedReps: 5,
        },
      ],
    },
    {
      bodyPart: 'Shoulders',
      exercises: [
        {
          id: 'exercise-10',
          name: 'Overhead Shoulder Press',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'overhead_shoulder_press.jpg',
          },
          images: [],
          instruction:
            'Press a barbell overhead to build strong shoulders and triceps.',
          description:
            'Press a barbell overhead to build strong shoulders and triceps.',
          mainMuscle: 'Shoulders',
          secondaryMuscle: ['Triceps'],
          difficulty: 2,
          location: 'gym',
          type: 'compound',
          force: 'push',
          equipment: 'Barbell',
          targetMuscles: ['Shoulders', 'Triceps'],
        },
        {
          id: 'exercise-11',
          name: 'Dumbbell Shoulder Press',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'dumbbell_shoulder_press.jpg',
          },
          images: [],
          instruction:
            'Press dumbbells overhead for balanced shoulder development.',
          description:
            'Press dumbbells overhead for balanced shoulder development.',
          mainMuscle: 'Shoulders',
          secondaryMuscle: ['Triceps'],
          difficulty: 2,
          location: 'gym',
          type: 'compound',
          force: 'push',
          equipment: 'Dumbbell',
          targetMuscles: ['Shoulders', 'Triceps'],
        },
        {
          id: 'exercise-12',
          name: 'Lateral Raise',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'lateral_raise.jpg',
          },
          images: [],
          instruction:
            'Raise dumbbells to your sides to target the lateral deltoids.',
          description:
            'Raise dumbbells to your sides to target the lateral deltoids.',
          mainMuscle: 'Shoulders',
          secondaryMuscle: [],
          difficulty: 1,
          location: 'gym',
          type: 'isolation',
          force: 'push',
          equipment: 'Dumbbell',
          targetMuscles: ['Shoulders'],
        },
      ],
    },
    {
      bodyPart: 'Arms',
      exercises: [
        {
          id: 'exercise-13',
          name: 'Tricep Dips',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'tricep_dips.jpg',
          },
          images: [],
          instruction:
            'Perform dips on parallel bars to target your triceps and chest.',
          description:
            'Perform dips on parallel bars to target your triceps and chest.',
          mainMuscle: 'Triceps',
          secondaryMuscle: ['Chest'],
          difficulty: 2,
          location: 'gym',
          type: 'compound',
          force: 'push',
          equipment: 'Bodyweight',
          targetMuscles: ['Triceps', 'Chest'],
        },
        {
          id: 'exercise-14',
          name: 'Close-Grip Bench Press',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'close_grip_bench_press.jpg',
          },
          images: [],
          instruction:
            'Press a barbell with a close grip to emphasize triceps.',
          description:
            'Press a barbell with a close grip to emphasize triceps.',
          mainMuscle: 'Triceps',
          secondaryMuscle: ['Chest'],
          difficulty: 3,
          location: 'gym',
          type: 'compound',
          force: 'push',
          equipment: 'Barbell',
          targetMuscles: ['Triceps', 'Chest'],
        },
        {
          id: 'exercise-15',
          name: 'Bicep Curl',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'bicep_curl.jpg',
          },
          images: [],
          instruction:
            'Curl dumbbells to target your biceps and improve arm size.',
          description:
            'Curl dumbbells to target your biceps and improve arm size.',
          mainMuscle: 'Biceps',
          secondaryMuscle: [],
          difficulty: 1,
          location: 'gym',
          type: 'isolation',
          force: 'pull',
          equipment: 'Dumbbell',
          targetMuscles: ['Biceps'],
        },
      ],
    },
    {
      bodyPart: 'Legs',
      exercises: [
        {
          id: 'exercise-16',
          name: 'Squats',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'squats.jpg',
          },
          images: [],
          instruction:
            'Squat with a barbell to build strength in your quads, glutes, and hamstrings.',
          description:
            'Squat with a barbell to build strength in your quads, glutes, and hamstrings.',
          mainMuscle: 'Quads',
          secondaryMuscle: ['Glutes'],
          difficulty: 2,
          location: 'gym',
          type: 'compound',
          force: 'push',
          equipment: 'Barbell',
          targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
        },
        {
          id: 'exercise-17',
          name: 'Lunges',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'lunges.jpg',
          },
          images: [],
          instruction:
            'Step forward into lunges to target your quads and glutes.',
          description:
            'Step forward into lunges to target your quads and glutes.',
          mainMuscle: 'Quads',
          secondaryMuscle: ['Glutes'],
          difficulty: 1,
          location: 'home',
          type: 'compound',
          force: 'push',
          equipment: 'Bodyweight',
          targetMuscles: ['Quads', 'Glutes'],
        },
        {
          id: 'exercise-18',
          name: 'Romanian Deadlift',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'romanian_deadlift.jpg',
          },
          images: [],
          instruction:
            'Hinge at the hips with a barbell to target your hamstrings and glutes.',
          description:
            'Hinge at the hips with a barbell to target your hamstrings and glutes.',
          mainMuscle: 'Hamstrings',
          secondaryMuscle: ['Glutes'],
          difficulty: 3,
          location: 'gym',
          type: 'compound',
          force: 'pull',
          equipment: 'Barbell',
          targetMuscles: ['Hamstrings', 'Glutes'],
        },
      ],
    },
    {
      bodyPart: 'Core',
      exercises: [
        {
          id: 'exercise-19',
          name: 'Plank',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'plank.jpg',
          },
          images: [],
          instruction: 'Hold a plank position to strengthen your core and abs.',
          description: 'Hold a plank position to strengthen your core and abs.',
          mainMuscle: 'Abs',
          secondaryMuscle: ['Core'],
          difficulty: 1,
          location: 'home',
          type: 'isolation',
          force: 'push',
          equipment: 'Bodyweight',
          targetMuscles: ['Abs', 'Core'],
          defaultSets: [
            {reps: 1, time: 30, restTime: 30},
            {reps: 1, time: 45, restTime: 30},
            {reps: 1, time: 60, restTime: 30},
            {reps: 1, time: 90, restTime: 30},
          ],
          recommendedSets: 4,
          recommendedReps: 1,
        },
        {
          id: 'exercise-20',
          name: 'Russian Twists',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'russian_twists.jpg',
          },
          images: [],
          instruction:
            'Twist side to side with a weight to target your obliques.',
          description:
            'Twist side to side with a weight to target your obliques.',
          mainMuscle: 'Obliques',
          secondaryMuscle: ['Abs'],
          difficulty: 2,
          location: 'home',
          type: 'isolation',
          force: 'push',
          equipment: 'Bodyweight',
          targetMuscles: ['Obliques', 'Abs'],
        },
        {
          id: 'exercise-21',
          name: 'Bicycle Crunches',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'bicycle_crunches.jpg',
          },
          images: [],
          instruction:
            'Alternate elbow-to-knee crunches to work your abs and obliques.',
          description:
            'Alternate elbow-to-knee crunches to work your abs and obliques.',
          mainMuscle: 'Abs',
          secondaryMuscle: ['Obliques'],
          difficulty: 1,
          location: 'home',
          type: 'isolation',
          force: 'push',
          equipment: 'Bodyweight',
          targetMuscles: ['Abs', 'Obliques'],
        },
      ],
    },
    {
      bodyPart: 'Triceps',
      exercises: [
        {
          id: 'exercise-22',
          name: 'Tricep Extensions',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'tricep_extensions.jpg',
          },
          images: [],
          instruction: 'Extend a dumbbell overhead to target your triceps.',
          description: 'Extend a dumbbell overhead to target your triceps.',
          mainMuscle: 'Triceps',
          secondaryMuscle: [],
          difficulty: 2,
          location: 'gym',
          type: 'isolation',
          force: 'push',
          equipment: 'Dumbbell',
          targetMuscles: ['Triceps'],
          defaultSets: [
            {reps: 12, weight: 30, restTime: 90},
            {reps: 10, weight: 35, restTime: 90},
            {reps: 8, weight: 40, restTime: 120},
          ],
          recommendedSets: 3,
          recommendedReps: 12,
        },
        {
          id: 'exercise-23',
          name: 'Skull Crushers',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'skull_crushers.jpg',
          },
          images: [],
          instruction:
            'Lower a barbell behind your head to target your triceps.',
          description:
            'Lower a barbell behind your head to target your triceps.',
          mainMuscle: 'Triceps',
          secondaryMuscle: [],
          difficulty: 3,
          location: 'gym',
          type: 'compound',
          force: 'push',
          equipment: 'Barbell',
          targetMuscles: ['Triceps'],
          defaultSets: [
            {reps: 12, weight: 30, restTime: 90},
            {reps: 10, weight: 35, restTime: 90},
            {reps: 8, weight: 40, restTime: 120},
          ],
          recommendedSets: 3,
          recommendedReps: 12,
        },
      ],
    },
    {
      bodyPart: 'Biceps',
      exercises: [
        {
          id: 'exercise-24',
          name: 'Bicep Curls',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'bicep_curls.jpg',
          },
          images: [],
          instruction:
            'Curl dumbbells to target your biceps and improve arm size.',
          description:
            'Curl dumbbells to target your biceps and improve arm size.',
          mainMuscle: 'Biceps',
          secondaryMuscle: [],
          difficulty: 1,
          location: 'gym',
          type: 'isolation',
          force: 'pull',
          equipment: 'Dumbbell',
          targetMuscles: ['Biceps'],
          defaultSets: [
            {reps: 12, weight: 30, restTime: 90},
            {reps: 10, weight: 35, restTime: 90},
            {reps: 8, weight: 40, restTime: 120},
          ],
          recommendedSets: 3,
          recommendedReps: 12,
        },
        {
          id: 'exercise-25',
          name: 'Hammer Curls',
          coverImage: {
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            type: 'image/jpeg',
            fileName: 'hammer_curls.jpg',
          },
          images: [],
          instruction:
            'Curl dumbbells with a neutral grip to target your biceps.',
          description:
            'Curl dumbbells with a neutral grip to target your biceps.',
          mainMuscle: 'Biceps',
          secondaryMuscle: [],
          difficulty: 1,
          location: 'gym',
          type: 'isolation',
          force: 'pull',
          equipment: 'Dumbbell',
          targetMuscles: ['Biceps'],
          defaultSets: [
            {reps: 12, weight: 30, restTime: 90},
            {reps: 10, weight: 35, restTime: 90},
            {reps: 8, weight: 40, restTime: 120},
          ],
          recommendedSets: 3,
          recommendedReps: 12,
        },
      ],
    },
  ],
};

export default exerciseCatalog;
