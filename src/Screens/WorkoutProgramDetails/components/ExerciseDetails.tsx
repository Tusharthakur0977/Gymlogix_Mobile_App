import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ICONS from '../../../Assets/Icons';
import IMAGES from '../../../Assets/Images';
import SkeletonBack from '../../../Components/Cards/SkeletonBack';
import SkeletonFront from '../../../Components/Cards/SkeletonFront';
import CustomIcon from '../../../Components/CustomIcon';
import PickerComponent from '../../../Components/CustomPIcker';
import {CustomText} from '../../../Components/CustomText';
import PrimaryButton from '../../../Components/PrimaryButton';
import {
  ExerciseLog,
  SetData,
  setDraftWorkout,
  updateExercise,
  incrementExerciseTimer,
  setStartCurrentExercise,
  startExerciseTimer,
} from '../../../Redux/slices/LogWorkoutSlice';
import {updateIsFinish} from '../../../Redux/slices/workoutDataSlice';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import {SetDetail} from '../../../Seeds/TrainingPLans';
import COLORS from '../../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../../Utilities/Metrics';

// Extended SetDetail interface to support drop sets
export interface ExtendedSetDetail extends SetDetail {
  dropSets?: SetDetail[];
}

const tabData = [
  {label: 'Sets', value: 1},
  {label: 'Details', value: 2},
  {label: 'History', value: 3},
];

