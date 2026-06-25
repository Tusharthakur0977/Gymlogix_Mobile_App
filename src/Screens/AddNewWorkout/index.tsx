import React, {FC, useCallback, useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import IMAGES from '../../Assets/Images';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import UploadImageOptions from '../../Components/Modals/UploadImageOptions';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  ExerciseListItem,
  resetNewWorkoutSlice,
  setActiveStep,
  setWorkoutData,
} from '../../Redux/slices/newWorkoutSlice';
import {saveWorkout} from '../../Redux/slices/savedWorkoutsSlice';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import {AddNewWorkoutScreenProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {hp, verticalScale, wp} from '../../Utilities/Metrics';
import AddNewExercise from './steps/AddNewExercise';
import SelectExercise from './steps/SelectExercise';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6 from './steps/Step6';
import WorkroutDataScreen from './steps/WorkroutDataScreen';
import {KeyboardAvoidingContainer} from '../../Components/KeyboardAvoidingComponent';
import ExerciseSettings from './steps/ExerciseSettings';
import SelectAlternateExercise from './steps/SelectAlternateExercise';
import {fetchData, postData, postFormData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';
import {setPlanData} from '../../Redux/slices/PlanDataSlice';
import {
  getLocalStorageData,
  storeLocalStorageData,
} from '../../Utilities/Storage';
import STORAGE_KEYS from '../../Utilities/Constants';
import {useFocusEffect} from '@react-navigation/native';
import {setHomeActiveIndex} from '../../Redux/slices/initialSlice';

const AddNewWorkout: FC<AddNewWorkoutScreenProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {workoutData, activeStep} = useAppSelector(state => state.newWorkout);
  const [fileData, setFileData] = useState<any | null>(null);

  const [isUploadOptionModal, setIsUploadOptionModal] = useState(false);

  const [selectedDayForAddExercise, setSelectedDayForAddExercise] =
    useState<ExerciseListItem | null>(null);

  const closeModal = () => {
    setIsUploadOptionModal(false);
  };

  const [selectedExerciseForSettingsStep, setSelectedExerciseForSettingsStep] =
    useState<string | null>(null);

  const handleImagePick = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.5}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];

        const formData = new FormData();
        const imageData = asset;
        formData.append('asset', {
          uri: imageData.uri,
          type: imageData.type,
          name: imageData.fileName,
        });

        const image_response = await postFormData<any>(
          ENDPOINTS.uploadFile,
          formData,
        );
        console.log('image response ---->', image_response);

        if (image_response.data) {
          const get_Image_Url = image_response.data.url;

          if (get_Image_Url) {
            setFileData(get_Image_Url);
          }
        }
        dispatch(
          setWorkoutData({
            ...workoutData,
            coverImage: fileData ? fileData : asset,
          }),
        );
      }
      closeModal();
    });
  };

  const handleCameraPick = async () => {
    try {
      const result = await launchCamera({
        quality: 0.5,
        mediaType: 'photo',
      });

      if (result.didCancel) {
        console.log('User cancelled camera');
      } else if (result.errorCode) {
        console.log('Camera error:', result.errorMessage);
      } else if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        const formData = new FormData();
        const imageData = asset;
        formData.append('asset', {
          uri: imageData.uri,
          type: imageData.type,
          name: imageData.fileName,
        });

        const image_response = await postFormData<any>(
          ENDPOINTS.uploadFile,
          formData,
        );
        console.log('image response ---->', image_response);

        if (image_response.data) {
          const get_Image_Url = image_response.data.url;

          if (get_Image_Url) {
            setFileData(get_Image_Url);
          }
        }
        dispatch(
          setWorkoutData({
            ...workoutData,
            coverImage: fileData ? fileData : asset,
          }),
        );
      }
      closeModal();
    } catch (error) {
      console.log('Camera capture failed:', error);
    }
  };

  const isNextButtonDisabled = () => {
    switch (activeStep) {
      case 1:
        return !workoutData.name.trim();
      case 2:
        return !workoutData.goal;
      case 3:
        return !workoutData.location;
      case 4:
        return !workoutData.instruction.trim();
      case 5:
        return workoutData.durationInWeeks === 0;
      default:
        return false;
    }
  };

  const renderSteps = () => {
    switch (activeStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      case 6:
        return <Step6 />;
      case 7:
        return (
          <WorkroutDataScreen
            selectedDayForAddExercise={selectedDayForAddExercise}
            setSelectedDayForAddExercise={setSelectedDayForAddExercise}
          />
        );
      case 8:
        return (
          <SelectExercise
            selectedDayForAddExercise={selectedDayForAddExercise}
            setSelectedExerciseForSettingsStep={
              setSelectedExerciseForSettingsStep
            }
          />
        );
      case 9:
        return <AddNewExercise />;
      case 10:
        return (
          <ExerciseSettings
            selectedExercise={selectedExerciseForSettingsStep}
            setSelectedExercise={setSelectedExerciseForSettingsStep}
          />
        );
      case 11:
        return (
          <SelectAlternateExercise
            selectedExercise={selectedExerciseForSettingsStep}
          />
        );
    }
  };

  const isScrollEnabled = activeStep === 8 ? false : true;

  const toMinutesDecimal = (seconds: number): number => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return parseFloat((minutes + remainingSeconds / 60).toFixed(2));
  };

  // Existing function to convert MM:SS string to seconds
  const toSeconds = (timeStr: string | undefined) => {
    if (!timeStr) return 0;
    const [min, sec] = timeStr.split(':').map(Number);
    return min * 60 + sec;
  };

  const createNewWorkout = async () => {
    let difficultyText = 'beginner';

    if (workoutData.difficulty >= 1.5 && workoutData.difficulty < 2.5) {
      difficultyText = 'intermediate';
    } else if (workoutData.difficulty >= 2.5) {
      difficultyText = 'advance';
    }

    const data = {
      name: workoutData.name, //must be included
      image_url: fileData,
      type: 'workout', //must be included, can be food or workout
      content: {
        //must be included, can be empty   check the database for full structure of food and workout
        details: workoutData.instruction,
        instructions: workoutData.instruction,
        days_per_week: workoutData.daysInWeek.toString(),
        type: workoutData.goal,
        location: workoutData.location,
        duration: workoutData.durationInWeeks.toString(),
        difficulty: difficultyText,
        workouts: workoutData.exerciseList.map(item => ({
          workout_id: Number(item.id),
          name: item.dayName,
          color: item.color,
          rest_period: item.restPeriod,
          comments: '',
          exercises: [
            {
              type: item.exercise[0]?.type,
              workout_exercises: item.exercise.map((ex: any) => ({
                exercise_id: Number(ex.id),
                sets: ex.exerciseSettings?.sets ?? 0,
                reps: ex.exerciseSettings?.reps ?? 0,
                timing_warmup: toMinutesDecimal(
                  toSeconds(ex.exerciseSettings?.timing?.warmUp),
                ),
                timing_workset: toMinutesDecimal(
                  toSeconds(ex.exerciseSettings?.timing?.workingSet),
                ),
                timing_finish: toMinutesDecimal(
                  toSeconds(ex.exerciseSettings?.timing?.finishExercise),
                ),
                Is_time: ex.exerciseSettings?.loggingType?.includes('Time')
                  ? true
                  : false,
                is_weight: ex.exerciseSettings?.loggingType?.includes('Weight')
                  ? true
                  : false,
                Is_distance: ex.exerciseSettings?.loggingType?.includes(
                  'Distance',
                )
                  ? true
                  : false,
                alternate_exercise_id: ex.exerciseSettings?.alternateExercise
                  ? [ex.exerciseSettings?.alternateExercise]
                  : [],
              })),
            },
          ],
        })),
        tags: ['gym', 'trending'],
      },
    };

    try {
      const response = await postData<any>(ENDPOINTS.create_plan, {data});
      console.log('new workout --->', response);
      if (response?.data?.data) {
        const newPlan = response.data.data;
        console.log('NEWWWWWWWW--->', newPlan);

        // Save locally
        const existing =
          (await getLocalStorageData(STORAGE_KEYS.localWorkoutData)) || [];
        const updated = [...existing.filter(Boolean), newPlan];
        await storeLocalStorageData(STORAGE_KEYS.localWorkoutData, updated);

        // Dispatch updated plan list

        // console.log(
        //   'Updateddddddddddddd',
        //   updated.map(item => ({
        //     id: item._id ? item._id : '',
        //     planId: item.plan_id,
        //     title: item.name || '',
        //     coverImage:
        //       item.image_url ||
        //       'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=1598&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        //     tags: item.content?.tags,
        //     type: item.type === 'workout' ? 'workout' : 'food',
        //     allData: item,
        //   })),
        // );

        dispatch(
          setPlanData(
            updated.map(item => ({
              id: item.id ? item.id : '',
              planId: item.plan_id,
              title: item.name || '',
              coverImage:
                item.image_url ||
                'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=1598&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              tags: item.content?.tags,
              type: item.type === 'workout' ? 'workout' : 'food',
              allData: item,
            })),
          ),
        );

        dispatch(resetNewWorkoutSlice());
        navigation.navigate('tabs', {
          screen: 'PLAN',
        });
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // If we are inside steps, go back step-by-step
        if (activeStep > 1) {
          dispatch(setActiveStep(activeStep - 1));
          return true; // ⛔ prevent default back behavior
        }

        // If first step → allow normal back
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }, [activeStep]),
  );

  return (
    <View style={styles.main}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingContainer
          backgroundColor="transparent"
          scrollEnabled={isScrollEnabled}>
          {activeStep < 8 && (
            <ImageBackground
              source={
                workoutData.coverImage ? {uri: fileData} : IMAGES.exerciseDummy
              }
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
                      if (activeStep === 1) {
                        navigation.goBack();
                      } else {
                        dispatch(setActiveStep(activeStep - 1));
                      }
                    }}
                    Icon={ICONS.BackArrow}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: wp(90),
                    }}>
                    <CustomText color={COLORS.white} fontSize={18}>
                      {workoutData.name ? workoutData.name : 'New Exercise'}
                    </CustomText>
                    {activeStep === 7 ? (
                      <CustomIcon
                        onPress={() => dispatch(setActiveStep(1))}
                        Icon={ICONS.smallSettingIcon}
                        height={24}
                        width={24}
                      />
                    ) : (
                      <CustomIcon
                        onPress={() => setIsUploadOptionModal(true)}
                        Icon={ICONS.EditIcon}
                        height={24}
                        width={24}
                      />
                    )}
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          )}
          {renderSteps()}

          {activeStep < 8 && (
            <View
              style={{
                paddingVertical: verticalScale(20),
              }}>
              <PrimaryButton
                title={activeStep === 7 ? 'Save Workout' : 'Next'}
                onPress={() => {
                  if (activeStep === 7) {
                    // Save the workout
                    createNewWorkout();

                    // return;
                    // Show success message
                  } else {
                    // Continue to next step
                    dispatch(setActiveStep(activeStep + 1));
                  }
                }}
                disabled={isNextButtonDisabled()}
              />
              {activeStep > 1 && activeStep < 7 && (
                <PrimaryButton
                  title="Skip"
                  onPress={() => {
                    dispatch(setActiveStep(activeStep + 1));
                  }}
                  backgroundColor={'transparent'}
                  textColor={COLORS.white}
                  style={{alignSelf: 'center'}}
                />
              )}
            </View>
          )}
        </KeyboardAvoidingContainer>
      </SafeAreaView>
      {isUploadOptionModal && (
        <UploadImageOptions
          closeModal={closeModal}
          isModalVisible={isUploadOptionModal}
          onPressCamera={handleCameraPick}
          onPressGallery={handleImagePick}
        />
      )}
    </View>
  );
};

export default AddNewWorkout;

const styles = StyleSheet.create({
  main: {
    backgroundColor: COLORS.darkBrown,
    flex: 1,
    paddingBottom: verticalScale(5),
  },
  safeArea: {flex: 1, gap: verticalScale(10)},
  coverImage: {
    height: hp(20),
    justifyContent: 'flex-end',
  },
  coverImageStyle: {
    borderRadius: 10,
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: verticalScale(10),
    paddingVertical: verticalScale(20),
    paddingHorizontal: verticalScale(10),
  },
});
