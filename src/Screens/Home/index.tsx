import LottieView from 'lottie-react-native';
import React, {
  FC,
  useCallback,
  useMemo,
  useRef,
  useState,
  memo,
  useEffect,
} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  InteractionManager,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {fetchData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';
import ICONS from '../../Assets/Icons';
import AddLogButton from '../../Components/AddLogButton';
import CalendarList from '../../Components/CalendarList';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  setHomeActiveIndex,
  setLogMealActiveIndex,
} from '../../Redux/slices/initialSlice';
import {setScheduleData} from '../../Redux/slices/ScheduleSlice';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import {HomeTabScreenProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale, wp} from '../../Utilities/Metrics';
import MealLogmenu from './LogMenus/MealLogmenu';
import MeasurementlogMenu from './LogMenus/MeasurementlogMenu';
import NotesLogMenu from './LogMenus/NotesLogMenu';
import WorkoutMenu from './LogMenus/WorkoutMenu';

// Memoized Complete Profile Card Component
const CompleteProfileCard = memo(
  ({userData, navigation}: {userData: any; navigation: any}) => {
    const progressLine = useMemo(() => {
      let progress = 0;

      if (userData?.is_verified) progress += 25;
      if (userData?.first_name && userData?.last_name) progress += 25;
      if (userData?.pic_URL) progress += 25;

      const personalSettings = userData?.personal_settings;

      const hasPersonalSettings =
        personalSettings?.height &&
        personalSettings.height_measurement &&
        personalSettings.workout_exp_years;

      if (hasPersonalSettings) progress += 25;

      return `${progress}%`;
    }, [userData]);

    return (
      <View
        style={{
          backgroundColor: COLORS.lightBrown,
          paddingVertical: verticalScale(16),
          paddingHorizontal: horizontalScale(10),
          borderRadius: 10,
          gap: verticalScale(10),
        }}>
        <CustomText fontFamily="bold" fontSize={14}>
          Complete Your Profile
        </CustomText>
        <CustomText fontSize={12}>
          Adding more details will help our AI engine give better insights.
        </CustomText>

        <View
          style={{
            backgroundColor: COLORS.darkBrown,
            width: '100%',
            height: verticalScale(10),
            borderRadius: 5,
            marginVertical: verticalScale(10),
          }}>
          <View
            style={{
              backgroundColor: COLORS.green,
              width: progressLine as any,
              borderRadius: 5,
              height: verticalScale(10),
            }}
          />
        </View>
        <PrimaryButton
          title="Add Details"
          onPress={() => {
            navigation.navigate('SETTINGS');
          }}
          style={{
            alignSelf: 'flex-end',
            width: 'auto',
            paddingVertical: verticalScale(5),
            paddingHorizontal: horizontalScale(10),
            borderRadius: verticalScale(5),
          }}
          textSize={14}
          isFullWidth={false}
        />
      </View>
    );
  },
);

// Memoized Workout In Progress Component
const WorkoutInProgress = memo(
  ({
    workoutInProgressName,
    workoutInTime,
    workoutInProgress,
    onContinue,
  }: {
    workoutInProgressName: any;
    workoutInTime: number | null;
    workoutInProgress: string;
    onContinue: () => void;
  }) => {
    const animationRef = useRef<LottieView>(null);

    const formatTime = useCallback((totalSeconds: number): string => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0'),
      ].join(':');
    }, []);

    return (
      <View
        style={{
          backgroundColor: COLORS.lightBrown,
          paddingVertical: verticalScale(16),
          paddingHorizontal: horizontalScale(10),
          borderRadius: 10,
          gap: verticalScale(20),
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: horizontalScale(10),
            paddingRight: horizontalScale(20),
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
              gap: verticalScale(10),
            }}>
            <CustomText fontFamily="italic" fontSize={14}>
              Workout in progress
            </CustomText>
            <CustomText fontSize={12} fontFamily="italic">
              {`${workoutInProgressName.workoutName} ${
                workoutInProgressName.dayName
              } : ${formatTime(workoutInTime ?? 0)}`}
            </CustomText>
          </View>

          <LottieView
            ref={animationRef}
            source={require('../../Assets/animation.json')}
            autoPlay
            loop={workoutInProgress === 'inprogress' ? true : false}
            style={{
              width: verticalScale(35),
              height: verticalScale(55),
            }}
            resizeMode="cover"
          />
        </View>
        <PrimaryButton
          title="Continue"
          onPress={onContinue}
          style={{
            alignSelf: 'flex-end',
            width: 'auto',
            paddingVertical: verticalScale(5),
            paddingHorizontal: horizontalScale(10),
            borderRadius: verticalScale(5),
          }}
          textSize={14}
          isFullWidth={false}
        />
      </View>
    );
  },
);