const ExerciseDetails: FC<{
  exerciseData: any;
  dayData: any;
  planDayData: any;
  showAddSetUi: boolean;
  setShowAddSetUi: any;
  draftWorkoutData: any;
  exerciseWithSetData:
    | {
        exerciseId: string;
        setsData: ExtendedSetDetail[];
        isDropSet: boolean;
        logTime: any;
      }[]
    | null;
  setexerciseWithSetData: Dispatch<
    SetStateAction<
      | {
          exerciseId: string;
          setsData: ExtendedSetDetail[];
          isDropSet: boolean;
          logTime: any;
        }[]
      | null
    >
  >;
  hideButton: boolean;
  ScheduleHistoryData: string;
  setsData: any;
  isLoggingSet: boolean;
  setIsLoggingSet: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  exerciseData,
  showAddSetUi,
  setShowAddSetUi,
  exerciseWithSetData,
  setexerciseWithSetData,
  dayData,
  planDayData,
  draftWorkoutData,
  hideButton,
  ScheduleHistoryData,
  setsData,
  isLoggingSet,
  setIsLoggingSet,
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);
  const {scheduleData} = useAppSelector(state => state.scheduleData);
  const {draftWorkout} = useAppSelector(state => state.logWorkoutData);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null,
  );

  const {startCurrentExercise} = useAppSelector(state => state.logWorkoutData);

  const flatListRef = useRef<FlatList>(null);

  // State for managing the selected difficulty for new sets
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'Warmup' | 'Easy' | 'Medium' | 'Hard'
  >('Medium');

  const isFinish = useAppSelector(state => state.workoutData.isFinish);

  // State to store current picker values
  const [currentPickerValues, setCurrentPickerValues] = useState<{
    reps?: string;
    distance?: string;
    weight?: string;
    time?: string;
  }>({});

  useEffect(() => {
    const exerciseId = String(
      exerciseData.exercise_id ||
        exerciseData.exerciseSettings?.exercise_id ||
        exerciseData.id,
    );

    if (!exerciseId) return;

    const isThisExerciseActive =
      isLoggingSet && startCurrentExercise.includes(exerciseId);

    if (isThisExerciseActive) {
      dispatch(startExerciseTimer(exerciseId));
    }

    // do NOT pause on unmount
    return () => {};
  }, [isLoggingSet, startCurrentExercise]);

  const getFilteredDraftWorkoutData = () => {
    if (!draftWorkoutData || !Array.isArray(draftWorkoutData)) return [];

    const planId = planDayData?.allData?.plan_id;
    const workoutId = selectedWorkoutId || dayData?.[0]?.workout_id;
    const exerciseId = exerciseData?.id;

    if (!planId || !workoutId || !exerciseId) return [];

    // Filter draftWorkoutData
    const filteredData = draftWorkoutData
      .filter(
        item => item.workoutPlanId === planId && item.workoutId === workoutId,
      )
      .map(item => ({
        ...item,
        exercises: item.exercises.filter(
          (ex: any) => ex.exercise_id === exerciseId,
        ),
      }))
      .filter(item => item.exercises.length > 0); // Remove items with no matching exercises

    return filteredData;
  };

  useEffect(() => {
    if (!showAddSetUi) {
      // When we exit "Add Set" mode → scroll to latest set
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 150);
    }
  }, [showAddSetUi]);

  // Memoize filteredWorkoutData
  const filteredWorkoutData = useMemo(
    () => getFilteredDraftWorkoutData(),
    [
      draftWorkoutData, // Add other dependencies as needed
    ],
  );

  useEffect(() => {
    if (filteredWorkoutData.length > 0) {
      const updated = [...isFinish]; // Clone current isFinish from Redux

      filteredWorkoutData.forEach(newWorkout => {
        const existingWorkoutIndex = updated.findIndex(
          w => w.workoutPlanId === newWorkout.workoutPlanId,
        );

        if (existingWorkoutIndex !== -1) {
          const existingExercises =
            updated[existingWorkoutIndex].exercises || [];
          const mergedExercises = [...existingExercises];

          newWorkout.exercises.forEach((newEx: any) => {
            const exIndex = mergedExercises.findIndex(
              ex => ex.exercise_id === newEx.exercise_id,
            );

            if (exIndex !== -1) {
              mergedExercises[exIndex] = newEx;
            } else {
              mergedExercises.push(newEx);
            }
          });

          updated[existingWorkoutIndex] = {
            ...updated[existingWorkoutIndex],
            exercises: mergedExercises,
          };
        } else {
          updated.push(newWorkout);
        }
      });

      // Dispatch the updated isFinish to Redux
      dispatch(updateIsFinish(updated));
    }
  }, [filteredWorkoutData]);

  const getScheduleHistory: any = scheduleData?.filter(item => {
    if (
      item.type !== 'workout' ||
      item.content.plan_id !== planDayData.allData.plan_id ||
      item.content.Workout_id !== dayData[0].workout_id
    ) {
      return false;
    }

    const exercises = item.content.Exercises;
    const targetId = exerciseData.exercise_id ?? exerciseData.id;

    // Handle new structure: Exercises is an array of groups
    if (Array.isArray(exercises)) {
      // New structure: flatten all exercises from all groups
      const allExercises = exercises.flatMap(
        (group: any) => group?.content || [],
      );

      return allExercises.some((ex: any) => {
        return targetId != null && Number(ex.Exercise_id) === Number(targetId);
      });
    } else if (typeof exercises === 'object' && exercises?.content) {
      // Old structure fallback: object with content
      return exercises.content.some((ex: any) => {
        return targetId != null && Number(ex.Exercise_id) === Number(targetId);
      });
    }
    return false;
  });

  const muscleData = useMemo(() => {
    const main = exerciseData?.targetMuscles || [];
    const secondary =
      exerciseData?.secondary_muscles || exerciseData?.secondaryMuscle || [];
    const all = [...main, ...secondary].filter(Boolean);

    if (all.length === 0) return [];

    const count: Record<string, number> = {};
    all.forEach(m => {
      const key = m.toString().toLowerCase().trim();
      count[key] = (count[key] || 0) + 1;
    });

    return Object.keys(count)
      .map(name => ({
        name,
        percentage: Math.round((count[name] / all.length) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [
    exerciseData?.targetMuscles,
    exerciseData?.secondary_muscles,
    exerciseData?.secondaryMuscle,
  ]);

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
    lowerBack: IMAGES.glutes,
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

  const renderDetailsTab = () => {
    const muscleMap: Record<string, string> = {
      glutes: 'glutes',
      'lower back': 'erector spinae', // 👈 map to the actual supported muscle name
      // add more mappings if needed
    };

    const selectedMuscles = exerciseData?.secondary_muscles?.length
      ? exerciseData.secondary_muscles
          .map(
            (m: string) =>
              muscleMap[m.toLowerCase().trim()] || m.toLowerCase().trim(),
          )
          .filter(Boolean)
      : exerciseData?.secondaryMuscle
          ?.map(
            (m: string) =>
              muscleMap[m.toLowerCase().trim()] || m.toLowerCase().trim(),
          )
          .filter(Boolean);

    const getExerciseImageUri = (exerciseData: any) => {
      if (
        Array.isArray(exerciseData?.images_urls) &&
        exerciseData.images_urls.length > 0
      ) {
        return exerciseData.images_urls[0];
      }

      if (
        Array.isArray(exerciseData?.images) &&
        exerciseData.images.length > 0
      ) {
        const firstImage = exerciseData.images[0];
        if (typeof firstImage === 'string') return firstImage;
        if (firstImage?.uri) return firstImage.uri;
      }

      return 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop';
    };

    const imageUri = getExerciseImageUri(exerciseData);

    const getMainExerciseImage = (exerciseData: any) => {
      if (
        Array.isArray(exerciseData?.images_urls) &&
        exerciseData.images_urls.length > 0
      ) {
        return exerciseData.images_urls[0];
      }

      if (
        Array.isArray(exerciseData?.images) &&
        exerciseData.images.length > 0
      ) {
        const firstImage = exerciseData.images[0];
        if (typeof firstImage === 'string') return firstImage;
        if (firstImage?.uri) return firstImage.uri;
      }

      return 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop';
    };

    const mainImageUri = getMainExerciseImage(exerciseData);

    return (
      <ScrollView
        contentContainerStyle={{alignItems: 'center', gap: verticalScale(20)}}
        style={{
          paddingHorizontal: horizontalScale(10),
          gap: verticalScale(20),
          flex: 1,
        }}>
        <View style={styles.tagContainer}>
          <CustomText
            style={styles.tag}
            fontFamily="italicBold"
            fontSize={14}
            color={COLORS.whiteTail}>
            {exerciseData?.type}
          </CustomText>
          <CustomText
            style={styles.tag}
            fontFamily="italicBold"
            fontSize={14}
            color={COLORS.whiteTail}>
            {exerciseData?.mechanics
              ? exerciseData?.mechanics
              : exerciseData?.location}
          </CustomText>
          <CustomText
            style={styles.tag}
            fontFamily="italicBold"
            fontSize={14}
            color={COLORS.whiteTail}>
            {exerciseData?.equipment}
          </CustomText>
          <CustomText
            style={styles.tag}
            fontFamily="italicBold"
            fontSize={14}
            color={COLORS.whiteTail}>
            {exerciseData?.force}
          </CustomText>
        </View>
        <FlatList
          data={[imageUri]}
          horizontal
          contentContainerStyle={{gap: horizontalScale(10)}}
          renderItem={item => {
            return (
              <View style={{flexDirection: 'row', gap: horizontalScale(10)}}>
                <Image
                  source={{
                    uri: item.item,
                  }}
                  style={{
                    height: 120,
                    width: 120,
                    resizeMode: 'cover',
                    borderRadius: 10,
                  }}
                />
              </View>
            );
          }}
        />
        <Image
          source={{uri: mainImageUri}}
          style={{height: hp(40), width: wp(90), borderRadius: 20}}
        />

        <View
          style={{
            paddingVertical: verticalScale(15),
            borderRadius: 10,
            width: wp(90),
            gap: verticalScale(20),
          }}>
          <TouchableOpacity
            onPress={() => setShowInstructions(!showInstructions)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: horizontalScale(10),
              width: '100%',
            }}>
            <CustomText fontFamily="extraBold" fontSize={24} style={{flex: 1}}>
              Instructions
            </CustomText>
            <CustomText fontFamily="extraBold" fontSize={20}>
              {showInstructions ? '-' : '+'}{' '}
            </CustomText>
          </TouchableOpacity>
          {showInstructions && (
            <View style={{gap: verticalScale(3)}}>
              <CustomText
                fontSize={14}
                fontFamily="medium"
                color={COLORS.whiteTail}>
                {exerciseData.instruction || 'instructions'}
              </CustomText>
            </View>
          )}
        </View>

        <View
          style={{
            width: wp(95),
            borderRadius: 20,
            paddingHorizontal: horizontalScale(10),
            paddingVertical: verticalScale(20),
            alignItems: 'center',
            gap: verticalScale(30),
          }}>
          <View style={{width: '100%'}}>
            <CustomText
              fontFamily="bold"
              fontSize={24}
              style={{textAlign: 'left'}}>
              Main Muscle
            </CustomText>
          </View>
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonWrapper}>
              <View style={styles.skeletonHeader}>
                <CustomText color={COLORS.white} style={styles.skeletonLabel}>
                  Front
                </CustomText>
              </View>
              <SkeletonFront
                showLabel={false}
                width={wp(45)}
                height={verticalScale(230)}
                containerWidth={wp(45)}
                selectedMuscles={(exerciseData?.main_muscle
                  ? exerciseData?.main_muscle
                  : exerciseData?.mainMuscle
                ).toLowerCase()}
                viewBox="0 30 369 70"
                bodyChart={() => {}}
                frontMusclesData={() => {}}
              />
            </View>

            <View style={styles.skeletonWrapper}>
              <View style={styles.skeletonHeader}>
                <CustomText color={COLORS.white} style={styles.skeletonLabel}>
                  Back
                </CustomText>
              </View>
              <SkeletonBack
                showLabel={false}
                width={wp(45)}
                height={verticalScale(230)}
                containerWidth={wp(45)}
                selectedMuscles={(exerciseData?.main_muscle
                  ? exerciseData?.main_muscle
                  : exerciseData?.mainMuscle
                ).toLowerCase()}
                viewBox="0 30 369 70"
                bodyChart={() => {}}
                backMusclesData={() => {}}
              />
            </View>
          </View>
        </View>
        <View
          style={{
            width: wp(95),
            borderRadius: 20,
            paddingHorizontal: horizontalScale(10),
            paddingVertical: verticalScale(20),
            alignItems: 'center',
            gap: verticalScale(30),
          }}>
          <View style={{width: '100%'}}>
            <CustomText
              fontFamily="bold"
              fontSize={24}
              style={{textAlign: 'left'}}>
              Secondary Muscle
            </CustomText>
          </View>
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonWrapper}>
              <View style={styles.skeletonHeader}>
                <CustomText color={COLORS.white} style={styles.skeletonLabel}>
                  Front
                </CustomText>
              </View>
              <SkeletonFront
                showLabel={false}
                width={wp(45)}
                height={verticalScale(230)}
                containerWidth={wp(45)}
                selectedMuscles={selectedMuscles}
                viewBox="0 30 369 70"
                bodyChart={() => {}}
                frontMusclesData={() => {}}
              />
            </View>

            <View style={styles.skeletonWrapper}>
              <View style={styles.skeletonHeader}>
                <CustomText color={COLORS.white} style={styles.skeletonLabel}>
                  Back
                </CustomText>
              </View>
              <SkeletonBack
                showLabel={false}
                width={wp(45)}
                height={verticalScale(230)}
                containerWidth={wp(45)}
                selectedMuscles={selectedMuscles}
                viewBox="0 30 369 70"
                selectionColor={'#C3FF00'}
                bodyChart={() => {}}
                backMusclesData={() => {}}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderHistory = () => {
    // Function to extract all exercises with their dates and details
    const buildWorkoutHistoryForExercise = (
      schedule: typeof scheduleData,
      targetExercise: typeof exerciseData,
    ) => {
      if (!schedule) return [];

      // Step 1: Get raw history (your original logic)
      let history = schedule
        .flatMap(item => {
          const date = item.schedule_at || item.updated_at;
          const exercises = item.content.Exercises;

          // Handle new structure: Exercises is an array of groups
          let allExercises: any[] = [];

          if (Array.isArray(exercises)) {
            // New structure: flatten all exercises from all groups
            exercises.forEach((group: any) => {
              if (group.content && Array.isArray(group.content)) {
                allExercises.push(...group.content);
              }
            });
          } else if (typeof exercises === 'object' && exercises?.content) {
            // Old structure fallback: object with content
            allExercises = exercises.content;
          }

          const targetId = Number(
            targetExercise.exercise_id ?? targetExercise.id,
          );

          return allExercises
            .filter((ex: any) => Number(ex.Exercise_id) === targetId)
            .map((exercise: any) => ({
              name: targetExercise.name,
              date,
              details: exercise.Set.map((set: any) => ({
                weight: set.weight,
                reps: set.reps,
                distance: set.distance,
                time: set.time,
                weight_type: set.weight_type,
                difficulty: set.difficulty,
                rest_time: set.rest_time,
                log_time: set.log_time,
                type: set.type,
              })),
            }));
        })
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

      // Step 2: Apply date filter ONLY if ScheduleHistoryData is provided
      if (hideButton === true && ScheduleHistoryData) {
        const targetDate = ScheduleHistoryData.split('T')[0];

        history = history.filter(item => {
          const itemDate = (item.date || '').split('T')[0];
          return itemDate === targetDate;
        });
      }

      return history;
    };

    // Generate the history using your ORIGINAL getScheduleHistory
    const allExercisesHistory = buildWorkoutHistoryForExercise(
      getScheduleHistory,
      exerciseData,
    );

    // Custom "No history" message
    const noHistoryMsg = ScheduleHistoryData
      ? `No history for ${new Date(ScheduleHistoryData).toLocaleDateString()}`
      : 'No history available for now';

    return (
      <View
        style={{
          rowGap: verticalScale(10),
          flex: 1,
          paddingHorizontal: horizontalScale(12),
        }}>
        <FlatList
          data={allExercisesHistory}
          contentContainerStyle={{gap: verticalScale(10)}}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => {
            return (
              <View
                style={{
                  backgroundColor: COLORS.lightBrown,
                  padding: verticalScale(10),
                  borderRadius: 10,
                  gap: verticalScale(10),
                  borderWidth: 1,
                  borderColor: COLORS.white,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: horizontalScale(10),
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: 35,
                      height: 35,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: COLORS.sharpBlue,
                      borderRadius: 100,
                    }}>
                    <CustomIcon
                      Icon={ICONS.DumbellWhiteIcon}
                      height={27}
                      width={27}
                    />
                  </View>
                  <View style={{gap: verticalScale(5)}}>
                    <CustomText
                      fontFamily="semiBold"
                      fontSize={14}
                      color={COLORS.yellow}>
                      {item.name}
                    </CustomText>
                    <CustomText fontFamily="italic" fontSize={12}>
                      {new Date(item.date)
                        .toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })
                        .replace(/,/g, '')}
                    </CustomText>
                  </View>
                </View>

                <View
                  style={{
                    gap: verticalScale(6),
                    paddingHorizontal: horizontalScale(10),
                  }}>
                  {item.details.map((exercise: any, index: any) => {
                    const minutes = Math.floor(exercise.time / 60);
                    const seconds = exercise.time % 60;
                    const formattedTime = `${String(minutes).padStart(
                      2,
                      '0',
                    )}:${String(seconds).padStart(2, '0')}`;

                    return (
                      <View
                        key={exercise.time + index.toString()}
                        style={{
                          flexDirection: 'row',
                          gap: horizontalScale(5),
                        }}>
                        <CustomText
                          fontFamily="medium"
                          fontSize={13}
                          color={COLORS.whiteTail}>
                          {`${index + 1}. ${exercise.weight}${
                            exercise.weight_type
                          } ${exercise.distance}m ${formattedTime} x${
                            exercise.reps
                          }`}
                        </CustomText>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <CustomText
              fontSize={16}
              color={COLORS.yellow}
              fontFamily="bold"
              style={styles.noHistoryText}>
              {noHistoryMsg}
            </CustomText>
          }
        />
      </View>
    );
  };

  // Function to handle picker value changes
  const handlePickerValuesChange = useCallback(
    (values: {
      reps: string;
      distance?: string;
      weight?: string;
      time?: string;
    }) => {
      setCurrentPickerValues(values);
    },
    [],
  );

  // Function to convert time to seconds
  const convertTimeToSeconds = (timeString: string): string => {
    // Handle different time formats: "1m", "30s", "1m 30s", "90s", etc.
    const timeStr = timeString.toLowerCase().trim();

    // If it's already in seconds format (just numbers), return as is
    if (/^\d+$/.test(timeStr)) {
      return `${timeStr}s`;
    }

    // If it already ends with 's', return as is
    if (timeStr.endsWith('s')) {
      return timeStr;
    }

    let totalSeconds = 0;

    // Extract minutes and seconds
    const minuteMatch = timeStr.match(/(\d+)m/);
    const secondMatch = timeStr.match(/(\d+)s/);

    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }

    if (secondMatch) {
      totalSeconds += parseInt(secondMatch[1]);
    }

    // If no matches found, assume it's minutes and convert
    if (!minuteMatch && !secondMatch) {
      const numericValue = parseInt(timeStr.replace(/[^\d]/g, ''));
      if (!isNaN(numericValue)) {
        totalSeconds = numericValue * 60; // Convert minutes to seconds
      }
    }

    return `${totalSeconds}s`;
  };

  // Function to convert seconds to MM:SS format for display
  const formatTimeForDisplay = (
    timeString: string | number | undefined,
  ): string => {
    if (timeString === undefined || timeString === null) return '--';
    if (timeString === '--') return '--';

    const timeStr = String(timeString).toLowerCase().trim();
    let totalSeconds = 0;

    if (timeStr.endsWith('s')) {
      totalSeconds = parseInt(timeStr.replace('s', ''));
    } else if (timeStr.includes(':')) {
      return timeStr;
    } else {
      totalSeconds = parseInt(timeStr);
    }

    if (isNaN(totalSeconds)) return '--';

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

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

  const getDisplayValue = (value: any): string => {
    if (!value && value !== 0) return ''; // null, undefined, '', false → empty
    if (value === 0) return '0'; // keep zero visible
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === '--' || trimmed === '—') return '';
      return trimmed;
    }
    return String(value);
  };

  const getDisplayTime = (time: any): string => {
    if (!time || time === '--' || time === '00:00' || time === '') {
      return '';
    }

    // If already in MM:SS format
    if (typeof time === 'string' && time.includes(':')) {
      return time;
    }

    const seconds = Number(time);
    if (isNaN(seconds)) return '';

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  };

  // Function to handle adding a new set
  const handleAddSet = (
    usePickerValues: boolean = false,
    isDropSet: boolean = false,
  ) => {
    // Get planId and workoutId
    const planId = planDayData?.allData?.plan_id;
    const workoutId = selectedWorkoutId
      ? dayData?.find((d: any) => d.workout_id === selectedWorkoutId)
          ?.workout_id
      : dayData?.[0]?.workout_id;

    // Validate planId and workoutId
    if (!planId || !workoutId) {
      console.error('❌ Missing planId or workoutId:', {planId, workoutId});
      return;
    }
    // Use picker values if requested, otherwise use default values

    const finalData = {
      reps: currentPickerValues.reps ?? null,
      distance: currentPickerValues.distance ?? null,
      weight: currentPickerValues.weight ?? null,
      time:
        currentPickerValues.time && currentPickerValues.time !== '--'
          ? convertTimeToSeconds(currentPickerValues.time)
          : '--',
    };

    const getDate = new Date();

    const newSet: SetDetail = {
      ...(finalData.reps && {reps: finalData.reps}),
      ...(finalData.weight && {weight: finalData.weight}),
      ...(finalData.distance && {distance: finalData.distance}),
      ...(finalData.time !== '--' && {time: finalData.time}),
      count: 1,
      difficulty: selectedDifficulty,
      logTime: formatDateTime(getDate),
      dropSets: [],
    };

    // Find existing exercise in Redux store
    const existingWorkout = draftWorkout.find(
      w => w.workoutPlanId === planId && w.workoutId === workoutId,
    );

    // Use exercise_id (numeric) instead of id (MongoDB string)
    // Check multiple possible ID fields
    const exerciseIdToUse = String(
      exerciseData.exercise_id ||
        exerciseData.exerciseSettings?.exercise_id ||
        exerciseData.id,
    );

    const existingExercise = existingWorkout?.exercises.find(
      ex => ex.exercise_id === exerciseIdToUse,
    );

    // Combine existing sets from Redux with new set or drop set
    let combinedSetsData: SetData[];
    if (isDropSet && existingExercise && existingExercise.setsData.length > 0) {
      // Add drop set to the LATEST set (last index), not the first
      const lastIndex = existingExercise.setsData.length - 1;
      combinedSetsData = existingExercise.setsData.map((set, index) =>
        index === lastIndex
          ? {...set, dropSets: [...(set.dropSets || []), newSet]}
          : set,
      );
    } else {
      combinedSetsData = existingExercise
        ? [...existingExercise.setsData, newSet]
        : [newSet];
    }

    const newExerciseLog: ExerciseLog = {
      exercise_id: exerciseIdToUse,
      setsData: combinedSetsData,
      isDropSet: isDropSet,
      logTime: formatDateTime(getDate),
    };

    // Update local state to match Redux
    const updatedExerciseWithSetData = exerciseWithSetData
      ? [...exerciseWithSetData]
      : [];
    const exerciseIndex = updatedExerciseWithSetData.findIndex(
      exercise => exercise.exerciseId === exerciseIdToUse,
    );

    if (exerciseIndex >= 0) {
      // Update existing exercise
      updatedExerciseWithSetData[exerciseIndex] = {
        exerciseId: exerciseIdToUse,
        setsData: combinedSetsData,
        isDropSet: isDropSet,
        logTime: formatDateTime(getDate),
      };
    } else {
      // Create new exercise entry
      updatedExerciseWithSetData.push({
        exerciseId: exerciseIdToUse,
        setsData: combinedSetsData,
        isDropSet: isDropSet,
        logTime: formatDateTime(getDate),
      });
    }

    setexerciseWithSetData(updatedExerciseWithSetData);

    // Update Redux store
    if (!existingWorkout) {
      dispatch(
        setDraftWorkout({
          workoutPlanId: planId,
          workoutId: workoutId,
          exercises: [newExerciseLog],
        }),
      );
    } else {
      dispatch(
        updateExercise({
          ...newExerciseLog,
          workoutPlanId: planId,
          workoutId: workoutId,
        }),
      );
    }

    // Redux is now the single source of truth for sets

    // Close the AddSetUI
    dispatch(setStartCurrentExercise(exerciseData.id));
    setShowAddSetUi(false);
    setIsLoggingSet(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  const renderSets = () => {
    let historySets: any[] = [];

    if (hideButton) {
      //  When hideButton is true → show setsData (from backend)
      const currentExerciseId = String(
        exerciseData?.exercise_id || exerciseData?.id,
      );

      const matchedExercise = setsData?.find(
        (item: any) => String(item.Exercise_id) === currentExerciseId,
      );

      historySets =
        matchedExercise?.Set?.map((set: any, index: number) => ({
          Set: index + 1,
          Reps: set.reps,
          Distance:
            set.distance ||
            (set.reps?.toString().toLowerCase().includes('m')
              ? set.reps
              : '--'),
          Weight: set.weight === 0 ? '--' : `${set.weight}kg`,
          Time: getDisplayTime(set.Time || set.time) || '',
          difficulty: set.difficulty || 'Medium',
          isNewlyAdded: false,
          dropSets: [],
        })) || [];
    } else {
      //  When hideButton is false → show current sets from Redux draftWorkout
      // Get the current exercise ID
      const exerciseIdToUse = String(
        exerciseData.exercise_id ||
          exerciseData.exerciseSettings?.exercise_id ||
          exerciseData.id,
      );

      // Find the current workout in draftWorkout
      const planId = planDayData?.allData?.plan_id;
      const workoutId = dayData?.[0]?.workout_id;

      const currentWorkout = draftWorkout.find(
        w => w.workoutPlanId === planId && w.workoutId === workoutId,
      );

      // Find the current exercise in the workout
      const currentExercise = currentWorkout?.exercises.find(
        ex => ex.exercise_id === exerciseIdToUse,
      );

      // Map the sets from Redux to the display format
      historySets =
        currentExercise?.setsData?.map((set: any, index: number) => ({
          Set: index + 1,
          Reps: set.reps,
          Distance: set.distance || '0m',
          Weight: set.weight,
          Time: formatTimeForDisplay(set.time),
          difficulty: set.difficulty || 'Medium',
          isNewlyAdded: true,
          dropSets:
            set.dropSets?.map((dropSet: any) => ({
              ...dropSet,
              time: formatTimeForDisplay(dropSet.time),
            })) || [],
        })) || [];
    }

    const hasAnyDistance = historySets.some(
      set =>
        set.Distance &&
        set.Distance !== '0m' &&
        set.Distance !== '--' &&
        set.Distance !== '',
    );

    const hasAnyWeight = historySets.some(
      set =>
        set.Weight &&
        set.Weight !== '--' &&
        set.Weight !== '0kg' &&
        set.Weight !== '',
    );

    const hasAnyTime = historySets.some(
      set =>
        set.Time &&
        set.Time !== '--' &&
        set.Time !== '00:00' &&
        set.Time !== '',
    );

    const showDistanceColumn = hasAnyDistance;
    const showWeightColumn = hasAnyWeight;
    const showTimeColumn = hasAnyTime;

    return showAddSetUi ? (
      //  your Add Set UI (unchanged)
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          gap: verticalScale(40),
        }}>
        <PickerComponent
          difficulty={selectedDifficulty}
          onValuesChange={handlePickerValuesChange}
          showDistance={exerciseData.exerciseSettings?.Is_distance ?? true}
          showWeight={exerciseData.exerciseSettings?.is_weight ?? true}
          showTime={exerciseData.exerciseSettings?.Is_time ?? true}
        />
        {/* Difficulty selector */}
        <View style={styles.difficultyContainer}>
          {['Warmup', 'Easy', 'Medium', 'Hard'].map(difficulty => (
            <TouchableOpacity
              key={difficulty}
              style={[
                styles.difficultyButton,
                {
                  backgroundColor:
                    selectedDifficulty === difficulty
                      ? difficulty === 'Warmup'
                        ? '#777777'
                        : difficulty === 'Easy'
                        ? '#28A745'
                        : difficulty === 'Medium'
                        ? '#FFC107'
                        : '#DC3545'
                      : 'transparent',
                  borderColor:
                    difficulty === 'Warmup'
                      ? '#777777'
                      : difficulty === 'Easy'
                      ? '#28A745'
                      : difficulty === 'Medium'
                      ? '#FFC107'
                      : '#DC3545',
                },
              ]}
              onPress={() =>
                setSelectedDifficulty(
                  difficulty as 'Warmup' | 'Easy' | 'Medium' | 'Hard',
                )
              }>
              <CustomText
                fontSize={12}
                fontFamily="medium"
                color={
                  selectedDifficulty === difficulty
                    ? COLORS.black
                    : difficulty === 'Warmup'
                    ? '#777777'
                    : COLORS.white
                }>
                {difficulty}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={{
            width: wp(80),
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: horizontalScale(10),
            alignSelf: 'center',
          }}>
          <PrimaryButton
            title="Add Drop Set"
            onPress={() => handleAddSet(true, true)}
            isFullWidth={false}
            style={{
              alignSelf: 'flex-end',
              paddingVertical: verticalScale(7),
              paddingHorizontal: horizontalScale(15),
              borderRadius: verticalScale(10),
            }}
            backgroundColor="#3683DC"
          />
          <PrimaryButton
            title="Add Set"
            onPress={() => handleAddSet(true)}
            isFullWidth={false}
            style={{
              alignSelf: 'flex-end',
              paddingVertical: verticalScale(7),
              paddingHorizontal: horizontalScale(22),
              borderRadius: verticalScale(10),
            }}
          />
        </View>
      </View>
    ) : (
      //  Table View UI (unchanged, except data now comes from above)
      <View style={{flex: 1, gap: verticalScale(10)}}>
        {muscleData.length > 0 && (
          <View>
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: verticalScale(10),
                width: wp(100),
                marginBottom: verticalScale(5),
                justifyContent: 'space-evenly',
              }}>
              <View style={{width: wp(10), alignItems: 'flex-start'}} />
              <CustomText
                key="reps"
                fontSize={14}
                fontFamily="semiBold"
                style={{
                  flex: 1,
                  textAlign: 'center',
                }}>
                Reps
              </CustomText>

              {showDistanceColumn && (
                <CustomText
                  key="distance"
                  fontSize={14}
                  fontFamily="semiBold"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                  }}>
                  Distance
                </CustomText>
              )}

              {showWeightColumn && (
                <CustomText
                  key="weight"
                  fontSize={14}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                  }}
                  fontFamily="semiBold">
                  Weight(kg)
                </CustomText>
              )}

              {showTimeColumn && (
                <CustomText
                  key="time"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                  }}
                  fontSize={14}
                  fontFamily="semiBold">
                  Time
                </CustomText>
              )}
            </View>
          </View>
        )}

        <FlatList
          data={historySets}
          ref={flatListRef}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({animated: true})
          }
          onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
          renderItem={({item}) => {
            const difficultyColors = {
              Warmup: '#6C757D',
              Easy: '#28A745',
              Medium: '#FFC107',
              Hard: '#DC3545',
            };

            const setColor =
              difficultyColors[
                item.difficulty as keyof typeof difficultyColors
              ];
            const textColor = item.isNewlyAdded ? COLORS.white : COLORS.nickel;

            // Combine main set + drop sets into one array for rendering
            const allSets = [
              {...item, isDropSet: false},
              ...(item.dropSets?.map((ds: any) => ({...ds, isDropSet: true})) ||
                []),
            ];

            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: wp(100),
                }}>
                {/* Set Number Badge (spans all rows) */}
                <View style={{width: wp(10), alignItems: 'flex-start'}}>
                  <View
                    style={{
                      backgroundColor: setColor,
                      borderTopEndRadius: 5,
                      borderBottomEndRadius: 5,
                      paddingHorizontal: horizontalScale(5),
                      paddingVertical: verticalScale(5),
                      width: horizontalScale(25),
                      height: verticalScale(38) * allSets.length,
                      justifyContent: 'center',
                    }}>
                    <CustomText
                      style={{textAlign: 'center'}}
                      fontSize={20}
                      fontFamily="medium"
                      color={COLORS.white}>
                      {item.Set}
                    </CustomText>
                  </View>
                </View>

                {/* Data Rows (main + drop sets) */}
                <View style={{flex: 1}}>
                  {allSets.map((set, index) => (
                    <View
                      key={
                        index === 0
                          ? `main-${item.Set}`
                          : `drop-${item.Set}-${index}`
                      }
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        borderTopWidth: index === 0 ? 0 : 0,
                        borderTopColor: COLORS.whiteTail,
                        paddingVertical: verticalScale(7),
                        backgroundColor: set.isDropSet
                          ? 'rgba(255,255,255,0.05)'
                          : 'transparent',
                      }}>
                      <CustomText
                        fontSize={20}
                        fontFamily="medium"
                        color={textColor}
                        style={{flex: 1, textAlign: 'center'}}>
                        {getDisplayValue(set.Reps || set.reps)}
                      </CustomText>
                      {showDistanceColumn && (
                        <CustomText
                          fontSize={20}
                          fontFamily="medium"
                          color={textColor}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                          }}>
                          {getDisplayValue(set.Distance || set.distance) &&
                            `${getDisplayValue(set.Distance || set.distance)}`}
                        </CustomText>
                      )}

                      {showWeightColumn && (
                        <CustomText
                          fontSize={20}
                          fontFamily="medium"
                          color={textColor}
                          style={{flex: 1, textAlign: 'center'}}>
                          {getDisplayValue(set.Weight || set.weight) || '-'}
                        </CustomText>
                      )}

                      {showTimeColumn && (
                        <CustomText
                          fontSize={20}
                          fontFamily="medium"
                          color={textColor}
                          style={{flex: 1, textAlign: 'center'}}>
                          {getDisplayTime(set.Time || set.time) || '-'}
                        </CustomText>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <View style={styles.noHistoryContainer}>
              <CustomText
                fontSize={16}
                fontFamily="medium"
                color={COLORS.whiteTail}
                style={{textAlign: 'center'}}>
                No history found.{'\n'} Click "Add" to create a new set.
              </CustomText>
            </View>
          )}
          ListFooterComponent={() => (
            <View
              style={{
                width: wp(100),
                paddingHorizontal: horizontalScale(10),
                gap: verticalScale(15),
              }}>
              {!hideButton && (
                <View style={styles.addButtonsContainer}>
                  <PrimaryButton
                    title="Add"
                    onPress={() => {
                      setShowAddSetUi(true);
                    }}
                    isFullWidth={false}
                    style={{
                      alignSelf: 'flex-end',
                      paddingVertical: verticalScale(3),
                      paddingHorizontal: horizontalScale(15),
                      borderRadius: verticalScale(5),
                    }}
                    backgroundColor="#FF9500"
                  />
                </View>
              )}
            </View>
          )}
        />
      </View>
    );
  };

  const renderMainView = () => {
    switch (activeTab) {
      case 1:
        return renderSets();
      case 2:
        return renderDetailsTab();
      case 3:
        return renderHistory();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        paddingVertical: verticalScale(10),
        gap: verticalScale(20),
      }}>
      <CustomText
        style={{paddingHorizontal: horizontalScale(12)}}
        fontFamily="medium">
        {exerciseData.name +
          ' ' +
          exerciseData.exerciseSettings.sets +
          'x' +
          exerciseData.exerciseSettings.reps}
      </CustomText>
      {!showAddSetUi && renderTabs()}
      {renderMainView()}
    </View>
  );
};

