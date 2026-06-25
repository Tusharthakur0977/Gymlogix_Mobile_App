import {useFocusEffect} from '@react-navigation/native';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  ImageBackground,
  InteractionManager,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {postData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import {workoutTimer} from '../../Components/WorkoutTimer';
import {
  clearDraftWorkout,
  clearSupersetData,
  resetWorkout,
  setCurrentCompletedExerciseIds,
  setSupersetData,
  setWorkoutProgress,
  setWorkoutTime,
  resetExerciseTimers,
  setStartCurrentExercise,
  clearStartCurrentExercise,
  pauseExerciseTimer,
  clearAllExerciseTimers,
} from '../../Redux/slices/LogWorkoutSlice';
import {deleteExercisesByIds} from '../../Redux/slices/PlanDataSlice';
import {addSchedule} from '../../Redux/slices/ScheduleSlice';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import {Exercise} from '../../Seeds/ExerciseCatalog';
import {LogWorkoutProgramDetailsScreenProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics';
import CoachCenterView from './components/CoachCenterView';
import DetailsView from './components/DetailsView';
import ExerciseDetails, {ExtendedSetDetail} from './components/ExerciseDetails';
import ExerciseView from './components/ExerciseView';
import HistoryView from './components/HistoryView';

// Define a type for a Superset
type Superset = {
  type: 'superset';
  exercises: Exercise[];
};

// Union type to allow both individual exercises and supersets in the list
type ExerciseListItem = Exercise | Superset;

const tabData = [
  {label: 'Exercises', value: 1},
  {label: 'History', value: 2},
  {label: 'Details', value: 3},
  {label: 'Coach’s Corner', value: 4},
];

type ExerciseTime = {
  exerciseId: string;
  timeInSeconds: number;
};

const WorkoutProgramDetails: FC<LogWorkoutProgramDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useAppDispatch();
  const {
    programId,
    day: routeDay,
    selectedProgram,
    ScheduleHistoryData,
    isFrom,
    sets,
  } = route.params;
  // Moved state from ExerciseView to parent
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseData, setExerciseData] = useState<ExerciseListItem[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const [isSupersetSelected, setIsSupersetSelected] = useState(false);
  const [selectedSuperset, setSelectedSuperset] = useState<Superset | null>(
    null,
  );
  const [isComponentReady, setIsComponentReady] = useState(false);
  const exercisesData = useAppSelector(state => state.exerciseData);
  const {planData} = useAppSelector(state => state.planData);
  const {userData} = useAppSelector(state => state.userData);
  const {scheduleData} = useAppSelector(state => state.scheduleData);
  const [showExerciseDetail, setShowExerciseDetail] = useState(false);
  const [isLoggingSet, setIsLoggingSet] = useState(false);
  const [selectedExerciseDetails, setSelectedExerciseDetails] =
    useState<any>(null);
  const [showAddSetUi, setShowAddSetUi] = useState(false);
  const [exerciseLog, setExerciseLog] = useState<any>([]);
  const [scheduleMap, setScheduleMap] = useState<{[key: string]: string}>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const completedExercises = useAppSelector(
    state => state.logWorkoutData.currentCompletedExerciseIds,
  );

  // Access isFinish from Redux
  const isFinish = useAppSelector(state => state.workoutData.isFinish);

  const exerciseTimeInSeconds = useAppSelector(
    state => state.logWorkoutData.exerciseTimers,
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [exerciseWithSetData, setexerciseWithSetData] = useState<
    | {
        exerciseId: string;
        setsData: ExtendedSetDetail[];
        isDropSet: boolean;
        logTime: any;
      }[]
    | null
  >(null);

  const {draftWorkout, workoutTime} = useAppSelector(
    state => state.logWorkoutData,
  );

  const programDetails = useMemo(
    () =>
      planData
        ?.filter(it => it.type === 'workout')
        .find(item => item.allData?.plan_id === programId),
    [planData, programId],
  );

  // Get the current day data from Redux store instead of route params
  // This ensures we always have the latest data including newly added exercises
  const currentDayData = useMemo(() => {
    if (!programDetails || !routeDay || routeDay.length === 0) return routeDay;

    // Find the matching day in the Redux store based on the day name from route
    const routeDayName = routeDay[0]?.day;

    const updatedDay = programDetails.allData?.content.workouts?.find(
      workout => workout.name === routeDayName,
    );

    // Return the updated day data from Redux, or fallback to route data
    return updatedDay ? [updatedDay] : routeDay;
  }, [programDetails, routeDay]);

  // Use the live Redux data instead of static route data
  // Initialize local mutable state from Redux/route data
  const [dayState, setDayState] = useState(currentDayData);

  // Use this dayState everywhere instead of currentDayData
  const day = dayState;

  // Defer component initialization until after navigation animation completes
  useEffect(() => {
    setIsComponentReady(true);
    return () => {};
  }, []);

  useEffect(() => {
    if (isFrom || !isComponentReady) return;

    // Restore from Redux on mount
    setElapsedSeconds(workoutTime || 0);

    // Start interval
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        const newTime = prev + 1;
        // Save to Redux every second
        dispatch(setWorkoutTime(newTime));
        return newTime;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isFrom, workoutTime, dispatch, isComponentReady]); // Re-run if workoutTime changes externally

  // Moved exerciseList calculation to parent
  const exerciseList = useMemo(() => {
    const list: Exercise[] = [];
    day.map(day => day.exercises.map((e: any) => list.push(e)));
    return list;
  }, [day, programDetails]);

  // Get the flattened exercises (workout_exercises)
  const exercises = useMemo(() => {
    return day.flatMap(d =>
      d.exercises.flatMap((e: any) => e.workout_exercises),
    );
  }, [day]);

  // Get superset data from Redux (with type conversion for comparison)
  const supersetDataFromRedux = useAppSelector(state =>
    state.logWorkoutData.supersetData.find(
      data =>
        Number(data.workoutPlanId) === Number(programId) &&
        Number(data.workoutId) === Number((day[0] as any)?.workout_id),
    ),
  );

  // Track previous exercises length to detect when new exercises are added
  const prevExercisesLength = useRef(0);
  const hasInitialized = useRef(false);

  // Restore superset data from Redux and merge with new exercises
  useEffect(() => {
    if (
      supersetDataFromRedux?.exerciseData &&
      Array.isArray(supersetDataFromRedux.exerciseData) &&
      supersetDataFromRedux.exerciseData.length > 0
    ) {
      // We have superset data in Redux
      const savedExerciseData = supersetDataFromRedux.exerciseData;

      // Get IDs of exercises already in saved data
      const existingExerciseIds = new Set<string>();
      savedExerciseData.forEach((item: any) => {
        if (
          item &&
          typeof item === 'object' &&
          'type' in item &&
          item.type === 'superset'
        ) {
          item.exercises.forEach((ex: any) => {
            existingExerciseIds.add(String(ex.exercise_id || ex.id));
          });
        } else {
          existingExerciseIds.add(String(item.exercise_id || item.id));
        }
      });

      // Check if there are new exercises in Redux that aren't in saved data
      const newExercises =
        exercises?.filter(
          (ex: any) =>
            !existingExerciseIds.has(String(ex.exercise_id || ex.id)),
        ) || [];

      if (newExercises.length > 0) {
        // Merge new exercises with saved superset data
        const mergedData = [...savedExerciseData, ...newExercises];
        setExerciseData(mergedData);

        // Update Redux with merged data
        dispatch(
          setSupersetData({
            workoutPlanId: Number(programId),
            workoutId: (day[0] as any)?.workout_id,
            exerciseData: mergedData,
          }),
        );
      } else {
        // No new exercises, just restore saved data
        setExerciseData(savedExerciseData);
      }

      hasInitialized.current = true;
      prevExercisesLength.current = exercises?.length || 0;
    } else {
      hasInitialized.current = true;
    }
  }, [supersetDataFromRedux, exercises]);

  // Sync exerciseData with exercises from Redux ONLY when there's no superset data
  useEffect(() => {
    if (!exercises || exercises.length === 0) return;

    // If we have superset data in Redux, skip this sync entirely
    // The restore/merge effect above handles everything
    if (
      supersetDataFromRedux?.exerciseData &&
      supersetDataFromRedux.exerciseData.length > 0
    ) {
      return;
    }

    // Only run this for workouts WITHOUT supersets
    // Just use exercises from Redux directly

    setExerciseData(exercises);
  }, [exercises, supersetDataFromRedux]);

  // Moved fadeAnim to parent since it's used in handleDeleteSelected
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  // Moved handlers to parent
  const handleExercisePress = (item: any) => {
    setShowExerciseDetail(true);
    setSelectedExerciseDetails(item);
  };

  const handleLongExercisePress = (exerciseId: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const handleCancelSelection = () => {
    setSelectedExercises([]); // clear all selected items
  };

  useFocusEffect(
    useCallback(() => {
      // Optional: keep selection while screen is active
      return () => {
        // When screen loses focus → clear selection
        setSelectedExercises([]);
      };
    }, []),
  );

  const handleDeleteSelected = () => {
    if (selectedExercises.length === 0) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      const exerciseIds = selectedExercises.map(Number);

      try {
        // Delete exercises globally without plan/day/group
        dispatch(deleteExercisesByIds({exerciseIds}));

        // Update local state if needed
        setDayState((prev: any) =>
          prev.map((dayItem: any) => ({
            ...dayItem,
            exercises: dayItem.exercises
              .map((exItem: any) => ({
                ...exItem,
                workout_exercises: exItem.workout_exercises.filter(
                  (wEx: any) =>
                    !exerciseIds.includes(wEx.exercise_id || wEx.id),
                ),
              }))
              .filter((exItem: any) => exItem.workout_exercises.length > 0),
          })),
        );

        // Also update exerciseData to remove deleted exercises from supersets
        setExerciseData(prev => {
          const updatedData = prev
            .map(item => {
              // If it's a superset, filter out deleted exercises
              if (
                item &&
                typeof item === 'object' &&
                'type' in item &&
                item.type === 'superset'
              ) {
                const updatedExercises = (item as Superset).exercises.filter(
                  (ex: any) =>
                    !selectedExercises.includes(ex.exercise_id || ex.id),
                );
                // If superset has less than 2 exercises after deletion, remove the superset
                if (updatedExercises.length < 2) {
                  return updatedExercises; // Return individual exercises
                }
                return {...item, exercises: updatedExercises} as Superset;
              }
              // If it's a regular exercise, check if it should be deleted
              const exerciseId = (item as any).exercise_id || (item as any).id;
              if (selectedExercises.includes(exerciseId)) {
                return null; // Mark for deletion
              }
              return item;
            })
            .flat() // Flatten in case we converted superset to individual exercises
            .filter(item => item !== null) as ExerciseListItem[];

          // Save updated data to Redux

          dispatch(
            setSupersetData({
              workoutPlanId: Number(programId),
              workoutId: (day[0] as any)?.workout_id,
              exerciseData: updatedData,
            }),
          );

          return updatedData;
        });

        setSelectedExercises([]);
        fadeAnim.setValue(1);
      } catch (error) {
        Alert.alert('Error', 'Failed to delete exercises');
        fadeAnim.setValue(1);
      }
    });
  };

  const handleClickSuperSet = async () => {
    if (selectedExercises.length <= 1) return;

    // Get all exercises from the exercise catalog
    const allExercises = exercisesData?.exerciseData || [];

    // Use exerciseData if it has supersets, otherwise use exercises
    const currentData = exerciseData.some(
      item =>
        item &&
        typeof item === 'object' &&
        'type' in item &&
        item.type === 'superset',
    )
      ? exerciseData
      : exercises;

    const selectedItems = currentData.filter(item =>
      item && 'type' in item && item.type === 'superset'
        ? (item as Superset).exercises.some(ex =>
            selectedExercises.includes(ex.exercise_id || ex.id),
          )
        : selectedExercises.includes(
            (item as any).exercise_id || (item as any).id,
          ),
    );

    const exercisesToGroup: Exercise[] = [];
    selectedItems.forEach(item => {
      if (item && 'type' in item && item.type === 'superset') {
        exercisesToGroup.push(...(item as Superset).exercises);
      } else {
        // Get full exercise details from catalog
        const exerciseId = (item as any).exercise_id || (item as any).id;
        const fullExercise = allExercises.find(
          (ex: any) => Number(ex.exercise_id || ex.id) === Number(exerciseId),
        );
        if (fullExercise) {
          exercisesToGroup.push({
            ...fullExercise,
            exerciseSettings: item,
          } as Exercise);
        } else {
          exercisesToGroup.push(item as Exercise);
        }
      }
    });

    const remainingItems = currentData.filter(item =>
      item && 'type' in item && item.type === 'superset'
        ? !(item as Superset).exercises.every(ex =>
            selectedExercises.includes(ex.exercise_id || ex.id),
          )
        : !selectedExercises.includes(
            (item as any).exercise_id || (item as any).id,
          ),
    );

    const newSuperset: Superset = {
      type: 'superset',
      exercises: exercisesToGroup,
    };

    const newExerciseData = [newSuperset, ...remainingItems];
    setExerciseData(newExerciseData);
    setSelectedExercises([]);

    // Save superset structure to Redux

    dispatch(
      setSupersetData({
        workoutPlanId: Number(programId),
        workoutId: (day[0] as any)?.workout_id,
        exerciseData: newExerciseData,
      }),
    );
  };

  const handleSupersetPress = (superset: Superset) => {
    setSelectedSuperset(superset);
    setIsSupersetSelected(true);
  };

  const handleCloseSupersetView = () => {
    setSelectedSuperset(null);
    setIsSupersetSelected(false);
  };

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        {tabData.map(tab => (
          <Pressable
            key={tab.value}
            onPress={() => setActiveTab(tab.value)}
            style={[
              styles.tabButton,
              {
                backgroundColor:
                  activeTab === tab.value ? COLORS.yellow : 'transparent',
              },
            ]}>
            <CustomText fontSize={14} fontFamily="medium">
              {tab.label}
            </CustomText>
          </Pressable>
        ))}
      </View>
    );
  };

  // Convert timing like 5.08 -> 5 minutes, 8 seconds
  const parseTiming = (value: number | string | null | undefined): number => {
    if (!value) return 0;

    const str = value.toString();
    const [minutesStr, secondsStr] = str.split('.');
    const minutes = parseInt(minutesStr, 10) || 0;
    const seconds = parseInt(secondsStr || '0', 10) || 0;

    return minutes * 60 + seconds; // total seconds
  };

  const calculateTotalWorkoutTime = (day: any[]) => {
    if (!day || day.length === 0) return 0;

    const totalSeconds = day.reduce((dayAcc, dayItem) => {
      const exerciseTotal = dayItem.exercises?.reduce(
        (acc: number, ex: any) => {
          const innerTotal = ex.workout_exercises?.reduce(
            (innerAcc: number, wEx: any) => {
              const warmup = parseTiming(wEx.timing_warmup);
              const workset = parseTiming(wEx.timing_workset);
              const finish = parseTiming(wEx.timing_finish);

              return innerAcc + warmup + workset + finish;
            },
            0,
          );

          return acc + innerTotal;
        },
        0,
      );

      return dayAcc + exerciseTotal;
    }, 0);

    return totalSeconds;
  };

  // Format seconds into hh:mm:ss
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // If you want always hh:mm:ss
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  const {totalSeconds, formatted} = useMemo(() => {
    const total = calculateTotalWorkoutTime(day);
    return {totalSeconds: total, formatted: formatTime(total)};
  }, [day]);

  const renderMainView = () => {
    switch (activeTab) {
      case 1:
        return showExerciseDetail ? (
          <ExerciseDetails
            exerciseData={selectedExerciseDetails}
            showAddSetUi={showAddSetUi}
            setShowAddSetUi={setShowAddSetUi}
            exerciseWithSetData={exerciseWithSetData}
            setexerciseWithSetData={setexerciseWithSetData}
            dayData={day}
            planDayData={programDetails}
            draftWorkoutData={draftWorkout}
            hideButton={isFrom}
            ScheduleHistoryData={ScheduleHistoryData}
            setsData={sets}
            setIsLoggingSet={setIsLoggingSet}
            isLoggingSet={isLoggingSet}
          />
        ) : (
          <ExerciseView
            data={exercises}
            isSupersetSelected={isSupersetSelected}
            onPressSuperset={handleSupersetPress}
            onCloseSupersetView={handleCloseSupersetView}
            selectedSuperset={selectedSuperset}
            selectedExercises={selectedExercises}
            exerciseData={exerciseData}
            setExerciseData={setExerciseData}
            handleExercisePress={handleExercisePress}
            handleLongExercisePress={handleLongExercisePress}
            handleCancelSelection={handleCancelSelection}
            handleDeleteSelected={handleDeleteSelected}
            handleClickSuperSet={handleClickSuperSet}
            fadeAnim={fadeAnim}
            programId={programId}
            currentDayIndex={0}
            dayData={day}
            completedExercises={completedExercises}
            hideButton={isFrom}
          />
        );
      case 2:
        return (
          <HistoryView
            planDayData={programDetails}
            dayWorkoutData={day}
            ScheduleHistoryData={ScheduleHistoryData}
          />
        );
      case 3:
        return <DetailsView data={programDetails} />;
      case 4:
        return <CoachCenterView planId={programId} />;
      default:
        return null;
    }
  };

  const exists = useMemo(() => {
    if (!selectedExerciseDetails?.id || !isFinish?.length) {
      return false;
    }

    const targetId = String(selectedExerciseDetails.id);

    return isFinish.some((workout: any) =>
      workout.exercises?.some((ex: any) => String(ex.exercise_id) === targetId),
    );
  }, [selectedExerciseDetails?.id, isFinish]);

  // Check if there are any valid exercises with sets to enable/disable Finish Workout button
  const hasValidExercisesWithSets = useMemo(() => {
    if (
      !draftWorkout ||
      !Array.isArray(draftWorkout) ||
      draftWorkout.length === 0
    )
      return false;

    return draftWorkout.some(workoutItem => {
      // Check if workoutItem and exercises exist
      if (
        !workoutItem ||
        !workoutItem.exercises ||
        !Array.isArray(workoutItem.exercises)
      ) {
        return false;
      }

      return workoutItem.exercises.some(exerciseItem => {
        // Check if exerciseItem exists
        if (!exerciseItem) return false;

        // Check if exercise has valid exercise_id
        if (!exerciseItem.exercise_id) return false;

        // Check if exercise has sets
        if (
          !exerciseItem.setsData ||
          !Array.isArray(exerciseItem.setsData) ||
          exerciseItem.setsData.length === 0
        )
          return false;

        // Check if at least one set has valid reps and weight/distance/time
        return exerciseItem.setsData.some(setItem => {
          if (!setItem) return false;

          return (
            setItem.reps !== undefined &&
            setItem.reps !== null &&
            setItem.reps !== '' &&
            (setItem.weight !== undefined ||
              setItem.distance !== undefined ||
              setItem.time !== undefined)
          );
        });
      });
    });
  }, [draftWorkout]);

  // Check if the selected superset has any exercises with sets
  const hasSupersetExercisesWithSets = useMemo(() => {
    if (!selectedSuperset || !selectedSuperset.exercises) return false;

    return selectedSuperset.exercises.some((exercise: any) => {
      const exerciseId = String(exercise.exercise_id || exercise.id);

      const hasExerciseWithSets = draftWorkout.some(workout =>
        workout.exercises.some(
          ex =>
            String(ex.exercise_id) === exerciseId &&
            ex.setsData &&
            ex.setsData.length > 0,
        ),
      );

      return hasExerciseWithSets;
    });
  }, [selectedSuperset, draftWorkout]);

  const renderBottomSection = () => {
    return (
      <View style={{alignItems: 'center', gap: verticalScale(10)}}>
        {showExerciseDetail ? (
          showAddSetUi ? (
            <PrimaryButton
              title="FINISH EXERCISE"
              onPress={() => {
                setShowAddSetUi(false);
              }}
              backgroundColor={'#36DCC04D'}
            />
          ) : (
            <PrimaryButton
              title="FINISH EXERCISE"
              onPress={() => {
                if (selectedExerciseDetails) {
                  // Use exercise_id (numeric) instead of id (MongoDB string)
                  const exerciseId = String(
                    selectedExerciseDetails.exercise_id ||
                      selectedExerciseDetails.id,
                  );
                  dispatch(pauseExerciseTimer(exerciseId));
                  dispatch(setCurrentCompletedExerciseIds(exerciseId));
                  setShowExerciseDetail(false);
                  setShowAddSetUi(false);
                  setIsLoggingSet(false);
                }
              }}
              backgroundColor={COLORS.teal}
            />
          )
        ) : isSupersetSelected ? (
          <PrimaryButton
            title="FINISH SUPERSET"
            onPress={() => {
              if (selectedSuperset) {
                // Mark all exercises in the superset as completed
                selectedSuperset.exercises.forEach((exercise: any) => {
                  const exerciseId = String(
                    exercise.exercise_id || exercise.id,
                  );
                  // Check if this exercise has sets in draftWorkout
                  const hasExerciseWithSets = draftWorkout.some(workout =>
                    workout.exercises.some(
                      ex =>
                        String(ex.exercise_id) === exerciseId &&
                        ex.setsData &&
                        ex.setsData.length > 0,
                    ),
                  );

                  // Only mark as completed if it has sets
                  if (
                    hasExerciseWithSets &&
                    !completedExercises.includes(exerciseId)
                  ) {
                    dispatch(setCurrentCompletedExerciseIds(exerciseId));
                  }
                });
              }
              // Close superset view
              setIsSupersetSelected(false);
              setSelectedSuperset(null);
            }}
            backgroundColor={COLORS.skyBlue}
            // disabled={!hasSupersetExercisesWithSets}
          />
        ) : (
          <PrimaryButton
            title="FINISH WORKOUT"
            onPress={LOG_WORKOUT}
            backgroundColor={COLORS.crimson}
            // disabled={!hasValidExercisesWithSets}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: horizontalScale(10),
            width: wp(90),
          }}>
          <View
            style={{
              borderWidth: 1,
              borderRadius: verticalScale(100),
              borderColor: COLORS.white,
              flex: 1,
              alignItems: 'center',
              paddingVertical: verticalScale(5),
              justifyContent: 'space-between',
              gap: verticalScale(10),
            }}>
            <CustomText fontFamily="bold">Workout</CustomText>
            <CustomText fontSize={15} color={COLORS.white}>
              {formatTime(elapsedSeconds)}
            </CustomText>
          </View>
          {showExerciseDetail && selectedExerciseDetails ? (
            <View
              style={{
                borderWidth: 1,
                borderRadius: verticalScale(100),
                borderColor: COLORS.white,
                flex: 1,
                alignItems: 'center',
                paddingVertical: verticalScale(5),
                justifyContent: 'space-between',
                gap: verticalScale(10),
              }}>
              <CustomText fontFamily="bold">Exercise</CustomText>
              <CustomText fontSize={15} color={COLORS.white}>
                {(() => {
                  const currentExerciseId = String(
                    selectedExerciseDetails.exercise_id ||
                      selectedExerciseDetails.exerciseSettings?.exercise_id ||
                      selectedExerciseDetails.id,
                  );

                  const timer = exerciseTimeInSeconds.find(
                    (t: any) => String(t.exerciseId) === currentExerciseId,
                  );

                  return formatTime(timer?.timeInSeconds || 0);
                })()}
              </CustomText>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const getTagsData = useMemo(
    () => programDetails?.allData?.content.tags,
    [programDetails],
  );

  const mapWorkoutResponseToDay = useCallback((response: any) => {
    // Exercises is now an array of groups (superset or regular)
    const exercisesArray = response.content.Exercises || [];

    // Flatten all exercises from all groups
    const allExercises: any[] = [];

    exercisesArray.forEach((group: any) => {
      // Each group has a 'content' array with exercises
      const groupExercises = group.content || [];

      groupExercises.forEach((ex: any) => {
        const totalSets = ex.Set?.length || 0;
        const totalReps =
          ex.Set?.reduce((acc: number, s: any) => acc + (s.reps || 0), 0) || 0;
        const totalWeight =
          ex.Set?.reduce(
            (acc: number, s: any) => acc + (s.weight || 0) * (s.reps || 0),
            0,
          ) || 0;
        const totalDistance =
          ex.Set?.reduce((acc: number, s: any) => acc + (s.distance || 0), 0) ||
          0;

        allExercises.push({
          exercise_id: String(ex.Exercise_id), // Ensure it's a string for matching
          sets: ex.Set || [],
          recommendedSets: totalSets,
          recommendedReps: totalReps,
          name: `Exercise ${ex.Exercise_id}`, // fallback if no name
          is_weight: totalWeight > 0,
          totalWeight,
          totalDistance,
          images: [],
        });
      });
    });

    return [
      {
        exercises: allExercises,
        focus: [], // fill with muscles if available
        duration: response.content.duration,
      },
    ];
  }, []);

  //  Find Last Schedule Data
  const lastSchedule = useMemo(
    () =>
      scheduleData
        ?.filter(
          item =>
            item.type === 'workout' &&
            item.content.plan_id === programDetails?.allData?.plan_id &&
            item.content.Workout_id === day[0]?.workout_id,
        )
        .sort(
          (a, b) =>
            new Date(b.schedule_at).getTime() -
            new Date(a.schedule_at).getTime(),
        )[0],
    [scheduleData, programDetails, day],
  );

  // BuildWorkoutResultData
  const buildWorkoutResultData = useCallback(
    (day: any) => {
      const totalSeconds = day[0]?.duration || 0;
      const exercises = day[0]?.exercises || [];

      // No need to filter by workout_id since mapWorkoutResponseToDay already gives us the right exercises
      const filteredExercises = exercises;

      // --- Previous Schedule Data (if exists) ---
      // Handle new structure: Exercises is an array of groups
      let prevExercises: any[] = [];
      if (
        lastSchedule?.content?.Exercises &&
        Array.isArray(lastSchedule.content.Exercises)
      ) {
        // Flatten all exercises from all groups in previous schedule
        lastSchedule.content.Exercises.forEach((group: any) => {
          if (group.content && Array.isArray(group.content)) {
            prevExercises.push(...group.content);
          }
        });
      }
      const prevDuration = lastSchedule?.content?.duration || 0;

      // Collect exercise IDs from the workout day
      const getExerciseIDS = filteredExercises.map(
        (item: any) => item.exercise_id,
      );

      // Match them with exercise metadata (for names, muscles, etc.)
      const findTargetedMuscle = exercisesData.exerciseData?.filter(item =>
        getExerciseIDS.includes(String(item.exercise_id)),
      );

      // --- Overall Summary ---
      const overallSummary = {
        Duration: {
          current: formatTime(totalSeconds),
          previous: formatTime(prevDuration),
        },
        Volume: {
          current: `${filteredExercises.length} exercises`,
          previous: `${prevExercises.length} exercises`,
        },
        Effort: {
          current: filteredExercises.length,
          previous: prevExercises.length,
        },
        Distance: {
          current:
            filteredExercises.reduce(
              (acc: any, ex: any) =>
                acc +
                ex.sets.reduce(
                  (sAcc: number, s: any) => sAcc + (s.distance || 0),
                  0,
                ),
              0,
            ) + ' m',
          previous:
            prevExercises.reduce(
              (acc: any, ex: any) =>
                acc +
                ex.Set.reduce(
                  (sAcc: number, s: any) => sAcc + (s.distance || 0),
                  0,
                ),
              0,
            ) + ' m',
        },
        Sets: {
          current: filteredExercises.reduce(
            (acc: any, ex: any) => acc + (ex.recommendedSets || 0),
            0,
          ),
          previous: prevExercises.reduce(
            (acc: any, ex: any) => acc + (ex.Set?.length || 0),
            0,
          ),
        },
        Reps: {
          current: filteredExercises.reduce(
            (acc: any, ex: any) => acc + (ex.recommendedReps || 0),
            0,
          ),
          previous: prevExercises.reduce(
            (acc: any, ex: any) =>
              acc +
              ex.Set.reduce((sAcc: number, s: any) => sAcc + (s.reps || 0), 0),
            0,
          ),
        },
      };

      // --- Best Records (dynamic) ---
      // Find exercise with max total weight lifted
      const bestWeightExercise = filteredExercises.reduce(
        (best: any, ex: any) => {
          const totalWeight = ex.sets.reduce(
            (acc: number, s: any) => acc + (s.weight || 0) * (s.reps || 0),
            0,
          );
          return totalWeight > (best.totalWeight || 0)
            ? {...ex, totalWeight}
            : best;
        },
        {},
      );

      // Find exercise with max reps achieved
      const bestRepsExercise = filteredExercises.reduce(
        (best: any, ex: any) => {
          const totalReps = ex.sets.reduce(
            (acc: number, s: any) => acc + (s.reps || 0),
            0,
          );
          return totalReps > (best.totalReps || 0) ? {...ex, totalReps} : best;
        },
        {},
      );

      const bestRecords = {
        Best_Total_Weight: {
          exerciseName:
            findTargetedMuscle?.find(
              item =>
                String(item.exercise_id) ===
                String(bestWeightExercise.exercise_id),
            )?.name || 'N/A',
          details: `${bestWeightExercise?.recommendedSets || 0} Sets × ${
            bestWeightExercise?.recommendedReps || 0
          } Reps`,
          weightAchieved: bestWeightExercise.totalWeight
            ? `${bestWeightExercise.totalWeight} kg`
            : '-',
          image:
            findTargetedMuscle?.find(
              item =>
                String(item.exercise_id) ===
                String(bestWeightExercise.exercise_id),
            )?.images_urls?.[0] || '',
        },
        Best_Reps: {
          exerciseName:
            findTargetedMuscle?.find(
              item =>
                String(item.exercise_id) ===
                String(bestRepsExercise.exercise_id),
            )?.name || 'N/A',
          details: `${bestRepsExercise?.recommendedSets || 0} Sets × ${
            bestRepsExercise?.recommendedReps || 0
          } Reps`,
          repsAchieved: bestRepsExercise.totalReps || 0,
          image:
            findTargetedMuscle?.find(
              item =>
                String(item.exercise_id) ===
                String(bestRepsExercise.exercise_id),
            )?.images_urls?.[0] || '',
        },
      };

      // --- Targeted Muscles ---
      const targetedMuscles =
        findTargetedMuscle?.flatMap(item => [
          item.main_muscle,
          ...(item.secondary_muscles || []),
        ]) || [];

      return {
        overallSummary,
        bestRecords,
        targetedMuscles,
      };
    },
    [lastSchedule, exercisesData],
  );

  const LOG_WORKOUT = async () => {
    // === Pause currently active exercise if one is selected/open ===

    // Stop timer only once
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const now = new Date(); // current date
    const scheduleDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      ),
    );

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDateTime = (date: Date): string => {
      const pad = (num: number) => num.toString().padStart(2, '0');
      return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())} ` +
        `${pad(date.getHours())}:` +
        `${pad(date.getMinutes())}:` +
        `${pad(date.getSeconds())}`
      );
    };

    const getDate = new Date();

    if (timerRef.current) clearInterval(timerRef.current);

    const remainingDuration = Math.max(totalSeconds - elapsedSeconds, 0);

    // Helper function to create exercise object from exerciseItem
    const createExerciseObject = (exerciseItem: any) => {
      const exerciseObj = exercisesData.exerciseData?.find(
        ex => ex.id === exerciseItem.exercise_id,
      );

      const getExerciseTime = exerciseTimeInSeconds.find(
        ex => ex.exerciseId === exerciseItem.exercise_id,
      );

      // Flatten sets and drop sets into a single array
      const allSets: any[] = [];

      exerciseItem.setsData
        .filter((setItem: any) => {
          // Filter out sets with undefined/null reps
          return (
            setItem.reps !== undefined &&
            setItem.reps !== null &&
            setItem.reps !== ''
          );
        })
        .forEach((setItem: any) => {
          // Add the main set as 'regular'
          allSets.push({
            set_id: setItem.count,
            weight: Number(setItem.weight?.replace('kg', '')) || 0,
            reps: Number(setItem.reps) || 0,
            distance: Number(setItem.distance?.replace('m', '')) || 0,
            time: Number(setItem.time?.replace('s', '')) || 0,
            weight_type: 'kg',
            difficulty: setItem.difficulty,
            rest_time: 12,
            log_time: setItem.logTime,
            type: 'regular',
          });

          // Add drop sets as individual sets with type 'dropset'
          if (setItem.dropSets && setItem.dropSets.length > 0) {
            setItem.dropSets.forEach((dropSet: any) => {
              allSets.push({
                set_id: dropSet.count,
                weight: Number(dropSet.weight?.replace('kg', '')) || 0,
                reps: Number(dropSet.reps) || 0,
                distance: Number(dropSet.distance?.replace('m', '')) || 0,
                time: Number(dropSet.time?.replace('s', '')) || 0,
                weight_type: 'kg',
                difficulty: dropSet.difficulty,
                rest_time: 12,
                log_time: dropSet.logTime,
                type: 'dropset',
              });
            });
          }
        });

      return {
        Exercise_id: exerciseObj?.exercise_id || exerciseItem.exercise_id,
        duration: getExerciseTime?.timeInSeconds,
        comments: '',
        Set: allSets,
      };
    };

    // Helper function to check if exercise has valid sets
    const hasValidSets = (exerciseItem: any) => {
      if (!exerciseItem.exercise_id) return false;
      if (!exerciseItem.setsData || exerciseItem.setsData.length === 0)
        return false;

      return exerciseItem.setsData.some((setItem: any) => {
        return (
          setItem.reps !== undefined &&
          setItem.reps !== null &&
          setItem.reps !== '' &&
          (setItem.weight !== undefined ||
            setItem.distance !== undefined ||
            setItem.time !== undefined)
        );
      });
    };

    // Build Exercises array based on exerciseData structure
    const exercisesArray: any[] = [];

    // Process exerciseData to create exercise groups
    exerciseData.forEach((item: any, index: number) => {
      // Check if it's a superset
      if (
        item &&
        typeof item === 'object' &&
        'type' in item &&
        item.type === 'superset'
      ) {
        // It's a superset - create a superset group
        const supersetExercises: any[] = [];

        item.exercises.forEach((exercise: any) => {
          const exerciseId = String(exercise.exercise_id || exercise.id);

          // Find the exercise data from draftWorkout
          const exerciseItem = draftWorkout
            .flatMap(workoutItem => workoutItem.exercises)
            .find(ex => String(ex.exercise_id) === exerciseId);

          if (exerciseItem) {
          }

          if (exerciseItem && hasValidSets(exerciseItem)) {
            const exerciseObj = createExerciseObject(exerciseItem);
            if (exerciseObj.Set.length > 0) {
              supersetExercises.push(exerciseObj);
            }
          } else {
          }
        });

        // Only add superset if it has exercises
        if (supersetExercises.length > 0) {
          exercisesArray.push({
            finish_time: formatDateTime(getDate),
            type: 'superset',
            content: supersetExercises,
          });
        }
      } else {
        // It's a regular exercise - create a regular group
        const exerciseId = String(item.exercise_id || item.id);

        // Find the exercise data from draftWorkout
        const exerciseItem = draftWorkout
          .flatMap(workoutItem => workoutItem.exercises)
          .find(ex => String(ex.exercise_id) === exerciseId);

        if (exerciseItem) {
        }

        if (exerciseItem && hasValidSets(exerciseItem)) {
          const exerciseObj = createExerciseObject(exerciseItem);
          if (exerciseObj.Set.length > 0) {
            exercisesArray.push({
              finish_time: formatDateTime(getDate),
              type: 'regular',
              content: [exerciseObj],
            });
          }
        } else {
        }
      }
    });

    const data = {
      type: 'workout',
      status: 'done',
      schedule_at: scheduleDate.toISOString(),
      user_id: userData?.user_id,
      finish_date_time: scheduleDate.toISOString(),
      content: {
        plan_id: programId,
        Workout_id: day[0]?.workout_id,
        duration: remainingDuration,
        // duration: elapsedSeconds,
        comments: day[0]?.comments || null,
        Exercises: exercisesArray,
      },
    };

    try {
      const response = await postData<any>(ENDPOINTS.createSchedule, {data});
      if (response.data.data) {
        dispatch(addSchedule(response.data.data));

        workoutTimer.stop();

        // Mark workout as done and clear Redux states
        dispatch(setWorkoutProgress('done'));
        dispatch(resetWorkout());
        dispatch(clearDraftWorkout());
        dispatch(setWorkoutTime(0));

        // Clear superset data from Redux
        dispatch(
          clearSupersetData({
            workoutPlanId: Number(programId),
            workoutId: (day[0] as any)?.workout_id,
          }),
        );

        // Clear all local states to reset workout to default
        setSelectedExercises([]);
        setExerciseData([]);
        setActiveTab(1);
        setIsSupersetSelected(false);
        setSelectedSuperset(null);
        setShowExerciseDetail(false);
        setSelectedExerciseDetails(null);
        setShowAddSetUi(false);
        setExerciseLog([]);
        setScheduleMap({});
        setElapsedSeconds(0);
        dispatch(resetExerciseTimers());
        setexerciseWithSetData([]);
        dispatch(clearStartCurrentExercise());
        setShowAddSetUi(true);
        setIsLoggingSet(false);
        dispatch(clearAllExerciseTimers());

        const resultDay = mapWorkoutResponseToDay(response.data.data);
        const workoutResultData = buildWorkoutResultData(resultDay);

        // Use replace instead of navigate to properly unmount this screen
        // and prevent "addViewAt failed" error
        // Add a small delay to ensure all state updates are complete
        setTimeout(() => {
          navigation.replace('workoutResult', {
            workoutData: workoutResultData,
          });
        }, 100);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (showAddSetUi) {
          setShowAddSetUi(false);
          return true;
        } else if (showExerciseDetail) {
          setShowExerciseDetail(false);
          return true;
        } else if (isSupersetSelected) {
          handleCloseSupersetView();
          return true;
        } else if (isLoggingSet) {
          setIsLoggingSet(false);
          return true;
        } else {
          navigation.goBack();
          return true;
        }
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      // setIsLoggingSet(false);

      return () => {
        backHandler.remove();
      };
    }, [
      showAddSetUi,
      showExerciseDetail,
      isLoggingSet,
      isSupersetSelected,
      navigation,
    ]),
  );

  return (
    <View style={styles.main}>
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={{
            uri:
              programDetails?.allData?.image_url ||
              'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          }}
          style={styles.coverImage}
          imageStyle={styles.coverImageStyle}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', '#1F1A16']}
            style={styles.gradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}>
            <View style={styles.headerContainer}>
              <CustomIcon
                onPress={() => {
                  showAddSetUi
                    ? setShowAddSetUi(false)
                    : showExerciseDetail
                    ? setShowExerciseDetail(false)
                    : isSupersetSelected
                    ? handleCloseSupersetView()
                    : navigation.goBack();
                }}
                Icon={ICONS.BackArrow}
              />
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  gap: verticalScale(10),
                }}>
                {!showExerciseDetail && (
                  <CustomText fontFamily="bold">
                    {day[0].name || 'unkfnown'}
                  </CustomText>
                )}
                {!showExerciseDetail && (
                  <>
                    <View style={styles.tagContainer}>
                      {getTagsData &&
                        getTagsData.map((tag: string, index: number) => (
                          <CustomText
                            key={index}
                            style={styles.tag}
                            fontSize={10}
                            color={COLORS.whiteTail}>
                            {tag}
                          </CustomText>
                        ))}
                      <CustomText
                        style={styles.tag}
                        fontSize={10}
                        color={COLORS.whiteTail}>
                        {programDetails?.allData?.content.location}
                      </CustomText>
                      <CustomText
                        style={styles.tag}
                        fontSize={10}
                        color={COLORS.whiteTail}>
                        {`${programDetails?.allData?.content?.days_per_week} days`}
                      </CustomText>
                      <CustomText
                        style={styles.tag}
                        fontSize={10}
                        color={COLORS.whiteTail}>
                        {programDetails?.allData?.content?.difficulty}
                      </CustomText>
                    </View>
                  </>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
        {!showExerciseDetail && renderTabs()}
        <View style={{flex: 1, paddingBottom: verticalScale(10)}}>
          {renderMainView()}
        </View>

        {!isFrom && renderBottomSection()}
      </SafeAreaView>
    </View>
  );
};

export default WorkoutProgramDetails;

const styles = StyleSheet.create({
  main: {
    backgroundColor: COLORS.darkBrown,
    flex: 1,
    paddingBottom: verticalScale(5),
  },
  safeArea: {flex: 1},
  coverImage: {
    height: hp(13),
    justifyContent: 'flex-end',
  },
  coverImageStyle: {
    borderRadius: 10,
    resizeMode: 'cover',
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: verticalScale(10),
    paddingTop: verticalScale(20),
    paddingHorizontal: verticalScale(10),
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
    paddingHorizontal: verticalScale(10),
  },
  tag: {
    backgroundColor: COLORS.brown,
    paddingVertical: verticalScale(3),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: verticalScale(20),
  },
  tabButton: {
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: 10,
  },
});