const HOME: FC<HomeTabScreenProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const workoutInTime = useAppSelector(
    state => state.logWorkoutData.workoutTime,
  );

  const workoutInProgress = useAppSelector(
    state => state.logWorkoutData.workoutProgress,
  );

  const workoutInProgressName = useAppSelector(
    state => state.logWorkoutData.currentWorkout,
  );

  const {userData} = useAppSelector(state => state.userData);
  const {totalMacros} = useAppSelector(state => state.macros);
  const {scheduleData, showInitialData} = useAppSelector(
    state => state.scheduleData,
  );
  const [selectedItem, setSelectedItem] = useState<string[]>([]);
  const {exerciseData} = useAppSelector(state => state.exerciseData);
  const {planData} = useAppSelector(state => state.planData);
  const [expandedNotes, setExpandedNotes] = useState<{[key: string]: boolean}>(
    {},
  );

  // Memoized History Item Component
  const HistoryItem = memo(
    ({
      item,
      selectedItem,
      expandedNotes,
      onPress,
      onLongPress,
      onToggleExpand,
    }: {
      item: any;
      selectedItem: string[];
      expandedNotes: {[key: string]: boolean};
      onPress: (item: any) => void;
      onLongPress: (itemId: string) => void;
      onToggleExpand: (itemId: string) => void;
    }) => {
      const itemId = item._parentId;
      const isSelected = selectedItem.includes(itemId);
      const isExpanded = expandedNotes[itemId];

      const Exercise_id = Number(
        item.content.Exercises?.[0]?.content?.[0]?.Exercise_id,
      );

      const workoutData = planData
        ?.flatMap(plan => {
          if (plan.allData?.plan_id !== item.content.plan_id) return [];

          return (
            plan.allData?.content?.workouts
              ?.filter(w => w.workout_id === item.content.Workout_id)
              ?.map(w => ({
                ...w,
                plan_id: plan.allData?.plan_id,
              })) || []
          );
        })
        .find(w =>
          w.exercises.some(ex =>
            ex.workout_exercises.some(we => we.exercise_id === Exercise_id),
          ),
        );

      const workoutColor = workoutData?.color || null;

      return (
        <TouchableOpacity
          key={item._uniqueKey}
          delayLongPress={200}
          onPress={() => onPress(item)}
          onLongPress={() => onLongPress(itemId)}
          style={{
            padding: 10,
            borderRadius: 10,
            flexDirection: 'row',
            gap: verticalScale(10),
            backgroundColor: isSelected
              ? COLORS.lighterBrown
              : COLORS.lightBrown,
          }}>
          <View
            style={{
              backgroundColor: COLORS.whiteTail,
              paddingVertical: verticalScale(10),
              paddingHorizontal: horizontalScale(10),
              borderRadius: 10,
              alignSelf: 'flex-start',
            }}>
            <View
              style={{
                width: 35,
                height: 35,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor:
                  item.type === 'workout' && workoutColor
                    ? workoutColor // ← use your matched workout color
                    : item.type === 'note'
                    ? COLORS.darkPink
                    : item.type === 'food'
                    ? COLORS.darkPink
                    : COLORS.sharpBlue,
                borderRadius: 100,
              }}>
              <CustomIcon
                Icon={
                  item.type === 'note'
                    ? ICONS.CalendarWithDumbellIcon
                    : item.type === 'food'
                    ? ICONS.mealIcon
                    : item.type === 'measurement'
                    ? ICONS.MeasurementLogIcon
                    : ICONS.DumbellWhiteIcon
                }
                height={18}
                width={18}
              />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              gap: verticalScale(5),
              paddingVertical: verticalScale(2),
            }}>
            <CustomText fontFamily="medium" fontSize={15}>
              {item.type === 'note' && !isExpanded
                ? item.displayName.slice(0, 150) + '...'
                : item.displayName}
            </CustomText>

            {item.type === 'note' && item.displayName.length > 150 && (
              <TouchableOpacity onPress={() => onToggleExpand(itemId)}>
                <CustomText
                  fontSize={12}
                  fontFamily="bold"
                  style={{color: COLORS.sharpBlue}}>
                  {isExpanded ? 'Read Less' : 'Read More'}
                </CustomText>
              </TouchableOpacity>
            )}

            <CustomText fontFamily="italic" fontSize={14}>
              {new Date(item.schedule_at).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </CustomText>
          </View>
        </TouchableOpacity>
      );
    },
  );

  const {dates, month, homeActiveIndex, initialIndex, logMealActiveIndex} =
    useAppSelector(state => state.initial);

  // Fetch schedule data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchScheduleData = async () => {
        try {
          const response = await fetchData<any>(ENDPOINTS.schedule);
          if (response?.data?.data) {
            dispatch(setScheduleData(response.data.data));
          }
        } catch (error) {
          console.error('Error fetching schedule data:', error);
        }
      };

      fetchScheduleData();
    }, [dispatch]),
  );

  const selectedDate = useMemo(() => {
    if (initialIndex === -1) return null;
    return dates[initialIndex];
  }, [initialIndex, dates]);

  // Show all history (not filtered by selected day)
  // const filteredSchedule = useMemo(() => {
  //   if (!scheduleData) return [];

  //   // Create a copy and sort by date (most recent first)
  //   return [...scheduleData].sort(
  //     (a, b) =>
  //       new Date(b.schedule_at).getTime() - new Date(a.schedule_at).getTime(),
  //   );
  // }, [scheduleData]);

  const filteredSchedule = useMemo(() => {
    if (!scheduleData) return [];

    // If no date selected → show everything
    if (!selectedDate) {
      return [...scheduleData].sort(
        (a, b) =>
          new Date(b.schedule_at).getTime() - new Date(a.schedule_at).getTime(),
      );
    }

    if (showInitialData) {
      // Show all data without filtering
      return [...scheduleData].sort(
        (a, b) =>
          new Date(b.schedule_at).getTime() - new Date(a.schedule_at).getTime(),
      );
    } else {
      // Filter by selected date
      const selectedDateString = new Date(
        selectedDate.timestamp,
      ).toDateString();

      // Filter only items from selected date
      const filtered = scheduleData.filter(item => {
        const itemDate = new Date(item.schedule_at).toDateString();
        return itemDate === selectedDateString;
      });

      // Sort descending
      return filtered.sort(
        (a, b) =>
          new Date(b.schedule_at).getTime() - new Date(a.schedule_at).getTime(),
      );
    }
  }, [scheduleData, selectedDate, showInitialData]);

  // Memoize transformDayData to prevent recalculation on every render
  const transformDayData = useCallback(
    (dayData: any, selectedDay: string) => {
      // Find the selected workout by name
      const workout = dayData.content.workouts.find(
        (w: any) => w.name === selectedDay,
      );

      if (!workout) {
        return {
          day: selectedDay,
          type: 'Unknown Type',
          focus: ['General'],
          color: '#8A2BE2',
          exercises: [],
          planData: dayData?.content,
          coverImage: dayData?.image_url,
        };
      }

      // Flatten all workout_exercises only for this day
      const exercisesFound =
        workout.exercises?.flatMap((ex: any) => ex.workout_exercises) || [];

      const exerciseIds = exerciseData?.map((ex: any) => ex.exercise_id) || [];

      // Filter only if they exist in master exerciseData
      const validExercises = exercisesFound.filter((we: any) =>
        exerciseIds.includes(we.exercise_id),
      );

      // Map exercises to desired format
      const exercisesMapped = validExercises.map((ex: any) => {
        const fullExercise = exerciseData?.find(
          (e: any) => e.exercise_id === ex.exercise_id,
        );

        return {
          id: fullExercise?.id || ex.exercise_id,
          name: fullExercise?.name || 'Unknown Exercise',
          coverImage: {
            uri: fullExercise?.images_urls?.[0] || '',
            type: 'image/jpeg',
            fileName: fullExercise?.images_urls?.[0]
              ? fullExercise.images_urls[0].split('/').pop()
              : 'default.jpg',
          },
          images: fullExercise?.images_urls || [],
          instruction: fullExercise?.instruction || '',
          description: fullExercise?.description || '',
          mainMuscle: fullExercise?.main_muscle || '',
          secondaryMuscle: fullExercise?.secondary_muscles,
          targetMuscles: fullExercise?.secondary_muscles,
          force: fullExercise?.force,
          location: fullExercise?.mechanics,
          type: fullExercise?.type,
          equipment: fullExercise?.equipment,

          //  Add workout-specific info
          recommendedSets: ex.sets,
          recommendedReps: ex.reps,
          timing_warmup: ex.timing_warmup,
          timing_workset: ex.timing_workset,
          timing_finish: ex.timing_finish,
          is_time: ex.Is_time,
          is_weight: ex.is_weight,
          is_distance: ex.Is_distance,
          alternate_exercise_id: ex.alternate_exercise_id,
        };
      });

      return {
        day: workout.name,
        type: workout?.comments || 'Unknown Type',
        focus: [
          ...new Set(
            exercisesMapped.map((ex: any) => ex.mainMuscle || 'General'),
          ),
        ],
        color: workout?.color || '#8A2BE2',
        exercises: exercisesMapped,
        planData: dayData?.content,
        coverImage: dayData?.image_url,
      };
    },
    [exerciseData],
  );

  // Handler for continuing workout
  const handleContinueWorkout = useCallback(() => {
    if (workoutInProgress === 'inprogress' && workoutInProgressName) {
      const {planId, dayName} = workoutInProgressName;
      // Find the program
      const selectedProgram = planData?.find(
        item => item.allData?.plan_id === planId,
      );

      if (!selectedProgram) return;

      // Use InteractionManager to defer navigation until animations complete
      // This prevents UI freeze by allowing the button press animation to finish first

      // Transform the selected day's data
      const transformedDayData: any = transformDayData(
        selectedProgram.allData,
        dayName!,
      );

      // Navigate to workout details
      navigation.navigate('workoutProgramDetails', {
        programId: planId!,
        day: [transformedDayData],
        selectedProgram: selectedProgram,
        ScheduleHistoryData: {},
        isFrom: false,
        sets: {},
      });
    }
  }, [
    workoutInProgress,
    workoutInProgressName,
    planData,
    transformDayData,
    navigation,
  ]);

  // Handler for history item press
  const handleHistoryItemPress = useCallback(
    (item: any) => {
      if (item.type !== 'workout') return;

      const planID = item.content.plan_id;
      const workoutID = item.content.Workout_id;
      const loggedAt = item.schedule_at;

      const exactScheduleItem = scheduleData?.find(
        s =>
          s.type === 'workout' &&
          s.content?.plan_id === planID &&
          s.content?.Workout_id === workoutID &&
          new Date(s.schedule_at).getTime() === new Date(loggedAt).getTime(),
      );

      if (!exactScheduleItem) {
        console.warn('Exact workout history not found');
        return;
      }

      // 1. Find original program
      const selectedProgram = planData?.find(
        p => p.allData?.plan_id === planID,
      );
      if (!selectedProgram) return;

      // 2. Find original workout (for name, color, etc.)
      const originalWorkout = selectedProgram?.allData?.content?.workouts?.find(
        (w: any) => w.workout_id === workoutID,
      );
      if (!originalWorkout) return;

      // 3. Get original day structure
      const baseDayData = transformDayData(
        selectedProgram.allData,
        originalWorkout.name,
      );

      // 4. Get logged exercises for THIS history item
      let loggedExercises: any[] = [];
      const exercises = exactScheduleItem.content?.Exercises;

      if (Array.isArray(exercises)) {
        exercises.forEach((group: any) => {
          if (group.content && Array.isArray(group.content)) {
            loggedExercises.push(...group.content);
          }
        });
      } else if (item.content?.Exercises?.content) {
        loggedExercises = item.content.Exercises.content;
      }

      // 5. Map logged exercises to full exercise objects + completed sets
      const enrichedExercises = loggedExercises
        .map((log: any) => {
          const exerciseId = log.Exercise_id;
          const fullExercise = exerciseData?.find(
            (e: any) => e.exercise_id === exerciseId,
          );
          if (!fullExercise) return null;

          const originalExercise = baseDayData.exercises.find(
            (ex: any) => ex.id === fullExercise.id || ex.id === exerciseId,
          );

          return {
            ...originalExercise,
            id: fullExercise.id,
            name: fullExercise.name,
            coverImage: {
              uri: fullExercise?.images_urls?.[0] || '',
              type: 'image/jpeg',
              fileName: fullExercise?.images_urls?.[0]
                ? fullExercise.images_urls[0].split('/').pop()
                : 'default.jpg',
            },
            images: fullExercise?.images_urls || [],
            instruction: fullExercise?.instruction || '',
            description: fullExercise?.description || '',
            mainMuscle: fullExercise?.main_muscle || '',
            secondaryMuscle: fullExercise?.secondary_muscles,
            targetMuscles: fullExercise?.secondary_muscles,
            force: fullExercise?.force,
            location: fullExercise?.mechanics,
            type: fullExercise?.type,
            equipment: fullExercise?.equipment,
            recommendedSets: originalExercise?.recommendedSets || 0,
            recommendedReps: originalExercise?.recommendedReps || 0,
            completedSets: (log.Set || []).map((s: any) => ({
              set_id: s.set_id,
              weight: s.weight,
              reps: s.reps,
              distance: s.distance,
              time: s.time,
              weight_type: s.weight_type,
              difficulty: s.difficulty,
              rest_time: s.rest_time,
              log_time: s.log_time,
            })),
          };
        })
        .filter(Boolean);

      // 6. Build final day object
      const transformedDayData = {
        ...baseDayData,
        exercises: enrichedExercises,
        day: originalWorkout.name,
        type: originalWorkout.comments || 'Unknown Type',
        color: originalWorkout.color || '#8A2BE2',
        focus: [
          ...new Set(
            enrichedExercises.map((ex: any) => ex.mainMuscle || 'General'),
          ),
        ],
      };

      const setsData = loggedExercises;

      // 7. Navigate
      navigation.navigate('workoutProgramDetails', {
        programId: planID,
        day: [transformedDayData],
        selectedProgram,
        ScheduleHistoryData: loggedAt,
        isFrom: true,
        sets: setsData,
      });
    },
    [planData, exerciseData, transformDayData, navigation],
  );

  // Handler for history item long press
  const handleHistoryItemLongPress = useCallback((itemId: string) => {
    setSelectedItem(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId],
    );
  }, []);

  // Handler for toggling note expansion
  const handleToggleNoteExpand = useCallback((itemId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  const REMOVE_SCHEDULE = async () => {
    const ids = selectedItem.join(',');

    try {
      const response = await fetchData<any>(
        `${ENDPOINTS.remove_Schedule}schedule_id=${ids}`,
      );

      if (response.data.data === 'Schedule successfully removed.') {
        setSelectedItem([]);
        dispatch(
          setScheduleData(
            scheduleData?.filter(
              item => !selectedItem.includes(item.id || item._id),
            ) || [],
          ),
        );
      }
      console.log('removed response', response);
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  // Helper function to format date heading
  const formatDateHeading = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return null;
    }

    // Otherwise, show full date
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Memoize the CalendarList component to prevent unnecessary re-renders
  const MemoizedCalendarList = useMemo(
    () => <CalendarList />,
    [dates, month, showInitialData],
  );

  const LOGGING_MENU_ITEMS = [
    {
      icon: ICONS.WorkoutLogIcon,
      label: 'Workout',
      onPress: () => {
        dispatch(setHomeActiveIndex(1));
      },
    },
    {
      icon: ICONS.MealLogIcon,
      label: 'Meal',
      onPress: () => {
        dispatch(setHomeActiveIndex(2));
      },
    },
    {
      icon: ICONS.MeasurementLogIcon,
      label: 'Measurement',
      onPress: () => {
        dispatch(setHomeActiveIndex(3));
      },
    },
    {
      icon: ICONS.NotesLogIcon,
      label: 'Notes',
      onPress: () => {
        dispatch(setHomeActiveIndex(4));
      },
    },
  ];

  const mergeWorkoutSchedules = (data: any[]) => {
    const map = new Map<string, any>();

    data.forEach(item => {
      if (item.type !== 'workout') {
        map.set(item.id || item._id, item);
        return;
      }

      const key = `${item.content.plan_id}-${
        item.content.Workout_id
      }-${new Date(item.schedule_at).getTime()}`;

      if (!map.has(key)) {
        map.set(key, {
          ...item,
          content: {
            ...item.content,
            Exercises: [],
          },
        });
      }

      const existing = map.get(key);

      // merge exercises
      if (Array.isArray(item.content?.Exercises)) {
        item.content.Exercises.forEach((group: any) => {
          if (group?.content) {
            existing.content.Exercises.push(group);
          }
        });
      }
    });

    return Array.from(map.values());
  };

  // Prepare data for FlatList
  const homeScreenData = useMemo(() => {
    if (homeActiveIndex !== 0) return [];

    const data: any[] = [];

    // Add profile card
    data.push({type: 'profile', key: 'profile'});

    // Add workout in progress if applicable
    if (workoutInProgress === 'inprogress') {
      data.push({type: 'workout-progress', key: 'workout-progress'});
    }

    // Add history header
    data.push({type: 'history-header', key: 'history-header'});

    // Add history items
    if (filteredSchedule && filteredSchedule.length > 0) {
      const workoutMap = new Map<string, any>();

      filteredSchedule.forEach(item => {
        if (item.type !== 'workout') {
          workoutMap.set(item.id || item._id, item);
          return;
        }

        const key = `${item.content.plan_id}-${
          item.content.Workout_id
        }-${new Date(item.schedule_at).getTime()}`;

        if (!workoutMap.has(key)) {
          workoutMap.set(key, {
            ...item,
            content: {
              ...item.content,
              Exercises: [],
            },
          });
        }

        const existing = workoutMap.get(key);

        if (Array.isArray(item.content?.Exercises)) {
          existing.content.Exercises.push(...item.content.Exercises);
        }
      });
      // Flatten scheduleData
      const flattenedData = Array.from(workoutMap.values()).flatMap(item => {
        if (item.type === 'workout') {
          const workoutName =
            planData
              ?.find(p => p.allData?.plan_id === item.content.plan_id)
              ?.allData?.content?.workouts?.find(
                (w: any) => w.workout_id === item.content.Workout_id,
              )?.name || 'Unknown Workout';

          return [
            {
              ...item,
              _parentId: item.id || item._id,
              _uniqueKey: `${item.content.plan_id}-${item.content.Workout_id}-${item.schedule_at}`,
              displayName: workoutName,
              type: 'workout',
            },
          ];
        }

        if (item.type === 'note') {
          return {
            ...item,
            _parentId: item.id || item._id,
            _uniqueKey: item.id || item._id,
            displayName: item.content.notes,
            type: 'note',
          };
        }
        if (item.type === 'measurement') {
          return item.content?.list?.map((m: any, index: number) => ({
            ...item,
            _parentId: item._id || item.id,
            _uniqueKey: `${item._id || item.id}-${m.part}-${index}`,
            displayName: `${m.part}: ${m.amount} ${m.unit}`,
            type: 'measurement',
          }));
        }

        if (item.type === 'food') {
          const {name} = item.content || {};
          return [
            {
              ...item,
              _parentId: item.id || item._id,
              _uniqueKey: item.id || item._id,
              displayName: `${name} `,
              type: 'food',
            },
          ];
        }

        return [];
      });

      // Group by date
      const groupedByDate: {[key: string]: any[]} = {};
      flattenedData.forEach((item: any) => {
        const dateKey = new Date(item.schedule_at).toDateString();
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(item);
      });

      // Add grouped data to list
      Object.keys(groupedByDate).forEach(dateKey => {
        data.push({
          type: 'date-header',
          key: `date-${dateKey}`,
          date: dateKey,
        });
        groupedByDate[dateKey].forEach(item => {
          data.push({
            type: 'history-item',
            key: item._uniqueKey,
            item,
          });
        });
      });
    }

    return data;
  }, [
    homeActiveIndex,
    workoutInProgress,
    filteredSchedule,
    exerciseData,
    showInitialData,
  ]);

  // Render item for FlatList
  const renderHomeItem = useCallback(
    ({item: dataItem}: {item: any}) => {
      switch (dataItem.type) {
        case 'profile':
          return (
            <CompleteProfileCard userData={userData} navigation={navigation} />
          );
        case 'workout-progress':
          return (
            <WorkoutInProgress
              workoutInProgressName={workoutInProgressName}
              workoutInTime={workoutInTime}
              workoutInProgress={workoutInProgress}
              onContinue={handleContinueWorkout}
            />
          );
        case 'history-header':
          return (
            <View>
              <CustomText fontFamily="bold">History</CustomText>
              {selectedItem.length > 0 && (
                <TouchableOpacity
                  onPress={REMOVE_SCHEDULE}
                  style={styles.actionButton}>
                  <CustomIcon Icon={ICONS.DeleteIcon} height={15} width={15} />
                  <CustomText fontSize={6} fontFamily="bold">
                    DELETE
                  </CustomText>
                </TouchableOpacity>
              )}
              {filteredSchedule.length === 0 && (
                <CustomText
                  fontFamily="semiBold"
                  fontSize={14}
                  color={COLORS.yellow}
                  style={{
                    marginTop: verticalScale(50),
                    textAlign: 'center',
                  }}>
                  No history available
                </CustomText>
              )}
            </View>
          );
        case 'date-header':
          return (
            <CustomText
              fontFamily="bold"
              fontSize={12}
              style={{
                color: COLORS.yellow,
                marginTop: verticalScale(10),
              }}>
              {formatDateHeading(dataItem.date)}
            </CustomText>
          );
        case 'history-item':
          return (
            <HistoryItem
              item={dataItem.item}
              selectedItem={selectedItem}
              expandedNotes={expandedNotes}
              onPress={handleHistoryItemPress}
              onLongPress={handleHistoryItemLongPress}
              onToggleExpand={handleToggleNoteExpand}
            />
          );
        default:
          return null;
      }
    },
    [
      userData,
      navigation,
      workoutInProgressName,
      workoutInTime,
      workoutInProgress,
      handleContinueWorkout,
      selectedItem,
      expandedNotes,
      handleHistoryItemPress,
      handleHistoryItemLongPress,
      handleToggleNoteExpand,
      formatDateHeading,
      REMOVE_SCHEDULE,
      showInitialData,
    ],
  );

  const renderView = useMemo(() => {
    switch (homeActiveIndex) {
      case 0:
        return null; // Will be rendered with FlatList
      case 1:
        return <WorkoutMenu />;
      case 2:
        return <MealLogmenu />;
      case 3:
        return <MeasurementlogMenu />;
      case 4:
        return <NotesLogMenu />;

      default:
        return <></>;
    }
  }, [homeActiveIndex]);

  return (
    <View style={styles.main}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        {logMealActiveIndex === 3 ? (
          <View
            style={{
              backgroundColor: COLORS.darkBrown,
              alignItems: 'center',
              gap: verticalScale(32),
              paddingTop: verticalScale(20),
              paddingBottom: verticalScale(20),
            }}>
            <View
              style={{
                paddingLeft: 10,
                justifyContent: 'flex-start',
                width: '100%',
              }}>
              <CustomIcon
                onPress={() => {
                  dispatch(setHomeActiveIndex(0));
                  dispatch(setLogMealActiveIndex(1));
                }}
                Icon={ICONS.BackArrow}
              />
            </View>
            <CustomText fontFamily="bold">Total Meal Macro</CustomText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                width: wp(100),
              }}>
              {[
                {title: 'Calories', value: totalMacros.calories.toFixed(1)},
                {title: 'Fat', value: totalMacros.fat.toFixed(1)},
                {title: 'Protein', value: totalMacros.protein.toFixed(1)},
                {title: 'Carbs', value: totalMacros.carbs.toFixed(1)},
              ].map((item, index) => (
                <View
                  style={{alignItems: 'center', gap: verticalScale(5)}}
                  key={index.toString()}>
                  <CustomText
                    fontSize={10}
                    fontFamily="medium"
                    color={COLORS.whiteTail}>
                    {item.title}
                  </CustomText>

                  <View key={index.toString()} style={styles.mealStatItem}>
                    <CustomText fontSize={14} fontFamily="medium">
                      {item.value}
                    </CustomText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          MemoizedCalendarList
        )}
        <View style={styles.scrollWrapper}>
          {homeActiveIndex === 0 ? (
            <>
              <FlatList
                data={homeScreenData}
                renderItem={renderHomeItem}
                keyExtractor={item => item.key}
                contentContainerStyle={{
                  paddingHorizontal: horizontalScale(15),
                  rowGap: verticalScale(20),
                  paddingBottom: verticalScale(20),
                }}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
              />
              <AddLogButton menuItems={LOGGING_MENU_ITEMS} />
            </>
          ) : (
            renderView
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HOME;

const styles = StyleSheet.create({
  main: {backgroundColor: COLORS.brown, flex: 1},
  safeArea: {
    flex: 1,
  },

  scrollWrapper: {
    flex: 1,
    backgroundColor: COLORS.darkBrown,
    paddingTop: verticalScale(10),
  },

  scrollViewStyle: {
    paddingHorizontal: horizontalScale(15),
  },

  scrollViewContainer: {
    rowGap: verticalScale(20),
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  mealStatItem: {
    alignItems: 'center',
    backgroundColor: COLORS.lighterBrown,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.brown,
    gap: verticalScale(5),
  },
  deleteBtn: {
    justifyContent: 'center',
    borderRadius: 20,
    borderColor: COLORS.white,
    borderWidth: 0.9,
    alignSelf: 'flex-start',
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
  NoScheduleText: {
    color: COLORS.whiteGreenish,
    textAlign: 'center',
    width: '70%',
    alignSelf: 'center',
    marginTop: verticalScale(20),
  },
});