export default ExerciseDetails;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  tabButton: {
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(30),
    paddingVertical: verticalScale(5),
    borderRadius: 10,
  },
  setsTabButton: {
    justifyContent: 'center',
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 100,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: horizontalScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(10),
  },
  tag: {
    backgroundColor: COLORS.brown,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(8),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.brown,
  },
  noHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(50),
    paddingHorizontal: horizontalScale(20),
  },
  // New styles for the sets table
  setsHeaderRow: {
    flexDirection: 'row',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    width: '100%',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    alignItems: 'center',
  },
  setNumberContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    lineHeight: 30,
  },
  setCellText: {
    flex: 1,
    textAlign: 'center',
  },
  // Difficulty selector styles
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
  },
  difficultyButton: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(15),
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: horizontalScale(70),
  },
  // Add buttons styles
  addButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: verticalScale(10),
  },
  addDropSetButton: {
    backgroundColor: '#007BFF',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(15),
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: horizontalScale(10),
  },
  addSetButton: {
    backgroundColor: '#FF9500',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(15),
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  skeletonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: horizontalScale(10),
  },
  skeletonWrapper: {
    backgroundColor: COLORS.brown,
    padding: verticalScale(15),
    borderRadius: 20,
    width: wp(45),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  skeletonHeader: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: verticalScale(5),
  },
  skeletonLabel: {
    marginBottom: verticalScale(10),
    fontFamily: 'medium',
  },
  selectedMusclesContainer: {
    marginTop: verticalScale(20),
    padding: verticalScale(15),
    backgroundColor: COLORS.lightBrown,
    borderRadius: 10,
  },
  noHistoryText: {
    flex: 1,
    textAlign: 'center',
  },
});
