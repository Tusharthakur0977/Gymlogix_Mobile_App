import {createSlice, PayloadAction} from '@reduxjs/toolkit'; // adjust the import path to your actual file
import {ActivePlanListItem} from '../../Seeds/Plans';

interface PlanState {
  planData: ActivePlanListItem[] | null;
}

const initialState: PlanState = {
  planData: null,
};

type DeleteExercisesPayload = {
  planId: number; // e.g. 1088
  dayId: string; // e.g. "Day 1"
  groupIndex: number; // index of the exercise group inside the day
  exerciseIds: number[]; // array of `exercise_id` values to remove
};

type ReorderExercisesPayload = {
  planId: number;
  dayId: string;
  groupIndex: number;
  /** The new order – you only need the fields you store in the day */
  newOrder: Array<{
    exercise_id: number;
    sets?: number;
    reps?: number;
    timing_warmup?: number;
    timing_workset?: number;
    timing_finish?: number;
    Is_time?: boolean;
    is_weight?: boolean;
    Is_distance?: boolean;
    alternate_exercise_id?: number[];
    // add any other field you keep in the day
  }>;
};

const planSlice = createSlice({
  name: 'planData',
  initialState,
  reducers: {
    setPlanData(state, action: PayloadAction<ActivePlanListItem[]>) {
      state.planData = action.payload;
    },

    updateExerciseInaPlan(
      state,
      action: PayloadAction<{
        planId: number; // e.g. 1088
        dayId: string; // e.g. "Day 1"
        exercise:
          | {
              exercise_id: number;
              sets: number;
              reps: number;
              timing_warmup?: number;
              timing_workset?: number;
              timing_finish?: number;
              Is_time?: boolean;
              is_weight?: boolean;
              Is_distance?: boolean;
              alternate_exercise_id?: number[];
            }
          | Array<any>;
        groupIndex?: number;
      }>,
    ) {
      if (!state.planData) return;

      const {planId, dayId, exercise, groupIndex} = action.payload;
      const exercisesToAdd = Array.isArray(exercise) ? exercise : [exercise];

      state.planData = state.planData.map(plan => {
        if (plan.allData?.plan_id !== planId) return plan;

        return {
          ...plan,
          allData: {
            ...plan.allData,
            content: {
              ...plan.allData.content,
              workouts: plan.allData?.content?.workouts?.map(workout => {
                //  match workout by name
                if (workout.name !== dayId) {
                  return workout;
                }

                const groups = workout.exercises ?? [];
                const idx = typeof groupIndex === 'number' ? groupIndex : 0;
                if (groups[idx]) {
                  // check if exercise already exist then dont add
                  const existingExercises = groups[idx].workout_exercises;
                  const newExercises = exercisesToAdd.filter(
                    ex =>
                      !existingExercises.find(
                        e => e.exercise_id === ex.exercise_id,
                      ),
                  );

                  //  append to existing group
                  const updatedGroup = {
                    ...groups[idx],
                    workout_exercises: [
                      ...groups[idx].workout_exercises,
                      ...newExercises,
                    ],
                  };

                  return {
                    ...workout,
                    exercises: groups.map((g, i) =>
                      i === idx ? updatedGroup : g,
                    ),
                  };
                } else {
                  //  create new group if none exist
                  return {
                    ...workout,
                    exercises: [
                      ...groups,
                      {type: 'custom', workout_exercises: exercisesToAdd},
                    ],
                  };
                }
              }),
            },
          },
        };
      });
    },

    // function for replace all exercise for a particular day in workout wuth re oredereed exercise
    reorderExercises(state, action: PayloadAction<ReorderExercisesPayload>) {
      if (!state.planData) return;

      const {planId, dayId, groupIndex, newOrder} = action.payload;

      state.planData = state.planData.map(plan => {
        if (plan.allData?.plan_id !== planId) return plan;

        return {
          ...plan,
          allData: {
            ...plan.allData,
            content: {
              ...plan.allData.content,
              workouts: plan.allData?.content?.workouts?.map(workout => {
                if (workout.name !== dayId) return workout;

                const groups = workout.exercises ?? [];
                const idx = typeof groupIndex === 'number' ? groupIndex : 0;
                if (groups[idx]) {
                  return {
                    ...workout,
                    exercises: groups.map((g, i) =>
                      i === idx ? {...g, workout_exercises: newOrder} : g,
                    ),
                  };
                } else {
                  return workout;
                }
              }),
            },
          },
        };
      });
    },

    deleteExercises(state, action: PayloadAction<DeleteExercisesPayload>) {
      if (!state.planData) return;

      const {planId, dayId, groupIndex, exerciseIds} = action.payload;

      // Build a Set for O(1) look-ups
      const idsToDelete = new Set(exerciseIds);

      state.planData = state.planData.map(plan => {
        if (plan.allData?.plan_id !== planId) return plan;

        return {
          ...plan,
          allData: {
            ...plan.allData,
            content: {
              ...plan.allData.content,
              workouts: plan.allData?.content?.workouts?.map(workout => {
                if (workout.name !== dayId) return workout;

                const groups = workout.exercises ?? [];

                // Guard against out-of-bounds groupIndex
                if (!groups[groupIndex]) return workout;

                const updatedGroup = {
                  ...groups[groupIndex],
                  workout_exercises: groups[
                    groupIndex
                  ].workout_exercises.filter(
                    ex => !idsToDelete.has(ex.exercise_id),
                  ),
                };

                return {
                  ...workout,
                  exercises: groups.map((g, i) =>
                    i === groupIndex ? updatedGroup : g,
                  ),
                };
              }),
            },
          },
        };
      });
    },
    deleteExercisesByIds(
      state,
      action: PayloadAction<{exerciseIds: number[]}>,
    ) {
      if (!state.planData) return;

      const idsToDelete = new Set(action.payload.exerciseIds);

      state.planData = state.planData.map(plan => {
        if (!plan.allData?.content?.workouts) return plan;

        return {
          ...plan,
          allData: {
            ...plan.allData,
            content: {
              ...plan.allData.content,
              workouts: plan.allData.content.workouts.map(workout => {
                const updatedExercises =
                  workout.exercises?.map(group => ({
                    ...group,
                    workout_exercises: group.workout_exercises.filter(
                      ex => !idsToDelete.has(ex.exercise_id),
                    ),
                  })) ?? [];

                return {
                  ...workout,
                  exercises: updatedExercises,
                };
              }),
            },
          },
        };
      });
    },
  },
});

export const {
  setPlanData,
  updateExerciseInaPlan,
  reorderExercises,
  deleteExercises,
  deleteExercisesByIds,
} = planSlice.actions;
export default planSlice.reducer;
