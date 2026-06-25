import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TimerPickerModal} from 'react-native-timer-picker';
import FONTS from '../../Assets/fonts';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  selectAllExercises,
  updateAlternateExerciseInSettings,
  updateExerciseSettings,
} from '../../Redux/slices/exerciseCatalogSlice';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import {ExerciseSettingsScreenProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';

const ExerciseSettings: React.FC<ExerciseSettingsScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useAppDispatch();
  const {exerciseId} = route.params;

  // Find exercise in both catalog and custom exercises
  const exerciseData = useAppSelector(state => {
    const catalogExercises = state.exerciseCatalog.catalog.categories.flatMap(
      category => category.exercises,
    );
    const customExercises = state.exerciseCatalog.customExercises;
    const allExercises = [...catalogExercises, ...customExercises];
    return allExercises.find(item => item.id === exerciseId);
  });

  const [exerciseSets, setExerciseSets] = useState('');
  const [exerciseReps, setExerciseReps] = useState('');
  type LoggingType = 'Time' | 'Weight' | 'Distance';

  const [exerciseLogging, setExerciseLogging] = useState<LoggingType[]>([]);

  const [warmUpTime, setWarmUpTime] = useState('60');
  const [workingSetTime, setWorkingSetTime] = useState('90');
  const [finishExerciseTime, setFinishExerciseTime] = useState('120');

  const [isTimePickerModalVisible, setIsTimePickerModalVisible] = useState(0);
  const [showAlternateExerciseModal, setShowAlternateExerciseModal] =
    useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Get all exercises for alternate exercise selection
  const allExercises = useAppSelector(selectAllExercises);

  // Get current alternate exercise data
  const alternateExerciseData = useAppSelector(state => {
    if (!exerciseData?.exerciseSettings?.alternateExercise) return null;
    const catalogExercises = state.exerciseCatalog.catalog.categories.flatMap(
      category => category.exercises,
    );
    const customExercises = state.exerciseCatalog.customExercises;
    const allExercises = [...catalogExercises, ...customExercises];
    return allExercises.find(
      item => item.id === exerciseData.exerciseSettings?.alternateExercise,
    );
  });

  const formatTime = ({
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
    if (exerciseData && !isFormInitialized) {
      // Only initialize if the exerciseSettings has meaningful values
      const hasRealSettings =
        exerciseData.exerciseSettings &&
        exerciseData.exerciseSettings.sets &&
        exerciseData.exerciseSettings.reps &&
        exerciseData.exerciseSettings.sets > 0 &&
        exerciseData.exerciseSettings.reps > 0;

      if (hasRealSettings) {
        const savedLogging = exerciseData.exerciseSettings?.loggingType;
        setExerciseSets(exerciseData.exerciseSettings!.sets!.toString());
        setExerciseReps(exerciseData.exerciseSettings!.reps!.toString());
        setExerciseLogging(
          Array.isArray(savedLogging)
            ? savedLogging
            : savedLogging
            ? [savedLogging]
            : [],
        );
        setWarmUpTime(exerciseData.exerciseSettings!.timing?.warmUp || '60');
        setWorkingSetTime(
          exerciseData.exerciseSettings!.timing?.workingSet || '90',
        );
        setFinishExerciseTime(
          exerciseData.exerciseSettings!.timing?.finishExercise || '120',
        );
      } else {
        // Use recommended values or sensible defaults
        setExerciseSets(exerciseData.recommendedSets?.toString() || '3');
        setExerciseReps(exerciseData.recommendedReps?.toString() || '10');
        setExerciseLogging([]);
        setWarmUpTime('60');
        setWorkingSetTime('90');
        setFinishExerciseTime('120');
      }
      setIsFormInitialized(true);
    }
  }, [exerciseData, isFormInitialized]); // Only run when exerciseData is available and form is not initialized

  const handleSaveSettings = () => {
    if (!exerciseData) return;

    dispatch(
      updateExerciseSettings({
        id: exerciseId,
        settings: {
          sets: parseInt(exerciseSets) || 3,
          reps: parseInt(exerciseReps) || 10,
          loggingType: exerciseLogging,
          timing: {
            warmUp: warmUpTime,
            workingSet: workingSetTime,
            finishExercise: finishExerciseTime,
          },
          alternateExercise: alternateExerciseData?.id,
        },
      }),
    );

    navigation.goBack();
  };
  const toggleLogging = (type: LoggingType) => {
    setExerciseLogging(prev => {
      if (prev.includes(type)) {
        return prev.filter(item => item !== type); // remove
      }
      return [...prev, type]; // add
    });
  };

  if (!exerciseData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <CustomText color={COLORS.white} fontSize={18}>
            Exercise not found
          </CustomText>
          <PrimaryButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{uri: exerciseData?.coverImage?.uri}}
        style={styles.coverImage}
        imageStyle={styles.coverImageStyle}>
        <LinearGradient
          colors={['rgba(0,0,0,0)', '#1F1A16']}
          style={styles.gradient}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}>
          <View style={styles.headerContainer}>
            <CustomIcon
              onPress={() => navigation.goBack()}
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Strategy Section */}
        <View style={styles.settingsCard}>
          <CustomText fontSize={20} fontFamily="bold" color={COLORS.yellow}>
            Strategy
          </CustomText>
          <CustomText
            fontSize={15}
            fontFamily="italic"
            color={COLORS.whiteTail}>
            Set the strategy of your exercise
          </CustomText>

          <View style={styles.strategyContainer}>
            <View style={styles.inputGroup}>
              <TextInput
                value={exerciseSets}
                onChangeText={setExerciseSets}
                style={styles.strategyInput}
                keyboardType="numeric"
              />
              <CustomText fontSize={12} fontFamily="italic">
                Sets
              </CustomText>
            </View>
            <View style={styles.strategyDivider}>
              <View style={styles.strategyLine} />
              <CustomText
                color={COLORS.whiteTail}
                fontSize={24}
                fontFamily="bold"
                style={styles.multiplySign}>
                x
              </CustomText>
              <View style={styles.strategyLine} />
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                value={exerciseReps}
                onChangeText={setExerciseReps}
                style={styles.strategyInput}
                keyboardType="numeric"
              />
              <CustomText fontSize={12} fontFamily="italic">
                Reps
              </CustomText>
            </View>
          </View>
        </View>

        {/* Logging Section */}
        <View style={styles.settingsCard}>
          <CustomText fontSize={20} fontFamily="bold" color={COLORS.yellow}>
            Log
          </CustomText>
          <CustomText
            fontSize={15}
            fontFamily="italic"
            color={COLORS.whiteTail}>
            What would you like to log for this exercise
          </CustomText>

          <View style={styles.loggingContainer}>
            {[
              {icon: ICONS.LogTimeIcon, label: 'Time'},
              {icon: ICONS.LogWeightIcon, label: 'Weight'},
              {icon: ICONS.LogDistanceIcon, label: 'Distance'},
            ].map(item => (
              <TouchableOpacity
                onPress={() => toggleLogging(item.label as LoggingType)}
                key={item.label}
                style={[
                  styles.loggingOption,
                  {
                    borderColor: exerciseLogging.includes(
                      item.label as LoggingType,
                    )
                      ? COLORS.whiteTail
                      : 'transparent',
                  },
                ]}>
                <CustomIcon
                  Icon={item.icon}
                  height={verticalScale(70)}
                  width={verticalScale(70)}
                />
                <CustomText fontSize={14} fontFamily="bold">
                  {item.label}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timing Section */}
        <View style={styles.settingsCard}>
          <CustomText fontSize={20} fontFamily="bold" color={COLORS.yellow}>
            Timing
          </CustomText>
          <CustomText
            fontSize={15}
            fontFamily="italic"
            color={COLORS.whiteTail}>
            Set timing strategy for the exercise
          </CustomText>

          <View style={styles.timingContainer}>
            <View style={styles.timingRow}>
              <CustomText color={COLORS.whiteTail} fontFamily="bold">
                Warm up rest time
              </CustomText>
              <TouchableOpacity onPress={() => setIsTimePickerModalVisible(1)}>
                <CustomText color={COLORS.whiteTail}>{warmUpTime}</CustomText>
              </TouchableOpacity>
            </View>
            <View style={styles.timingRow}>
              <CustomText color={COLORS.whiteTail} fontFamily="bold">
                Working set rest time
              </CustomText>
              <TouchableOpacity onPress={() => setIsTimePickerModalVisible(2)}>
                <CustomText color={COLORS.whiteTail}>
                  {workingSetTime}
                </CustomText>
              </TouchableOpacity>
            </View>
            <View style={styles.timingRow}>
              <CustomText color={COLORS.whiteTail} fontFamily="bold">
                Finish exercise rest time
              </CustomText>
              <TouchableOpacity onPress={() => setIsTimePickerModalVisible(3)}>
                <CustomText color={COLORS.whiteTail}>
                  {finishExerciseTime}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Alternative Exercise Section */}
        <View style={styles.settingsCard}>
          <CustomText fontSize={20} fontFamily="bold" color={COLORS.yellow}>
            Alternative Exercise
          </CustomText>
          <CustomText
            fontSize={15}
            fontFamily="italic"
            color={COLORS.whiteTail}>
            Substitute exercise
          </CustomText>

          {alternateExerciseData ? (
            <View style={styles.alternateExerciseCard}>
              <Image
                source={{
                  uri:
                    alternateExerciseData.coverImage?.uri ||
                    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
                }}
                style={styles.alternateExerciseImage}
              />
              <View style={styles.alternateExerciseContent}>
                <CustomText
                  color={COLORS.yellow}
                  fontFamily="medium"
                  fontSize={12}>
                  {alternateExerciseData.name}
                </CustomText>
                <CustomText
                  color={COLORS.white}
                  fontFamily="medium"
                  fontSize={12}>
                  {`${alternateExerciseData.recommendedSets || 3} sets x ${
                    alternateExerciseData.recommendedReps || 10
                  } reps`}
                </CustomText>
              </View>
              <TouchableOpacity
                style={styles.removeAlternateButton}
                onPress={() => {
                  dispatch(
                    updateAlternateExerciseInSettings({
                      id: exerciseId,
                      alternateExercise: undefined,
                    }),
                  );
                }}>
                <CustomIcon Icon={ICONS.CrossIcon} height={16} width={16} />
              </TouchableOpacity>
            </View>
          ) : (
            <PrimaryButton
              title="Add"
              onPress={() => setShowAlternateExerciseModal(true)}
              isFullWidth={false}
              style={styles.addAlternateButton}
              backgroundColor={COLORS.darkPink}
            />
          )}
        </View>

        <PrimaryButton
          title="Save Settings"
          onPress={handleSaveSettings}
          disabled={
            !exerciseSets.trim() ||
            !exerciseReps.trim() ||
            isNaN(parseInt(exerciseSets)) ||
            isNaN(parseInt(exerciseReps))
          }
        />
      </ScrollView>

      {/* Timer Picker Modal */}
      <TimerPickerModal
        visible={
          isTimePickerModalVisible === 1 ||
          isTimePickerModalVisible === 2 ||
          isTimePickerModalVisible === 3
        }
        setIsVisible={() => setIsTimePickerModalVisible(0)}
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

      {/* Alternate Exercise Selection Modal */}
      <Modal
        visible={showAlternateExerciseModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <CustomText fontSize={18} fontFamily="bold" color={COLORS.white}>
              Select Alternate Exercise
            </CustomText>
            <TouchableOpacity
              onPress={() => setShowAlternateExerciseModal(false)}
              style={styles.closeButton}>
              <CustomIcon Icon={ICONS.CrossIcon} height={20} width={20} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={allExercises.filter(exercise => exercise.id !== exerciseId)} // Exclude current exercise
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.exerciseSelectItem}
                onPress={() => {
                  dispatch(
                    updateAlternateExerciseInSettings({
                      id: exerciseId,
                      alternateExercise: item.id,
                    }),
                  );
                  setShowAlternateExerciseModal(false);
                }}>
                <Image
                  source={{
                    uri:
                      item.coverImage?.uri ||
                      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
                  }}
                  style={styles.exerciseSelectImage}
                />
                <View style={styles.exerciseSelectContent}>
                  <CustomText
                    color={COLORS.yellow}
                    fontFamily="medium"
                    fontSize={14}>
                    {item.name}
                  </CustomText>
                  <CustomText
                    color={COLORS.whiteTail}
                    fontFamily="regular"
                    fontSize={12}>
                    {item.mainMuscle} • {item.equipment}
                  </CustomText>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.exerciseSelectList}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBrown,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(20),
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
  headerContent: {
    flex: 1,
  },
  scrollContent: {
    padding: horizontalScale(10),
    gap: verticalScale(20),
  },
  settingsCard: {
    gap: verticalScale(30),
    backgroundColor: COLORS.brown,
    padding: verticalScale(15),
    borderRadius: 10,
    alignItems: 'center',
  },
  strategyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    alignItems: 'center',
    gap: verticalScale(5),
  },
  strategyInput: {
    padding: verticalScale(10),
    fontSize: responsiveFontSize(36),
    borderWidth: 1,
    borderRadius: 5,
    borderColor: COLORS.whiteTail,
    width: horizontalScale(72),
    textAlign: 'center',
    color: COLORS.whiteTail,
    fontFamily: FONTS['bold'],
  },
  strategyDivider: {
    bottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  strategyLine: {
    width: horizontalScale(50),
    height: 1,
    backgroundColor: COLORS.whiteTail,
  },
  multiplySign: {
    bottom: 3,
    marginHorizontal: 2,
  },
  loggingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  loggingOption: {
    alignItems: 'center',
    gap: verticalScale(10),
    borderRadius: 20,
    borderWidth: 1,
    padding: verticalScale(15),
  },
  timingContainer: {
    width: '100%',
    paddingHorizontal: horizontalScale(15),
    gap: verticalScale(10),
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Alternate Exercise styles
  alternateExerciseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: verticalScale(10),
    backgroundColor: COLORS.lightBrown,
    padding: verticalScale(5),
    borderWidth: 1,
    borderColor: COLORS.white,
    width: '100%',
  },
  alternateExerciseImage: {
    height: 71,
    width: 66,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  alternateExerciseContent: {
    paddingHorizontal: horizontalScale(10),
    justifyContent: 'flex-start',
    gap: verticalScale(5),
    paddingVertical: verticalScale(4),
    flex: 1,
  },
  removeAlternateButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: verticalScale(5),
  },
  addAlternateButton: {
    alignSelf: 'flex-end',
    width: 'auto',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(5),
    borderRadius: verticalScale(5),
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.darkBrown,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.brown,
  },
  closeButton: {
    padding: verticalScale(5),
  },
  exerciseSelectList: {
    padding: horizontalScale(15),
  },
  exerciseSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBrown,
    padding: verticalScale(10),
    borderRadius: 10,
    marginVertical: verticalScale(5),
    borderWidth: 1,
    borderColor: COLORS.brown,
  },
  exerciseSelectImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: horizontalScale(15),
  },
  exerciseSelectContent: {
    flex: 1,
    gap: verticalScale(2),
  },
});

export default ExerciseSettings;
