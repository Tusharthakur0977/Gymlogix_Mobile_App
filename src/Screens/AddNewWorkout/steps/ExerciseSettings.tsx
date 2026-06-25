import React, {Dispatch, FC, SetStateAction, useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TimerPickerModal} from 'react-native-timer-picker';
import FONTS from '../../../Assets/fonts';
import ICONS from '../../../Assets/Icons';
import CustomIcon from '../../../Components/CustomIcon';
import {CustomText} from '../../../Components/CustomText';
import PrimaryButton from '../../../Components/PrimaryButton';
import {setActiveStep} from '../../../Redux/slices/newWorkoutSlice';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import COLORS from '../../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
  wp,
} from '../../../Utilities/Metrics';
import {Exercise} from '../../../Seeds/ExerciseCatalog';
import {updateExerciseSettings} from '../../../Redux/slices/exerciseCatalogSlice';

type LogType = 'Time' | 'Weight' | 'Distance';

const ExerciseSettings: FC<{
  selectedExercise: string | null;
  setSelectedExercise: Dispatch<SetStateAction<string | null>>;
}> = ({selectedExercise, setSelectedExercise}) => {
  const dispatch = useAppDispatch();
  const exerciseData = useAppSelector(state =>
    state.exerciseCatalog.catalog.categories
      .flatMap(category => category.exercises)
      .find(item => item.id === selectedExercise),
  );

  const [ExerciseSets, setExerciseSets] = useState('');
  const [ExerciseReps, setExerciseReps] = useState('');
  const [ExerciseLogging, setExerciseLogging] = useState<LogType[]>([]);

  const [WarmUpTime, setWarmUpTime] = useState('Auto');
  const [WorkingSetTime, setWorkingSetTime] = useState('Auto');
  const [FinishExerciseTime, setFinishExerciseTime] = useState('Auto');

  const [isTimePickerModalVisible, setIsTimePickerModalVisible] = useState(0);

  const [alternateExercise, setAlternateExercise] = useState<string | null>(
    null,
  );

  const toggleLogging = (type: LogType) => {
    setExerciseLogging(prev => {
      if (prev.includes(type)) {
        return prev.filter(item => item !== type); // remove
      }
      return [...prev, type]; // add
    });
  };

  const alternateExerciseDatausingId = useAppSelector(state =>
    state.exerciseCatalog.catalog.categories
      .flatMap(category => category.exercises)
      .find(item => item.id === alternateExercise),
  );

  const formatTime = ({
    hours,
    minutes,
    seconds,
  }: {
    hours?: number;
    minutes?: number;
    seconds?: number;
  }) => {
    const timeParts = [];
    if (minutes !== undefined) {
      timeParts.push(minutes.toString().padStart(2, '0'));
    }
    if (seconds !== undefined) {
      timeParts.push(seconds.toString().padStart(2, '0'));
    }

    return timeParts.join(':');
  };

  useEffect(() => {
    if (exerciseData) {
      const savedLogging = exerciseData.exerciseSettings?.loggingType;
      setExerciseSets(exerciseData.exerciseSettings?.sets?.toString() ?? '');
      setExerciseReps(exerciseData.exerciseSettings?.reps?.toString() ?? '');
      setExerciseLogging(
        Array.isArray(savedLogging)
          ? savedLogging
          : savedLogging
          ? [savedLogging]
          : [],
      );
      setWarmUpTime(exerciseData.exerciseSettings?.timing?.warmUp ?? 'Auto');
      setWorkingSetTime(
        exerciseData.exerciseSettings?.timing?.workingSet ?? 'Auto',
      );
      setFinishExerciseTime(
        exerciseData.exerciseSettings?.timing?.finishExercise ?? 'Auto',
      );
      setAlternateExercise(
        exerciseData.exerciseSettings?.alternateExercise ?? null,
      );
    }
  }, [exerciseData?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{
          uri:
            exerciseData?.coverImage !== null
              ? exerciseData?.coverImage?.uri
              : 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
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
              onPress={() => dispatch(setActiveStep(8))}
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
                {exerciseData?.name}
              </CustomText>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
      <View
        style={{
          padding: horizontalScale(10),
          gap: verticalScale(20),
        }}>
        <View
          style={{
            gap: verticalScale(30),
            backgroundColor: COLORS.brown,
            padding: verticalScale(10),
            borderRadius: 10,
            alignItems: 'center',
          }}>
          <CustomText fontSize={20} fontFamily="bold" color={COLORS.yellow}>
            Strategy
          </CustomText>
          <CustomText
            fontSize={15}
            fontFamily="italic"
            color={COLORS.whiteTail}>
            Set the strategy of your exercise
          </CustomText>

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{alignItems: 'center', gap: verticalScale(5)}}>
              <TextInput
                value={ExerciseSets}
                onChangeText={setExerciseSets}
                style={{
                  padding: verticalScale(10),
                  fontSize: responsiveFontSize(36),
                  borderWidth: 1,
                  borderRadius: 5,
                  borderColor: COLORS.whiteTail,
                  minWidth: horizontalScale(72),
                  maxWidth: horizontalScale(120),
                  width: horizontalScale(72),
                  height: verticalScale(72),
                  textAlign: 'center',
                  color: COLORS.whiteTail,
                  fontFamily: FONTS['bold'],
                }}
                keyboardType="numeric"
              />
              <CustomText fontSize={12} fontFamily="italic">
                Sets
              </CustomText>
            </View>
            <View
              style={{
                bottom: verticalScale(12),
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: horizontalScale(50),
                  height: 1,
                  backgroundColor: COLORS.whiteTail,
                }}
              />
              <CustomText
                color={COLORS.whiteTail}
                fontSize={24}
                fontFamily="bold"
                style={{bottom: 3, marginHorizontal: 2}}>
                x
              </CustomText>
              <View
                style={{
                  width: horizontalScale(50),
                  height: 1,
                  backgroundColor: COLORS.whiteTail,
                }}
              />
            </View>
            <View style={{alignItems: 'center', gap: verticalScale(5)}}>
              <TextInput
                value={ExerciseReps}
                onChangeText={setExerciseReps}
                style={{
                  padding: verticalScale(10),
                  fontSize: responsiveFontSize(36),
                  borderWidth: 1,
                  borderRadius: 5,
                  borderColor: COLORS.whiteTail,
                  minWidth: horizontalScale(72),
                  maxWidth: horizontalScale(120),
                  height: verticalScale(72),
                  width: horizontalScale(72),
                  textAlign: 'center',
                  color: COLORS.whiteTail,
                  fontFamily: FONTS['bold'],
                }}
              />
              <CustomText fontSize={12} fontFamily="italic">
                Reps
              </CustomText>
            </View>
          </View>
        </View>
        <View
          style={{
            gap: verticalScale(30),
            backgroundColor: COLORS.brown,
            padding: verticalScale(10),
            borderRadius: 10,
            alignItems: 'center',
          }}>
          <CustomText fontSize={20} fontFamily="bold" color={COLORS.yellow}>
            Log
          </CustomText>
          <CustomText
            fontSize={15}
            fontFamily="italic"
            color={COLORS.whiteTail}>
            What would you like to log for this exercise
          </CustomText>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              width: '100%',
            }}>
            {[
              {icon: ICONS.LogTimeIcon, label: 'Time'},
              {icon: ICONS.LogWeightIcon, label: 'Weight'},
              {icon: ICONS.LogDistanceIcon, label: 'Distance'},
            ].map(item => {
              const selected = ExerciseLogging.includes(item.label as LogType);

              console.log('EXRECSEE', ExerciseLogging);
              return (
                <TouchableOpacity
                  onPress={() => toggleLogging(item.label as LogType)}
                  key={item.label}
                  style={{
                    alignItems: 'center',
                    gap: verticalScale(10),
                    borderRadius: 20,
                    borderColor: selected ? COLORS.whiteTail : 'transparent',
                    borderWidth: 1,
                    padding: verticalScale(15),
                  }}>
                  <CustomIcon
                    Icon={item.icon}
                    height={verticalScale(70)}
                    width={verticalScale(70)}
                  />
                  <CustomText fontSize={14} fontFamily="bold">
                    {item.label}
                  </CustomText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View
          style={{
            gap: verticalScale(30),
            backgroundColor: COLORS.brown,
            padding: verticalScale(10),
            borderRadius: 10,
            alignItems: 'center',
          }}>
          <CustomText fontSize={20} fontFamily="bold" color={COLORS.yellow}>
            Timing
          </CustomText>
          <CustomText
            fontSize={15}
            fontFamily="italic"
            color={COLORS.whiteTail}>
            Set timing strategy for the exercise
          </CustomText>

          <View
            style={{
              width: '100%',
              paddingHorizontal: horizontalScale(15),
              gap: verticalScale(10),
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <CustomText color={COLORS.whiteTail} fontFamily="bold">
                Warm up reset time
              </CustomText>
              <CustomText onPress={() => setIsTimePickerModalVisible(1)}>
                {WarmUpTime}
              </CustomText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <CustomText color={COLORS.whiteTail} fontFamily="bold">
                Working set reset time
              </CustomText>
              <CustomText onPress={() => setIsTimePickerModalVisible(2)}>
                {WorkingSetTime}
              </CustomText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <CustomText color={COLORS.whiteTail} fontFamily="bold">
                Finish exercise rest time
              </CustomText>
              <CustomText onPress={() => setIsTimePickerModalVisible(3)}>
                {FinishExerciseTime}
              </CustomText>
            </View>
          </View>
          <TimerPickerModal
            visible={
              isTimePickerModalVisible === 1 ||
              isTimePickerModalVisible === 2 ||
              isTimePickerModalVisible === 3
            }
            setIsVisible={() => {
              setIsTimePickerModalVisible(0);
            }}
            modalTitle="Set Time"
            onCancel={() => setIsTimePickerModalVisible(0)}
            onConfirm={selectedDate => {
              const formattedTime = formatTime(selectedDate);
              if (isTimePickerModalVisible === 1) {
                setWarmUpTime(formattedTime);
              } else if (isTimePickerModalVisible === 2) {
                setWorkingSetTime(formattedTime);
              } else if (isTimePickerModalVisible === 3) {
                setFinishExerciseTime(formattedTime);
              }
              setIsTimePickerModalVisible(0);
            }}
            closeOnOverlayPress
            modalProps={{
              overlayOpacity: 0.7,
            }}
            hideHours
          />
        </View>
        <View
          style={{
            gap: verticalScale(30),
            backgroundColor: COLORS.brown,
            padding: verticalScale(10),
            borderRadius: 10,
            alignItems: 'center',
          }}>
          <CustomText fontSize={20} fontFamily="bold" color={COLORS.yellow}>
            Alternative Exercise
          </CustomText>
          <CustomText
            fontSize={15}
            fontFamily="italic"
            color={COLORS.whiteTail}>
            Substitute exercise
          </CustomText>

          {exerciseData?.exerciseSettings?.alternateExercise &&
            alternateExerciseDatausingId && (
              <View
                key={alternateExerciseDatausingId.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderRadius: verticalScale(10),
                  backgroundColor: COLORS.lightBrown,
                  padding: verticalScale(5),
                  borderWidth: 1,
                  borderColor: COLORS.white,
                }}>
                <Image
                  source={{
                    uri: alternateExerciseDatausingId.coverImage?.uri,
                  }}
                  style={{
                    height: '100%',
                    minHeight: 71,
                    width: 66,
                    borderRadius: 10,
                    resizeMode: 'cover',
                  }}
                />
                <View
                  style={{
                    paddingHorizontal: horizontalScale(10),
                    justifyContent: 'flex-start',
                    gap: verticalScale(5),
                    paddingVertical: verticalScale(4),
                    flex: 1,
                  }}>
                  <CustomText
                    color={COLORS.yellow}
                    fontFamily="medium"
                    fontSize={12}>
                    {alternateExerciseDatausingId.name}
                  </CustomText>
                  <CustomText
                    color={COLORS.white}
                    fontFamily="medium"
                    fontSize={12}>
                    {`${alternateExerciseDatausingId.recommendedSets} sets x ${alternateExerciseDatausingId.recommendedReps} reps`}
                  </CustomText>
                </View>
                <TouchableOpacity
                  style={{justifyContent: 'center'}}
                  onPress={
                    event => {}
                    // handleExerciseMenuPress(event, exercise, dayId)
                  }>
                  <CustomIcon
                    Icon={ICONS.SidMultiDotView}
                    height={verticalScale(27)}
                  />
                </TouchableOpacity>
              </View>
            )}

          {!exerciseData?.exerciseSettings?.alternateExercise && (
            <PrimaryButton
              title="Add"
              onPress={() => {
                dispatch(setActiveStep(11));
              }}
              isFullWidth={false}
              style={{
                alignSelf: 'flex-end',
                width: 'auto',
                paddingHorizontal: horizontalScale(20),
                paddingVertical: verticalScale(5),
                borderRadius: verticalScale(5),
              }}
              backgroundColor={COLORS.darkPink}
            />
          )}
        </View>

        <PrimaryButton
          title="Save Settings"
          onPress={() => {
            dispatch(
              updateExerciseSettings({
                id: selectedExercise!,
                settings: {
                  sets: parseInt(ExerciseSets),
                  reps: parseInt(ExerciseReps),
                  loggingType: ExerciseLogging,
                  timing: {
                    warmUp: WarmUpTime,
                    workingSet: WorkingSetTime,
                    finishExercise: FinishExerciseTime,
                  },
                  alternateExercise:
                    exerciseData?.exerciseSettings?.alternateExercise,
                },
              }),
            );
            dispatch(setActiveStep(8));
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ExerciseSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBrown,
  },
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
