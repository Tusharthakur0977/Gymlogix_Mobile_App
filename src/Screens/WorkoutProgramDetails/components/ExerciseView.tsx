import {useNavigation} from '@react-navigation/native';
import React, {FC, useCallback, useMemo, useRef} from 'react';
import {
  Animated,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import ICONS from '../../../Assets/Icons';
import IMAGES from '../../../Assets/Images';
import CustomIcon from '../../../Components/CustomIcon';
import {CustomText} from '../../../Components/CustomText';
import PrimaryButton from '../../../Components/PrimaryButton';
import {selectAllExercises} from '../../../Redux/slices/exerciseCatalogSlice';
import {setSupersetData} from '../../../Redux/slices/LogWorkoutSlice';
import {
  reorderExercises,
  updateExerciseInaPlan,
} from '../../../Redux/slices/PlanDataSlice';
import {
  setCopiedExerciseIds,
  setCopiedSupersets,
  setCopiedSource,
} from '../../../Redux/slices/workoutDataSlice';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import {Exercise} from '../../../Seeds/ExerciseCatalog';
import {WeeklyStructure} from '../../../Seeds/TrainingPLans';
import COLORS from '../../../Utilities/Colors';
import {horizontalScale, verticalScale, wp} from '../../../Utilities/Metrics';

// Define a type for a Superset
type Superset = {
  type: 'superset';
  exercises: Exercise[];
};

// Union type to allow both individual exercises and supersets in the list
type ExerciseListItem = Exercise | Superset;

// Type for muscle data with percentage
export type MuscleData = {
  name: string;
  percentage: number;
};

// Update the props to include the states and handlers passed from parent
type ExerciseData = {
  data: WeeklyStructure[];
  isSupersetSelected: boolean;
  onPressSuperset: (superset: Superset) => void;
  onCloseSupersetView: () => void;
  selectedSuperset: Superset | null;
  selectedExercises: string[];
  exerciseData: ExerciseListItem[];
  setExerciseData: React.Dispatch<React.SetStateAction<ExerciseListItem[]>>;
  handleExercisePress: (item: any) => void;
  handleLongExercisePress: (item: any) => void;
  handleDeleteSelected: () => void;
  handleClickSuperSet: () => void;
  fadeAnim: Animated.Value;
  programId: string | number;
  currentDayIndex: number;
  dayData: any;
  completedExercises: string[];
  hideButton: boolean;
  handleCancelSelection: (item: any) => void;
};

// Helper function to get exercise name
const getExerciseName = (exercise: Exercise): string => {
  return exercise.name;
};

// Helper function to get exercise image
const getExerciseImage = (exercise: Exercise): string => {
  return exercise.coverImage?.uri || exercise.images?.[0]?.uri || '';
};

// Helper function to get target muscles
const getTargetMuscles = (exercise: Exercise): string[] => {
  return exercise.targetMuscles || [];
};

// Helper function to get exercise sets (with default)
const getExerciseSets = (exercise: Exercise): number => {
  return exercise.recommendedSets || 3;
};

// Helper function to get exercise reps (with default)
const getExerciseReps = (exercise: Exercise): string => {
  return exercise.recommendedReps?.toString() || '10';
};

// Helper function to get exercise rest (with default)
const getExerciseRest = (exercise: Exercise): string => {
  return '60 seconds'; // Default rest time
};

// Helper function to get exercise weight (with default)
const getExerciseWeight = (exercise: Exercise): string => {
  return 'Bodyweight'; // Default weight
};

const ExerciseView: FC<ExerciseData> = ({
  data,
  isSupersetSelected,
  onPressSuperset,
  onCloseSupersetView,
  selectedSuperset,
  selectedExercises,
  exerciseData,
  setExerciseData,
  handleExercisePress,
  handleLongExercisePress,
  handleDeleteSelected,
  handleClickSuperSet,
  programId,
  currentDayIndex = 0,
  dayData,
  completedExercises,
  hideButton,
  handleCancelSelection,
}) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  // Calculate targeted muscles and their percentages based on superset or all exercises
  const prevExercisesRef = useRef<string[]>([]);
  const exercisesRef = useRef<any[]>([]);
  const allExercises = useAppSelector(selectAllExercises);
  const exercisesData = useAppSelector(state => state.exerciseData);

  const {
    copiedExerciseIds,
    copiedSupersets,
    copiedFromPlanId,
    copiedFromDayIndex,
  } = useAppSelector(state => state.workoutData);

  const findExercises = useCallback(
    (dataArray: any[]) => {
      if (!Array.isArray(dataArray)) return [];
      const result: any[] = [];

      const exerciseList =
        Array.isArray(allExercises) && allExercises.length > 0
          ? allExercises
          : Array.isArray(exercisesData?.exerciseData)
          ? exercisesData.exerciseData
          : [];

      dataArray.forEach((dayItem: any) => {
        // Check if this is a superset object
        if (
          dayItem &&
          typeof dayItem === 'object' &&
          'type' in dayItem &&
          dayItem.type === 'superset'
        ) {
          // It's a superset, keep it as is
          result.push(dayItem);
          return;
        }

        // Regular exercise - look it up in the exercise list
        const exercise = exerciseList.find(
          (ex: any) =>
            Number(ex.exercise_id ?? ex.id) === Number(dayItem.exercise_id),
        );

        if (exercise) {
          result.push({
            ...exercise,
            exerciseSettings: dayItem,
          });
        } else {
          result.push({
            name: '',
            description: '',
            images_urls: [],
            main_muscle: '',
            secondary_muscles: [],
            mechanics: '',
            difficulty: '',
            type: '',
            equipment: '',
            id: dayItem.exercise_id,
            exercise_id: dayItem.exercise_id,
            exerciseSettings: dayItem,
          });
        }
      });

      return result;
    },
    [allExercises, exercisesData],
  );

  const normalizeMuscleKey = (name: string) => {
    return name
      .toLowerCase() // make all lowercase first
      .split(' ') // split on spaces
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
      ) // capitalize subsequent words
      .join(''); // join without spaces
  };

  const MuscleImages: {[key: string]: any} = {
    adductors: IMAGES.adductors,
    back: IMAGES.back,
    biceps: IMAGES.biceps,
    calf: IMAGES.calf,
    forearms: IMAGES.foreArms,
    glutes: IMAGES.glutes,
    hamstrings: IMAGES.hamstrings,
    quads: IMAGES.quads,
    shoulders: IMAGES.shouder,
    traps: IMAGES.traps,
    tricpes: IMAGES.tricpes,
    twins: IMAGES.twins,
  };

  //  Memoize data & cache it in ref to prevent blinking
  // Use exerciseData if it has valid content, otherwise use data
  const dataToUse = useMemo(() => {
    // Use exerciseData if it has any content (exercises or supersets)
    // This ensures drag and drop works for single exercises too
    if (exerciseData && exerciseData.length > 0) {
      return exerciseData;
    }

    // Fall back to original data if exerciseData is empty
    return data;
  }, [data, exerciseData]);

  const stableExercises = useMemo(() => {
    const result = findExercises(dataToUse);

    return result;
  }, [dataToUse, findExercises]);

  exercisesRef.current = stableExercises;

  const muscleData = useMemo(() => {
    const muscleCount: {[key: string]: number} = {};
    let totalMuscleMentions = 0;

    if (isSupersetSelected && selectedSuperset) {
      // Use the selectedSuperset prop instead of searching in exerciseData
      selectedSuperset.exercises.forEach(exercise => {
        const muscles = exercise.targetMuscles
          ? exercise.targetMuscles
          : (exercise as any).main_muscle
          ? [(exercise as any).main_muscle]
          : [];
        const secondaryMuscles = (exercise as any).secondary_muscles || [];
        [...muscles, ...secondaryMuscles].forEach(muscle => {
          if (muscle) {
            muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
            totalMuscleMentions++;
          }
        });
      });
    } else {
      // Use stableExercises which has full exercise details
      stableExercises.forEach((item: any) => {
        if (
          item &&
          typeof item === 'object' &&
          'type' in item &&
          item.type === 'superset'
        ) {
          item.exercises.forEach((exercise: any) => {
            const muscles = exercise.targetMuscles
              ? exercise.targetMuscles
              : exercise.main_muscle
              ? [exercise.main_muscle]
              : [];
            const secondaryMuscles = exercise.secondary_muscles || [];
            [...muscles, ...secondaryMuscles].forEach((muscle: any) => {
              if (muscle) {
                muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
                totalMuscleMentions++;
              }
            });
          });
        } else {
          // Regular exercise
          // Try different property names for muscles
          const muscles = item.targetMuscles
            ? Array.isArray(item.targetMuscles)
              ? item.targetMuscles
              : [item.targetMuscles]
            : item.target_muscles
            ? Array.isArray(item.target_muscles)
              ? item.target_muscles
              : [item.target_muscles]
            : item.main_muscle
            ? [item.main_muscle]
            : [];

          const secondaryMuscles = item.secondary_muscles
            ? Array.isArray(item.secondary_muscles)
              ? item.secondary_muscles
              : [item.secondary_muscles]
            : item.secondaryMuscle
            ? Array.isArray(item.secondaryMuscle)
              ? item.secondaryMuscle
              : [item.secondaryMuscle]
            : [];

          [...muscles, ...secondaryMuscles].forEach((muscle: any) => {
            if (muscle) {
              muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
              totalMuscleMentions++;
            }
          });
        }
      });
    }

    const muscles: MuscleData[] = Object.keys(muscleCount).map(muscle => ({
      name: muscle,
      percentage: totalMuscleMentions
        ? Math.round((muscleCount[muscle] / totalMuscleMentions) * 100)
        : 0,
    }));

    return muscles.sort((a, b) => b.percentage - a.percentage);
  }, [isSupersetSelected, selectedSuperset, stableExercises]);

  const getExerciseIDs = () => {
    const exercisesToCopy: any[] = [];
    const supersets: any[] = [];

    // Copy both individual exercises and supersets
    stableExercises.forEach(item => {
      if (
        item &&
        typeof item === 'object' &&
        'type' in item &&
        item.type === 'superset'
      ) {
        // Create the superset ID
        const supersetId = `superset-${item.exercises
          .map((e: any) => e.exercise_id || e.id)
          .join('-')}`;

        // Check if the superset itself is selected (by its unique ID)
        if (selectedExercises.includes(supersetId)) {
          // Copy the entire superset
          supersets.push(item);
        } else {
          // Check if individual exercises in the superset are selected
          item.exercises.forEach((ex: any) => {
            const id = ex.exercise_id || ex.id;
            if (selectedExercises.includes(id)) {
              exercisesToCopy.push(ex);
            }
          });
        }
      } else {
        // For regular exercises, check if it's selected
        const id = item.exercise_id || item.id;
        if (selectedExercises.includes(id)) {
          exercisesToCopy.push(item);
        }
      }
    });

    // Save selected exercises (full objects) and supersets to Redux state for paste functionality
    dispatch(setCopiedExerciseIds(exercisesToCopy));
    dispatch(setCopiedSupersets(supersets));

    // Save the source plan and day index
    dispatch(
      setCopiedSource({
        planId: programId,
        dayIndex: currentDayIndex,
      }),
    );

    return exercisesToCopy.map(ex => String(ex.id || ex.exercise_id));
  };

  // Check if we should show the paste button
  const shouldShowPasteButton = useMemo(() => {
    // No copied data
    if (copiedExerciseIds.length === 0 && copiedSupersets.length === 0) {
      return false;
    }

    // Check if we're on the same plan and day where we copied from
    if (
      copiedFromPlanId !== null &&
      copiedFromDayIndex !== null &&
      String(copiedFromPlanId) === String(programId) &&
      copiedFromDayIndex === currentDayIndex
    ) {
      return false;
    }

    // Get current exercise IDs in this day
    const currentExerciseIds = new Set(
      stableExercises
        .filter(item => !item.type || item.type !== 'superset')
        .map((item: any) => String(item.exercise_id || item.id)),
    );

    // Check if all copied individual exercises already exist
    const allIndividualExercisesExist = copiedExerciseIds.every((exe: any) => {
      const id = String(exe.exercise_id || exe.id);
      return currentExerciseIds.has(id);
    });

    // Check if all copied supersets already exist
    const allSupersetsExist = copiedSupersets.every((superset: any) => {
      const supersetId = `superset-${superset.exercises
        .map((e: any) => e.exercise_id || e.id)
        .join('-')}`;

      // Check if this exact superset exists in stableExercises
      return stableExercises.some((item: any) => {
        if (!item.type || item.type !== 'superset') return false;
        const existingSupersetId = `superset-${item.exercises
          .map((e: any) => e.exercise_id || e.id)
          .join('-')}`;
        return existingSupersetId === supersetId;
      });
    });

    // If all copied items already exist, don't show paste button
    if (
      copiedExerciseIds.length > 0 &&
      copiedSupersets.length === 0 &&
      allIndividualExercisesExist
    ) {
      return false;
    }

    if (
      copiedExerciseIds.length === 0 &&
      copiedSupersets.length > 0 &&
      allSupersetsExist
    ) {
      return false;
    }

    if (
      copiedExerciseIds.length > 0 &&
      copiedSupersets.length > 0 &&
      allIndividualExercisesExist &&
      allSupersetsExist
    ) {
      return false;
    }

    return true;
  }, [
    copiedExerciseIds,
    copiedSupersets,
    copiedFromPlanId,
    copiedFromDayIndex,
    programId,
    currentDayIndex,
    stableExercises,
  ]);

  const handlePasteExercises = () => {
    if (copiedExerciseIds.length === 0 && copiedSupersets.length === 0) return;

    const currentDay = dayData[currentDayIndex];
    const dayId = currentDay?.name || `day-${currentDayIndex}`;

    // Get current exercise IDs to check for duplicates
    const currentExerciseIds = new Set(
      stableExercises
        .filter(item => !item.type || item.type !== 'superset')
        .map((item: any) => String(item.exercise_id || item.id)),
    );

    // Filter out exercises that already exist
    const exercisesToPaste = copiedExerciseIds.filter((exe: any) => {
      const id = String(exe.exercise_id || exe.id);
      const exists = currentExerciseIds.has(id);
      if (exists) {
      }
      return !exists;
    });

    // Filter out supersets that already exist
    const supersetsToPaste = copiedSupersets.filter((superset: any) => {
      const supersetId = `superset-${superset.exercises
        .map((e: any) => e.exercise_id || e.id)
        .join('-')}`;

      const exists = stableExercises.some((item: any) => {
        if (!item.type || item.type !== 'superset') return false;
        const existingSupersetId = `superset-${item.exercises
          .map((e: any) => e.exercise_id || e.id)
          .join('-')}`;
        return existingSupersetId === supersetId;
      });

      if (exists) {
      }
      return !exists;
    });

    if (exercisesToPaste.length === 0 && supersetsToPaste.length === 0) {
      return;
    }

    // Helper function to convert time string to seconds
    const toSeconds = (timeStr?: string): number => {
      if (!timeStr || typeof timeStr !== 'string') return 0;
      const trimmed = timeStr.trim();
      if (!trimmed) return 0;

      let parts = trimmed
        .split(':')
        .map(p => p.trim())
        .filter(p => p && !isNaN(Number(p)))
        .map(Number);

      if (parts.length < 2) return 0;
      if (parts.length > 2) parts = parts.slice(0, 2);

      const [min = 0, sec = 0] = parts;
      return min * 60 + sec;
    };

    // Helper function to convert seconds to minutes decimal
    const toMinutesDecimal = (seconds: number): number => {
      if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0)
        return 0;
      const minutes = Math.floor(seconds / 60);
      const secs = (seconds % 60) / 60;
      return parseFloat((minutes + secs).toFixed(2));
    };

    // Format exercises for updateExerciseInaPlan (Redux)
    const payload = exercisesToPaste.map((exe: any) => {
      const exerciseId = exe.id || exe.exercise_id;
      const settings = exe.exerciseSettings || {};

      return {
        exercise_id: exerciseId,
        sets: settings.sets || 3,
        reps: settings.reps || 10,
        timing_warmup:
          toMinutesDecimal(toSeconds(settings.timing?.warmUp)) || 0,
        timing_workset:
          toMinutesDecimal(toSeconds(settings.timing?.workingSet)) || 0,
        timing_finish:
          toMinutesDecimal(toSeconds(settings.timing?.finishExercise)) || 0,
        Is_time: settings.loggingType === 'Time',
        is_weight: settings.loggingType === 'Weight',
        Is_distance: settings.loggingType === 'Distance',
        alternate_exercise_id: settings.alternateExercise || [],
      };
    });

    // Dispatch action to add exercises to the plan (Redux)
    dispatch(
      updateExerciseInaPlan({
        planId: Number(programId),
        dayId,
        exercise: payload,
      }),
    );

    // Update local exerciseData state to immediately show the pasted exercises and supersets
    // exerciseData expects raw exercise data (with exercise_id, sets, reps, etc.) or superset objects
    const updatedExerciseData = [
      ...exerciseData,
      ...payload,
      ...supersetsToPaste,
    ] as any;
    setExerciseData(updatedExerciseData);

    // Update Redux superset data if needed
    const workoutId = currentDay?.workout_id;
    if (workoutId) {
      dispatch(
        setSupersetData({
          workoutPlanId: Number(programId),
          workoutId: workoutId,
          exerciseData: updatedExerciseData,
        }),
      );
    }

    // Clear clipboard
    dispatch(setCopiedExerciseIds([]));
    dispatch(setCopiedSupersets([]));
  };

  const renderItem = useCallback(
    ({item, drag, isActive}: RenderItemParams<any>) => {
      const alternateExerciseId = item.exerciseSettings?.alternateExercise;
      const alternateExercise: any = allExercises.find(
        exercise => exercise.id === alternateExerciseId,
      );

      const getExerciseImage = (exerciseData: any) => {
        if (!exerciseData)
          return 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop';

        // 1️ Prefer images_urls
        if (
          Array.isArray(exerciseData.images_urls) &&
          exerciseData.images_urls.length > 0
        ) {
          return exerciseData.images_urls[0];
        }

        // 2️ Then check images (string or object with .uri)
        if (
          Array.isArray(exerciseData.images) &&
          exerciseData.images.length > 0
        ) {
          const firstImage = exerciseData.images[0];
          if (typeof firstImage === 'string') return firstImage;
          if (firstImage?.uri) return firstImage.uri;
        }

        // 3️ Default fallback
        return 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop';
      };

      // -------------------- Superset Block --------------------
      if (
        item &&
        typeof item === 'object' &&
        'type' in item &&
        item.type === 'superset'
      ) {
        // Create a unique ID for the superset using all exercise IDs
        const supersetId = `superset-${item.exercises
          .map((e: any) => e.exercise_id || e.id)
          .join('-')}`;
        const isSupersetSelected = selectedExercises.includes(supersetId);

        return (
          <ScaleDecorator>
            <TouchableOpacity
              onPress={() => {
                if (!hideButton) {
                  onPressSuperset(item as Superset);
                }
              }}
              // onLongPress={
              //   !hideButton
              //     ? () => {
              //         handleLongExercisePress(supersetId);
              //       }
              //     : undefined
              // }
              activeOpacity={1}
              disabled={isActive}
              style={{
                padding: verticalScale(4),
                gap: verticalScale(5),
                borderColor: isSupersetSelected
                  ? COLORS.yellow
                  : COLORS.whiteTail,
                borderWidth: isSupersetSelected ? 2 : 1,
                borderRadius: 10,
                width: wp(95),
                alignSelf: 'center',
                backgroundColor: isActive
                  ? COLORS.nickel
                  : isSupersetSelected
                  ? COLORS.lighterBrown
                  : undefined,
              }}>
              <View
                style={{
                  width: '100%',
                  backgroundColor: COLORS.brown,
                  paddingHorizontal: horizontalScale(10),
                  paddingVertical: verticalScale(2),
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <CustomText fontFamily="italic" fontSize={14}>
                  SUPERSET
                </CustomText>

                {/* Drag handle for superset */}
                <TouchableOpacity onLongPress={drag} disabled={isActive}>
                  <CustomIcon
                    Icon={ICONS.ThreeLineSideDotMenuView}
                    height={verticalScale(16)}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  width: '98%',
                  gap: verticalScale(5),
                  alignSelf: 'center',
                }}>
                {item.exercises.map((exercise: any, index: number) => {
                  const isSelected = (item as Superset).exercises.some(
                    (exercise: any) =>
                      selectedExercises.includes(
                        exercise.exercise_id ?? exercise.id,
                      ),
                  );
                  const exerciseId = String(
                    exercise.exercise_id || exercise.id,
                  );
                  const isCompleted = completedExercises.includes(exerciseId);
                  return (
                    <View
                      key={exercise.exercise_id || exercise.id || index}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        borderRadius: verticalScale(10),
                        backgroundColor: isCompleted
                          ? COLORS.black
                          : COLORS.lightBrown,
                        padding: verticalScale(5),
                      }}>
                      <Image
                        source={{
                          uri:
                            getExerciseImage(exercise) ||
                            'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop',
                        }}
                        style={styles.ExerciseImage}
                      />
                      <View style={styles.ExerciseDetails}>
                        <CustomText
                          color={COLORS.yellow}
                          fontFamily="medium"
                          fontSize={12}>
                          {getExerciseName(exercise)}
                        </CustomText>
                        <CustomText
                          color={COLORS.white}
                          fontFamily="medium"
                          fontSize={12}>
                          {`${getExerciseSets(
                            exercise,
                          )} sets x ${getExerciseReps(exercise)} reps`}
                        </CustomText>
                      </View>
                    </View>
                  );
                })}
              </View>
            </TouchableOpacity>
          </ScaleDecorator>
        );
      }

      // -------------------- Normal Exercise --------------------
      const isSelected = selectedExercises.includes(
        item.exercise_id ?? item.id,
      );
      // Use the same ID logic as when saving sets
      const exerciseId = String(
        item.exercise_id || item.exerciseSettings?.exercise_id || item.id,
      );
      const isCompleted = completedExercises.includes(exerciseId);

      const isAlternateSelected =
        alternateExercise && selectedExercises.includes(item.name);
      const isAlternateCompletedany: any = allExercises.find(
        exercise => exercise.id === alternateExerciseId,
      );

      return (
        <ScaleDecorator>
          <View>
            <TouchableOpacity
              onPress={() => {
                handleExercisePress(item);
              }}
              onLongPress={
                !hideButton
                  ? () => {
                      const idToSelect = item.exercise_id || item.id;
                      handleLongExercisePress(idToSelect);
                    }
                  : undefined //  no long-press when hideButton is true
              }
              activeOpacity={0.9}
              style={[
                styles.ExerciseItem,
                {alignSelf: 'center'},
                isSelected && styles.selectedExerciseItem,
                isCompleted && styles.completedExerciseItem,
                isActive && {backgroundColor: COLORS.nickel},
              ]}>
              <Image
                source={{uri: getExerciseImage(item)}}
                style={styles.ExerciseImage}
              />

              <View style={styles.ExerciseDetails}>
                <CustomText
                  color={COLORS.yellow}
                  fontFamily="medium"
                  fontSize={12}>
                  {item.name}
                </CustomText>
                <CustomText
                  color={COLORS.white}
                  fontFamily="medium"
                  fontSize={12}>
                  {`${item.exerciseSettings.sets} Sets x ${item.exerciseSettings.reps}`}
                </CustomText>
              </View>

              {/* Right side actions */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: horizontalScale(8),
                }}>
                {/* Delete/Copy */}

                {/* Drag handle */}
                <TouchableOpacity
                  disabled={isActive}
                  activeOpacity={0.8}
                  onLongPress={drag}>
                  <CustomIcon
                    Icon={ICONS.SidMultiDotView}
                    height={verticalScale(27)}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Alternate Exercise */}
            {alternateExercise && (
              <View style={{marginVertical: verticalScale(5)}}>
                <CustomText
                  fontFamily="italic"
                  fontSize={14}
                  color={COLORS.whiteTail}
                  style={{marginVertical: horizontalScale(5)}}>
                  Alternate
                </CustomText>

                <View style={{width: '100%'}}>
                  <TouchableOpacity
                    onPress={() => {
                      if (!hideButton) {
                        handleExercisePress(alternateExercise);
                      }
                    }}
                    activeOpacity={0.7}
                    style={[
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderRadius: verticalScale(10),
                        borderColor: COLORS.whiteTail,
                        backgroundColor: COLORS.lightBrown,
                        width: wp(90),
                        padding: verticalScale(5),
                        alignSelf: 'flex-end',
                      },
                      isAlternateSelected && styles.selectedExerciseItem,
                    ]}>
                    <Image
                      source={{uri: getExerciseImage(alternateExercise)}}
                      style={styles.ExerciseImage}
                    />
                    <View style={styles.ExerciseDetails}>
                      <CustomText
                        color={COLORS.yellow}
                        fontFamily="medium"
                        fontSize={12}>
                        {getExerciseName(alternateExercise)}
                      </CustomText>
                      <CustomText
                        color={COLORS.white}
                        fontFamily="medium"
                        fontSize={12}>
                        {`${getExerciseSets(
                          alternateExercise,
                        )} sets x ${getExerciseReps(alternateExercise)} reps`}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScaleDecorator>
      );
    },
    [
      selectedExercises,
      completedExercises,
      hideButton,
      allExercises,
      handleExercisePress,
      handleLongExercisePress,
      onPressSuperset,
    ],
  );

  const renderExerciseList = () => {
    return (
      <View style={{flex: 1}}>
        <DraggableFlatList
          data={stableExercises as any}
          bounces={false}
          onDragEnd={({data: newData}) => {
            exercisesRef.current = newData;
            // derive identifiers from props/context
            const currentDay = dayData[currentDayIndex];
            const dayId = currentDay?.name || `day-${currentDayIndex}`;
            const planId = Number(programId);
            const groupIndex = 0; // adjust if needed

            // map reordered data into clean payload for Redux
            const mappedOrder = newData
              .map(item => {
                // Handle supersets - they don't have exerciseSettings
                if (item?.type === 'superset') {
                  return null; // Skip supersets in Redux order
                }

                const exerciseId =
                  item?.exerciseSettings?.exercise_id ??
                  item?.exercise_id ??
                  item?.id ??
                  item?.exercise?.id ??
                  null;

                return {
                  exercise_id: exerciseId,
                  sets: item?.exerciseSettings?.sets,
                  reps: item?.exerciseSettings?.reps,
                  timing_warmup: item?.exerciseSettings?.timing_warmup,
                  timing_workset: item?.exerciseSettings?.timing_workset,
                  timing_finish: item?.exerciseSettings?.timing_finish,
                  Is_time: item?.exerciseSettings?.Is_time,
                  is_weight: item?.exerciseSettings?.is_weight,
                  Is_distance: item?.exerciseSettings?.Is_distance,
                  alternate_exercise_id:
                    item?.exerciseSettings?.alternate_exercise_id || [],
                };
              })
              .filter(item => item !== null); // Remove null entries (supersets)

            // persist reordered data to Redux
            dispatch(
              reorderExercises({
                planId,
                dayId,
                groupIndex,
                newOrder: mappedOrder,
              }),
            );

            // Convert enriched data back to raw format for exerciseData state
            const rawExerciseData = newData
              .map(item => {
                // If it's a superset, keep it as is
                if (item?.type === 'superset') {
                  return item;
                }

                // For regular exercises, extract ONLY the raw exercise data (exerciseSettings)
                // If item has exerciseSettings, it means it's an enriched object from findExercises
                if (item?.exerciseSettings) {
                  const exerciseId =
                    item.exerciseSettings.exercise_id ??
                    item.exercise_id ??
                    item.id;

                  // Return ONLY the exerciseSettings (raw format), not the enriched object
                  return {
                    exercise_id: exerciseId,
                    sets: item.exerciseSettings.sets,
                    reps: item.exerciseSettings.reps,
                    timing_warmup: item.exerciseSettings.timing_warmup,
                    timing_workset: item.exerciseSettings.timing_workset,
                    timing_finish: item.exerciseSettings.timing_finish,
                    Is_time: item.exerciseSettings.Is_time,
                    is_weight: item.exerciseSettings.is_weight,
                    Is_distance: item.exerciseSettings.Is_distance,
                    alternate_exercise_id:
                      item.exerciseSettings.alternate_exercise_id || [],
                  };
                }

                // If it doesn't have exerciseSettings, return as is
                return item;
              })
              .filter(item => item !== null && item !== undefined);

            // Update exerciseData state
            setExerciseData(rawExerciseData);

            // If there are supersets in the data, also update Redux superset data
            const hasSupersets = rawExerciseData.some(
              item => item?.type === 'superset',
            );

            if (hasSupersets) {
              const workoutId = currentDay?.workout_id;
              if (workoutId) {
                dispatch(
                  setSupersetData({
                    workoutPlanId: planId,
                    workoutId: workoutId,
                    exerciseData: rawExerciseData,
                  }),
                );
              }
            }
          }}
          keyExtractor={(item: any, index) => {
            if (item.type === 'superset') {
              return `superset-${item.exercises
                .map((e: any) => e.exercise_id || e.id)
                .join('-')}-`;
            }
            return item.exercise_id || item.id || `fallback-${index}`;
          }}
          renderItem={renderItem}
          ItemSeparatorComponent={() => (
            <View style={{height: verticalScale(10)}} />
          )}
          style={{width: '100%'}}
          contentContainerStyle={{
            paddingHorizontal: horizontalScale(10),
          }}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          ListFooterComponent={() =>
            !hideButton ? (
              <View
                style={{alignItems: 'flex-end', marginTop: verticalScale(10)}}>
                <PrimaryButton
                  onPress={() => {
                    const currentDay = dayData[currentDayIndex];
                    const dayId = currentDay?.name || `day-${currentDayIndex}`;

                    // Get exercise IDs from exerciseData (which includes supersets)
                    // Extract IDs from both regular exercises and exercises within supersets
                    const exerciseIds: string[] = [];
                    exerciseData.forEach(item => {
                      if (
                        item &&
                        typeof item === 'object' &&
                        'type' in item &&
                        item.type === 'superset'
                      ) {
                        // Extract IDs from superset exercises
                        (item as any).exercises.forEach((ex: any) => {
                          const id = ex.id || ex.exercise_id;

                          exerciseIds.push(id);
                        });
                      } else {
                        // Regular exercise
                        const id =
                          (item as any).id || (item as any).exercise_id;
                        exerciseIds.push(id);
                      }
                    });

                    navigation.navigate('exerciseList', {
                      fromTrainingPlan: programId
                        ? {
                            programId,
                            dayIndex: currentDayIndex,
                            dayId,
                            exerciseIds,
                          }
                        : undefined,
                    });
                  }}
                  isFullWidth={false}
                  style={{
                    width: 'auto',
                    paddingVertical: verticalScale(8),
                    paddingHorizontal: horizontalScale(12),
                    borderRadius: verticalScale(5),
                  }}
                  textSize={10}
                  title="Add Exercise"
                />
              </View>
            ) : null
          }
        />
      </View>
    );
  };

  const renderSupersetDetails = () => {
    // Use the selectedSuperset prop instead of searching in exerciseData
    const superset = selectedSuperset;

    if (!superset) return null;

    const warmUpTimeSeconds = 180; // 3 minutes static warm-up
    const coolDownTimeSeconds = 180; // 3 minutes static cool-down
    let workingTimeSeconds = 0;

    const timePerRep = 3; // 3 seconds per rep (controlled lifting)

    superset.exercises.forEach(exercise => {
      const repsRange = getExerciseReps(exercise).split('-');
      const reps =
        repsRange.length > 1
          ? Math.round((parseInt(repsRange[0]) + parseInt(repsRange[1])) / 2)
          : parseInt(repsRange[0]) || 0;

      const restSeconds =
        parseInt(getExerciseRest(exercise).replace(/\D/g, '')) || 60;

      const exerciseTime =
        getExerciseSets(exercise) * reps * timePerRep +
        restSeconds * (getExerciseSets(exercise) - 1);

      workingTimeSeconds += exerciseTime;
    });

    const fullCompletionTimeSeconds =
      warmUpTimeSeconds + workingTimeSeconds + coolDownTimeSeconds;

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    };

    return (
      <View
        style={{
          gap: verticalScale(10),
          width: wp(95),
          flex: 1,
        }}>
        <View
          style={{
            padding: verticalScale(4),
            gap: verticalScale(20),
            borderRadius: 10,
          }}>
          <CustomText fontFamily="bold" fontSize={14}>
            Superset
          </CustomText>
          <View
            style={{
              width: '98%',
              gap: verticalScale(5),
              alignSelf: 'center',
            }}>
            {superset.exercises.map((exercise: any, index) => {
              const exerciseId = String(exercise.exercise_id || exercise.id);
              const isCompleted = completedExercises.includes(exerciseId);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (!hideButton) {
                      handleExercisePress(exercise);
                    }
                  }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderRadius: verticalScale(10),
                    backgroundColor: isCompleted
                      ? COLORS.black
                      : COLORS.lightBrown,
                    padding: verticalScale(5),
                    borderWidth: 1,
                    borderColor: COLORS.white,
                  }}>
                  <Image
                    source={{
                      uri:
                        getExerciseImage(exercise) ||
                        'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                    }}
                    style={styles.ExerciseImage}
                  />
                  <View style={styles.ExerciseDetails}>
                    <CustomText
                      color={COLORS.yellow}
                      fontFamily="medium"
                      fontSize={12}>
                      {getExerciseName(exercise)}
                    </CustomText>
                    <CustomText
                      color={COLORS.white}
                      fontFamily="medium"
                      fontSize={12}>
                      {`${getExerciseSets(exercise)} sets x ${getExerciseReps(
                        exercise,
                      )} reps`}
                    </CustomText>
                  </View>
                  <View style={{justifyContent: 'center'}}>
                    <CustomIcon
                      Icon={ICONS.SidMultiDotView}
                      height={verticalScale(27)}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <CustomText fontFamily="bold" fontSize={14}>
            Rest Time
          </CustomText>
          <View style={{gap: verticalScale(10)}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <CustomText fontSize={14}>Warm-up Time</CustomText>
              <CustomText fontSize={14}>
                {formatTime(warmUpTimeSeconds)}
              </CustomText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <CustomText fontSize={14}>Working Time</CustomText>
              <CustomText fontSize={14}>
                {formatTime(workingTimeSeconds)}
              </CustomText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <CustomText fontSize={14}>Full Completion Time</CustomText>
              <CustomText fontSize={14}>
                {formatTime(fullCompletionTimeSeconds)}
              </CustomText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        gap: verticalScale(10),
        alignItems: 'center',
        flex: 1,
      }}>
      {isSupersetSelected ? (
        <ScrollView
          style={{
            width: wp(100),
            paddingHorizontal: horizontalScale(10),
            flex: 1,
          }}>
          <FlatList
            horizontal
            data={muscleData}
            renderItem={({item}) => {
              const normalizedKey = normalizeMuscleKey(item.name);
              const imageSource = MuscleImages[normalizedKey] || {
                uri: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              };
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: horizontalScale(5),
                    borderRadius: verticalScale(10),
                    padding: verticalScale(5),
                  }}>
                  <Image
                    source={imageSource}
                    style={{
                      height: 60,
                      width: 60,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: COLORS.whiteTail,
                    }}
                  />
                  <View
                    style={{
                      gap: verticalScale(5),
                      alignItems: 'flex-start',
                    }}>
                    <CustomText fontFamily="medium">{item.name}</CustomText>
                    <View
                      style={{
                        backgroundColor: COLORS.nickel,
                        paddingVertical: verticalScale(4),
                        paddingHorizontal: horizontalScale(20),
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 100,
                      }}>
                      <CustomText
                        color={COLORS.white}
                        fontFamily="medium"
                        fontSize={10}>
                        {`${item.percentage}%`}
                      </CustomText>
                    </View>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item, index) => item.name + index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: horizontalScale(10),
              paddingHorizontal: horizontalScale(5),
              marginVertical: verticalScale(20),
            }}
          />
          <View style={{flex: 1}}>{renderSupersetDetails()}</View>
        </ScrollView>
      ) : (
        <>
          {selectedExercises.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: wp(100),
                paddingHorizontal: horizontalScale(10),
                paddingBottom: verticalScale(10),
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  flex: 1,
                  paddingRight: horizontalScale(10),
                }}>
                <View style={{flexDirection: 'row', gap: horizontalScale(12)}}>
                  <TouchableOpacity
                    onPress={handleDeleteSelected}
                    style={styles.actionButton}>
                    <CustomIcon
                      Icon={ICONS.DeleteIcon}
                      height={15}
                      width={15}
                    />
                    <CustomText fontSize={6} fontFamily="bold">
                      DELETE
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={getExerciseIDs}>
                    <CustomIcon Icon={ICONS.CopyIcon} height={15} width={15} />
                    <CustomText fontSize={6} fontFamily="bold">
                      COPY
                    </CustomText>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCancelSelection}>
                  <CustomIcon
                    Icon={ICONS.WhiteCrossIcon}
                    height={12}
                    width={12}
                  />
                  <CustomText fontSize={6} fontFamily="bold">
                    CANCEL
                  </CustomText>
                </TouchableOpacity>
              </View>
              {selectedExercises.length > 1 && (
                <TouchableOpacity
                  onPress={handleClickSuperSet}
                  style={styles.actionButton}>
                  <CustomIcon
                    Icon={ICONS.SuperSetIcon}
                    height={15}
                    width={15}
                  />
                  <CustomText fontSize={6} fontFamily="bold">
                    SUPERSET
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View
              style={{width: wp(100), paddingHorizontal: horizontalScale(10)}}>
              <FlatList
                horizontal
                data={muscleData}
                renderItem={({item}) => {
                  const normalizedKey = normalizeMuscleKey(item.name);
                  const imageSource = MuscleImages[normalizedKey] || {
                    uri: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                  };
                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: horizontalScale(5),
                      }}>
                      <Image
                        source={imageSource}
                        style={{
                          height: 60,
                          width: 60,
                          borderRadius: 100,
                          borderWidth: 1,
                          borderColor: COLORS.whiteTail,
                        }}
                      />
                      <View
                        style={{
                          gap: verticalScale(5),
                          alignItems: 'flex-start',
                        }}>
                        <CustomText fontFamily="medium">{item.name}</CustomText>
                        <View
                          style={{
                            backgroundColor: COLORS.nickel,
                            paddingVertical: verticalScale(4),
                            paddingHorizontal: horizontalScale(20),
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 100,
                          }}>
                          <CustomText
                            color={COLORS.white}
                            fontFamily="medium"
                            fontSize={10}>
                            {`${item.percentage}%`}
                          </CustomText>
                        </View>
                      </View>
                    </View>
                  );
                }}
                keyExtractor={(item, index) => item.name + index.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: horizontalScale(10),
                  paddingHorizontal: horizontalScale(5),
                }}
              />
            </View>
          )}
          {shouldShowPasteButton && (
            <TouchableOpacity
              style={styles.pasetButton}
              onPress={handlePasteExercises}>
              <CustomIcon Icon={ICONS.CopyIcon} height={15} width={15} />
              <CustomText fontSize={6} fontFamily="bold">
                PASTE
              </CustomText>
            </TouchableOpacity>
          )}
          {renderExerciseList()}
        </>
      )}
    </View>
  );
};

export default ExerciseView;

const styles = StyleSheet.create({
  ExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: verticalScale(10),
    borderColor: COLORS.whiteTail,
    backgroundColor: COLORS.lightBrown,
    width: wp(95),
    padding: verticalScale(5),
  },
  completedExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: verticalScale(10),
    borderColor: COLORS.whiteTail,
    backgroundColor: COLORS.black,
    width: wp(95),
    padding: verticalScale(5),
  },

  selectedExerciseItem: {
    backgroundColor: COLORS.skinColor,
  },
  ExerciseImage: {
    height: '100%',
    minHeight: 71,
    width: 66,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  ExerciseDetails: {
    paddingHorizontal: horizontalScale(10),
    justifyContent: 'flex-start',
    gap: verticalScale(5),
    paddingVertical: verticalScale(4),
    flex: 1,
  },
  TargetMusclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(5),
  },
  TargetMuscleItem: {
    backgroundColor: COLORS.brown,
    borderRadius: 5,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
  },
  actionButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
    borderRadius: 100,
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  pasetButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
    borderRadius: 100,
    justifyContent: 'center',
    height: 40,
    width: 40,
    alignSelf: 'flex-start',
    marginLeft: horizontalScale(20),
  },
});
