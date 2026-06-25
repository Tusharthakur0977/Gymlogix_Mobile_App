import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {fetchData} from '../../../APIServices/api';
import ENDPOINTS from '../../../APIServices/endPoints';
import {CustomText} from '../../../Components/CustomText';
import PrimaryButton from '../../../Components/PrimaryButton';
import {workoutTimer} from '../../../Components/WorkoutTimer';
import {
  setCurrentWorkout,
  setWorkoutProgress,
} from '../../../Redux/slices/LogWorkoutSlice';
import {selectAllTrainingPlans} from '../../../Redux/slices/trainingPlansSlice';
import {setUserData} from '../../../Redux/slices/UserSlice';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import {UserResponse} from '../../../Typings/ApiResponse/UserResponse';
import COLORS from '../../../Utilities/Colors';
import STORAGE_KEYS from '../../../Utilities/Constants';
import {horizontalScale, verticalScale, wp} from '../../../Utilities/Metrics';
import {getLocalStorageData} from '../../../Utilities/Storage';
import {setHomeActiveIndex} from '../../../Redux/slices/initialSlice';

const WorkoutMenu = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const trainingPlans = useAppSelector(selectAllTrainingPlans);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // Changed to string | null
  const {userData} = useAppSelector(state => state.userData);
  const {planData} = useAppSelector(state => state.planData);
  const {exerciseData} = useAppSelector(state => state.exerciseData);
  const [isLoading, setisLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const workoutTime = useAppSelector(state => state.logWorkoutData.workoutTime); // in seconds

  const workoutProgress = useAppSelector(
    state => state.logWorkoutData.workoutProgress,
  );

  const currentWorkout = useAppSelector(
    state => state.logWorkoutData.currentWorkout,
  );

  useEffect(() => {
    const getUser = async () => {
      const token = await getLocalStorageData(STORAGE_KEYS.token);
      setisLoading(true);
      try {
        if (token) {
          const response = await fetchData<UserResponse>(ENDPOINTS.getUser);
          dispatch(setUserData(response.data.user));
        }
      } catch (error) {
        console.log(error, 'Something went wrong');
      } finally {
        setisLoading(false);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const backAction = () => {
      // Run your Redux action
      dispatch(setHomeActiveIndex(0));

      // If navigation can go back, just go back
      if (navigation.canGoBack()) {
        navigation.goBack();
      }

      // Always return true to prevent default exit behavior
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation, dispatch]);

  const toggleDaySelection = (day: string) => {
    if (selectedDay === day) {
      setSelectedDay(null); // Deselect if the same day is clicked
    } else {
      setSelectedDay(day); // Select the new day
    }
  };

  const renderNestedItem = ({item}: any) => {
    const isSelected = selectedPlan === item.allData?.plan_id;

    return (
      <View
        style={{
          gap: verticalScale(10),
        }}>
        <Pressable
          style={[
            styles.nestedItem,
            {
              backgroundColor: isSelected ? COLORS.skinColor : COLORS.brown,
            },
          ]}
          onPress={() => {
            if (isSelected) {
              setSelectedPlan(null);
              setSelectedDay(null); // Clear day when plan is deselected
            } else {
              setSelectedPlan(item.allData?.plan_id);
              setSelectedDay(null); // Clear day when new plan is selected
            }
          }}>
          <Image
            source={{uri: item.coverImage}}
            style={{height: 98, width: 148, borderRadius: 5}}
          />
          <View
            style={{
              flex: 1,
              padding: verticalScale(10),
              justifyContent: 'space-between',
            }}>
            <CustomText fontFamily="bold">
              {item.title || 'Unknown Exercise'}
            </CustomText>
            <View style={styles.tagContainer}>
              {(item.tags !== undefined && item.tags.length > 1
                ? item.tags
                : item.allData?.tags
                ? item.allData?.tags
                : item.allData.content.tags
              ).map((tag: string, index: number) => (
                <CustomText
                  key={index}
                  style={styles.tag}
                  fontFamily="italicBold"
                  fontSize={10}
                  color={COLORS.black}>
                  {tag.slice(0, 8)}
                </CustomText>
              ))}
            </View>
          </View>
        </Pressable>
        {isSelected && (
          <View
            style={{
              gap: verticalScale(10),
              marginVertical: verticalScale(5),
            }}>
            {item?.allData?.content?.workouts?.map(
              (section: any, sectionIndex: number) => {
                const isDaySelected = selectedDay === section.name;

                const totalExercises = section.exercises?.reduce(
                  (sum: any, item: any) =>
                    sum + (item.workout_exercises?.length || 0),
                  0,
                );

                return (
                  <TouchableOpacity
                    onPress={() => toggleDaySelection(section.name)}
                    key={sectionIndex?.toString()}
                    style={{
                      paddingHorizontal: horizontalScale(8),
                      paddingVertical: verticalScale(4),
                      backgroundColor: isDaySelected
                        ? COLORS.skinColor
                        : COLORS.brown,
                      borderRadius: 100,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: horizontalScale(10),
                      borderWidth: isDaySelected ? 1 : 0,
                      borderColor: COLORS.yellow,
                      width: wp(80),
                    }}>
                    <View
                      style={{
                        borderRadius: 100,
                        backgroundColor: section.color,
                        height: verticalScale(30),
                        width: verticalScale(30),
                      }}
                    />
                    <View>
                      <CustomText fontFamily="bold" fontSize={14}>
                        {section.name}
                      </CustomText>
                      <CustomText
                        fontFamily="italic"
                        fontSize={
                          12
                        }>{`${totalExercises} Exercises`}</CustomText>
                    </View>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        )}
      </View>
    );
  };

  const renderPlanList = () => {
    const activatedPlanIds = (userData?.activated_plan || []).map(
      (id: string | number) => Number(id),
    );

    const filteredPlans = planData?.filter(item =>
      activatedPlanIds.includes(Number(item.allData?.plan_id)),
    );

    return (
      <FlatList
        data={filteredPlans}
        renderItem={renderNestedItem}
        keyExtractor={item => item.id?.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: verticalScale(15),
        }}
        style={{
          flexGrow: 1,
        }}
      />
    );
  };

  const transformDayData = (dayData: any, selectedDay: string) => {
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
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.darkBrown,
        }}>
        <ActivityIndicator color={COLORS.yellow} size={30} />
      </View>
    );
  }

  const activatedPlanIds = (userData?.activated_plan || []).map(
    (id: string | number) => Number(id),
  );

  const filteredPlans = planData?.filter(item =>
    activatedPlanIds.includes(Number(item.allData?.plan_id)),
  );

  return (
    <View style={styles.main}>
      {filteredPlans && filteredPlans?.length > 0 ? (
        <View style={{gap: verticalScale(10), flex: 1}}>
          {renderPlanList()}
          <PrimaryButton
            title="Start Workout"
            onPress={() => {
              if (!selectedPlan || !selectedDay) return;

              const selectedProgram = planData?.find(
                item => item.allData?.plan_id === selectedPlan,
              );
              const transformedDayData = transformDayData(
                selectedProgram?.allData,
                selectedDay,
              );

              // Check if a workout is already in progress
              if (workoutProgress === 'inprogress') {
                if (
                  currentWorkout.planId === selectedPlan &&
                  currentWorkout.dayName === selectedDay
                ) {
                  // Same workout, allow continuing
                  navigation.navigate('workoutProgramDetails', {
                    programId: selectedPlan,
                    day: [transformedDayData],
                    selectedProgram: selectedProgram,
                  });
                  return;
                } else {
                  // Different workout, show alert
                  Alert.alert(
                    'Workout In Progress',
                    'Please finish your current workout before starting a new one.',
                  );
                  return;
                }
              }

              // No workout in progress, start new workout
              dispatch(setWorkoutProgress('inprogress'));
              dispatch(
                setCurrentWorkout({
                  planId: selectedPlan,
                  workoutName: selectedProgram?.title,
                  dayName: selectedDay,
                }),
              );

              workoutTimer.setInitial(0); // reset timer
              workoutTimer.start();

              navigation.navigate('workoutProgramDetails', {
                programId: selectedPlan,
                day: [transformedDayData],
                selectedProgram: selectedProgram,
              });
            }}
            disabled={!selectedPlan || !selectedDay} // Disable if no plan or day is selected
          />
        </View>
      ) : (
        <View
          style={{
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <CustomText color={COLORS.yellow} fontSize={18} fontFamily="bold">
            No Active Plan Found
          </CustomText>
        </View>
      )}
    </View>
  );
};

export default WorkoutMenu;

const styles = StyleSheet.create({
  main: {
    paddingHorizontal: horizontalScale(10),
    flex: 1,
    gap: verticalScale(20),
    marginVertical: verticalScale(10),
  },
  nestedItem: {
    flexDirection: 'row',
    gap: horizontalScale(10),
    borderRadius: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
  },
  tag: {
    backgroundColor: COLORS.whiteGreenish,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(8),
    borderRadius: 5,
  },
});
