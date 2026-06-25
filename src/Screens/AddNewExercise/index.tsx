import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import StarRating from 'react-native-star-rating-widget';
import {TimerPickerModal} from 'react-native-timer-picker';
import FONTS from '../../Assets/fonts';
import ICONS from '../../Assets/Icons';
import IMAGES from '../../Assets/Images';
import SkeletonBack from '../../Components/Cards/SkeletonBack';
import SkeletonFront from '../../Components/Cards/SkeletonFront';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import DropdownSelect from '../../Components/DropdownSelect';
import UploadImageOptions from '../../Components/Modals/UploadImageOptions';
import PrimaryButton from '../../Components/PrimaryButton';
import {addCustomExercise} from '../../Redux/slices/exerciseCatalogSlice';
import {MuscleSelection, SpecificMuscle} from '../../Redux/slices/muscleSlice';
import {useAppDispatch} from '../../Redux/store';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics';

const AddNewExercise = ({}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [showMainFrontBodyModal, setShowMainFrontBodyModal] = useState(false);
  const [showMainBackBodyModal, setShowMainBackBodyModal] = useState(false);

  const [showSecondaryFrontBodyModal, setShowSecondaryFrontBodyModal] =
    useState(false);
  const [showSecondaryBackBodyModal, setShowSecondaryBackBodyModal] =
    useState(false);

  const [newExerciseStep, setNewExerciseStep] = useState(1);

  // State for step 1
  const [exerciseName, setExerciseName] = useState('');
  const [coverImage, setCoverImage] = useState<Asset | null>(null);

  // State for step 2
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const [mainMuscle, setMainMuscle] = useState<MuscleSelection>({
    front: [],
    back: [],
  });
  const [secondaryMuscle, setSecondaryMuscle] = useState<MuscleSelection>({
    front: [],
    back: [],
  });

  const [difficulty, setDifficulty] = useState<number>(1);
  const [location, setLocation] = useState<'gym' | 'home' | 'outdoor'>('gym');
  const [exerciseType, setExerciseType] = useState<
    'isolation' | 'compound' | 'other'
  >('isolation');

  const [force, setForce] = useState<'pull' | 'push'>('pull');
  const [equipment, setEquipment] = useState('');

  // State for multiple exercise images
  const [exerciseImages, setExerciseImages] = useState<Asset[]>([]);

  // State for step 3 - Exercise Settings
  const [exerciseSets, setExerciseSets] = useState('3');
  const [exerciseReps, setExerciseReps] = useState('10');
  const [exerciseLogging, setExerciseLogging] = useState<
    'Time' | 'Weight' | 'Distance'
  >('Weight');

  const [warmUpTime, setWarmUpTime] = useState('60');
  const [workingSetTime, setWorkingSetTime] = useState('90');
  const [finishExerciseTime, setFinishExerciseTime] = useState('120');

  const [isTimePickerModalVisible, setIsTimePickerModalVisible] = useState(0);

  const [isUploadOptionModal, setIsUploadOptionModal] = useState(false);
  const [isExerciseImagesModal, setIsExerciseImagesModal] = useState(false);
  const closeModal = () => {
    setIsUploadOptionModal(false);
    setIsExerciseImagesModal(false);
  };

  const handleImagePick = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setCoverImage(asset);
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
        setCoverImage(asset);
      }
      closeModal();
    } catch (error) {
      console.log('Camera capture failed:', error);
    }
  };

  // Function to handle multiple image selection from gallery
  const handleMultipleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        selectionLimit: 0, // 0 means no limit
      });

      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.log('ImagePicker Error:', result.errorMessage);
      } else if (result.assets && result.assets.length > 0) {
        // Add new images to existing ones
        setExerciseImages(prevImages => [
          ...prevImages,
          ...(result.assets as Asset[]),
        ]);
      }
      closeModal();
    } catch (error) {
      console.log('Multiple image selection failed:', error);
    }
  };

  // Function to handle multiple image selection from camera
  const handleMultipleImageCamera = async () => {
    try {
      const result = await launchCamera({
        quality: 0.5,
        mediaType: 'photo',
      });

      if (result.didCancel) {
        console.log('User cancelled camera');
      } else if (result.errorCode) {
        console.log('Camera Error:', result.errorMessage);
      } else if (result.assets && result.assets.length > 0) {
        // Add new image to existing ones
        setExerciseImages(prevImages => [
          ...prevImages,
          ...(result.assets as Asset[]),
        ]);
      }
      closeModal();
    } catch (error) {
      console.log('Camera capture failed:', error);
    }
  };

  // Function to remove an image from the list
  const removeImage = (index: number) => {
    setExerciseImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  // Format time function for timer picker
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

  // Function to save the exercise and go back to exercise selection
  const handleSaveExercise = () => {
    // Get primary muscle (first selected muscle from either front or back)
    const primaryMuscle =
      mainMuscle.front.length > 0
        ? mainMuscle.front[0]
        : mainMuscle.back.length > 0
        ? mainMuscle.back[0]
        : 'Other';

    // Get secondary muscles as an array (all selected muscles from secondary selection)
    const secondaryMuscleValues = [
      ...secondaryMuscle.front,
      ...secondaryMuscle.back,
    ].filter(Boolean); // Remove empty values

    // Combine all selected muscles for targetMuscles array
    const allTargetMuscles = [
      ...mainMuscle.front,
      ...mainMuscle.back,
      ...secondaryMuscle.front,
      ...secondaryMuscle.back,
    ].filter(Boolean); // Remove empty values

    // Create the exercise object with proper structure including exercise settings
    const newExercise = {
      name: exerciseName,
      coverImage,
      images: exerciseImages,
      instruction: instructions,
      description,
      mainMuscle: primaryMuscle,
      secondaryMuscle: secondaryMuscleValues,
      difficulty,
      location,
      type: exerciseType,
      force,
      equipment,
      targetMuscles: allTargetMuscles,
      recommendedSets: parseInt(exerciseSets) || 3,
      recommendedReps: parseInt(exerciseReps) || 10,
      exerciseSettings: {
        sets: parseInt(exerciseSets) || 3,
        reps: parseInt(exerciseReps) || 10,
        loggingType: exerciseLogging,
        timing: {
          warmUp: warmUpTime,
          workingSet: workingSetTime,
          finishExercise: finishExerciseTime,
        },
        alternateExercise: undefined, // Can be set later
      },
    };

    // Dispatch action to add the exercise to the catalog
    dispatch(addCustomExercise(newExercise));

    navigation.goBack();
  };

  // Function to go back
  const handleBack = () => {
    if (newExerciseStep === 3) {
      // Go back to step 2
      setNewExerciseStep(2);
    } else if (newExerciseStep === 2) {
      // Go back to step 1
      setNewExerciseStep(1);
    } else {
      // Go back to exercise selection
      navigation.goBack();
    }
  };

  const renderStep1 = () => {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: verticalScale(10),
          }}>
          <CustomText color={COLORS.yellow} fontFamily="italicBold">
            Give a meanigull name for your exercise
          </CustomText>
          <TextInput
            value={exerciseName}
            onChangeText={setExerciseName}
            style={{
              width: wp(90),
              height: verticalScale(50),
              borderWidth: 1,
              borderColor: COLORS.white,
              borderRadius: 15,
              paddingHorizontal: horizontalScale(10),
              color: COLORS.white,
            }}
          />
        </View>
      </View>
    );
  };

  const renderStep2 = () => {
    const getDifficultyLevel = (rating: number) => {
      if (rating <= 1) return 'Beginner';
      if (rating <= 2) return 'Intermediate';
      return 'Advanced';
    };

    return (
      <View
        style={{
          padding: horizontalScale(20),
          paddingBottom: verticalScale(40),
          gap: verticalScale(20),
        }}>
        {/* Exercise Images Section */}
        <View style={styles.imagesContainer}>
          {/* Display existing images */}
          {exerciseImages.map((image, index) => (
            <View
              key={index}
              style={[
                styles.imageItem,
                {
                  width: index === 3 ? wp(90) : horizontalScale(100),
                  height: index === 3 ? hp(30) : horizontalScale(100),
                },
              ]}>
              <Image
                source={{uri: image.uri}}
                style={
                  index === 3
                    ? {
                        ...styles.exerciseImage,
                        width: horizontalScale(400),
                        height: horizontalScale(400),
                      }
                    : styles.exerciseImage
                }
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}>
                <CustomIcon Icon={ICONS.DeleteIcon} height={16} width={16} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add image button */}
          {exerciseImages.length < 4 && (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={() => setIsExerciseImagesModal(true)}>
              <CustomIcon Icon={ICONS.PlusIcon} height={24} width={24} />
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions Input */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <CustomText fontSize={24} fontFamily="bold" color={COLORS.white}>
              Description
            </CustomText>
            <TouchableOpacity
              onPress={() => setShowDescription(!showDescription)}>
              <CustomIcon Icon={ICONS.EditIcon} height={24} width={24} />
            </TouchableOpacity>
          </View>
          {showDescription && (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please add description"
              placeholderTextColor={COLORS.whiteTail}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <CustomText fontSize={24} fontFamily="bold" color={COLORS.white}>
              instructions
            </CustomText>
            <TouchableOpacity
              onPress={() => setShowInstructions(!showInstructions)}>
              <CustomIcon Icon={ICONS.EditIcon} height={24} width={24} />
            </TouchableOpacity>
          </View>
          {showInstructions && (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please add instructions"
              placeholderTextColor={COLORS.whiteTail}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        </View>

        {/* Main Muscle */}
        <View
          style={{
            marginVertical: verticalScale(20),
          }}>
          <CustomText
            fontSize={24}
            fontFamily="bold"
            color={COLORS.white}
            style={styles.title}>
            Main Muscle
          </CustomText>

          <CustomText
            fontSize={20}
            style={styles.subtitle}
            color={COLORS.white}>
            Select a muscles
          </CustomText>

          <View style={styles.skeletonContainer}>
            <TouchableOpacity
              onPress={() => {
                setShowMainFrontBodyModal(true);
              }}
              style={styles.skeletonWrapper}>
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
                selectedMuscles={mainMuscle.front}
                viewBox="0 30 369 70"
                bodyChart={() => {}}
                frontMusclesData={() => {}}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowMainBackBodyModal(true);
              }}
              style={styles.skeletonWrapper}>
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
                selectedMuscles={mainMuscle.back}
                viewBox="0 30 369 70"
                bodyChart={() => {}}
                backMusclesData={() => {}}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Secondary Muscle */}
        <View
          style={{
            marginVertical: verticalScale(20),
          }}>
          <CustomText
            fontSize={24}
            fontFamily="bold"
            color={COLORS.white}
            style={styles.title}>
            Secondary Muscle
          </CustomText>

          <CustomText
            fontSize={20}
            style={styles.subtitle}
            color={COLORS.white}>
            Select the muscles
          </CustomText>

          <View style={styles.skeletonContainer}>
            <TouchableOpacity
              onPress={() => {
                setShowSecondaryFrontBodyModal(true);
              }}
              style={styles.skeletonWrapper}>
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
                selectedMuscles={secondaryMuscle.front}
                onMuscleToggle={(muscle: string) =>
                  setSecondaryMuscle(prev => ({
                    ...prev,
                    front: [...prev.front, muscle as SpecificMuscle], // Multiple selection for main muscle
                    back: [], // Clear back when selecting front
                  }))
                }
                viewBox="0 30 369 70"
                selectionColor={'#C3FF00'}
                bodyChart={() => {}}
                frontMusclesData={() => {}}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowSecondaryBackBodyModal(true);
              }}
              style={styles.skeletonWrapper}>
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
                selectedMuscles={secondaryMuscle.back}
                onMuscleToggle={(muscle: string) =>
                  setSecondaryMuscle(prev => ({
                    ...prev,
                    back: [...prev.back, muscle as SpecificMuscle], // Multiple selection for main muscle
                    front: [], // Clear front when selecting back
                  }))
                }
                viewBox="0 30 369 70"
                selectionColor={'#C3FF00'}
                bodyChart={() => {}}
                backMusclesData={() => {}}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <CustomText fontSize={24} fontFamily="bold" color={COLORS.white}>
            Settings
          </CustomText>

          {/* Difficulty */}
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              gap: verticalScale(20),
            }}>
            <CustomText color={COLORS.white} fontFamily="italicBold">
              Difficulty
            </CustomText>
            <StarRating
              rating={difficulty}
              onChange={rating => {
                setDifficulty(rating);
              }}
              maxStars={3}
              starSize={53}
              color={COLORS.yellow}
              emptyColor={COLORS.whiteTail}
              enableHalfStar={true}
              StarIconComponent={({type, size}) => {
                const Icon =
                  type === 'full' || type === 'half'
                    ? ICONS.FilledStarIcon
                    : ICONS.EmptyStarIcon;

                return <CustomIcon Icon={Icon} height={size} width={size} />;
              }}
            />
            <CustomText fontFamily="bold" color={COLORS.white}>
              {getDifficultyLevel(difficulty)}
            </CustomText>
          </View>

          <View style={{flexDirection: 'row', gap: horizontalScale(10)}}>
            {/* Location */}
            <DropdownSelect
              containerStyle={{flex: 1}}
              label="Location"
              options={[
                {label: 'Gym', value: 'gym'},
                {label: 'Home', value: 'home'},
                {label: 'Outdoor', value: 'outdoor'},
              ]}
              selectedValue={location}
              onSelect={value =>
                setLocation(value as 'gym' | 'home' | 'outdoor')
              }
            />

            {/* Type */}
            <DropdownSelect
              containerStyle={{flex: 1}}
              label="Type"
              options={[
                {label: 'Compound', value: 'compound'},
                {label: 'Isolation', value: 'isolation'},
                {label: 'Other', value: 'other'},
              ]}
              selectedValue={exerciseType}
              onSelect={value =>
                setExerciseType(value as 'isolation' | 'compound' | 'other')
              }
            />
          </View>

          <View style={{flexDirection: 'row', gap: horizontalScale(10)}}>
            {/* Force */}
            <DropdownSelect
              containerStyle={{flex: 1}}
              label="Force"
              options={[
                {label: 'Pull', value: 'pull'},
                {label: 'Push', value: 'push'},
              ]}
              selectedValue={force}
              onSelect={value => setForce(value as 'pull' | 'push')}
            />

            {/* Equipment */}
            <DropdownSelect
              containerStyle={{flex: 1}}
              label="Equipment"
              options={[
                {label: 'Barbell', value: 'barbell'},
                {label: 'Dumbbell', value: 'dumbbell'},
                {label: 'Kettlebell', value: 'kettlebell'},
                {label: 'Machine', value: 'machine'},
                {label: 'Cable', value: 'cable'},
                {label: 'Bodyweight', value: 'bodyweight'},
                {label: 'Resistance Band', value: 'resistance_band'},
                {label: 'Other', value: 'other'},
              ]}
              selectedValue={equipment}
              onSelect={setEquipment}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderStep3 = () => {
    return (
      <ScrollView
        contentContainerStyle={{
          padding: horizontalScale(20),
          gap: verticalScale(20),
        }}>
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

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{alignItems: 'center', gap: verticalScale(5)}}>
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
                style={{bottom: 3, marginHorizontal: 2}}>
                x
              </CustomText>
              <View style={styles.strategyLine} />
            </View>
            <View style={{alignItems: 'center', gap: verticalScale(5)}}>
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
                onPress={() => setExerciseLogging(item.label as any)}
                key={item.label}
                style={[
                  styles.loggingOption,
                  {
                    borderColor:
                      exerciseLogging === item.label
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
                <CustomText color={COLORS.yellow}>{warmUpTime}s</CustomText>
              </TouchableOpacity>
            </View>
            <View style={styles.timingRow}>
              <CustomText color={COLORS.whiteTail} fontFamily="bold">
                Working set rest time
              </CustomText>
              <TouchableOpacity onPress={() => setIsTimePickerModalVisible(2)}>
                <CustomText color={COLORS.yellow}>{workingSetTime}s</CustomText>
              </TouchableOpacity>
            </View>
            <View style={styles.timingRow}>
              <CustomText color={COLORS.whiteTail} fontFamily="bold">
                Finish exercise rest time
              </CustomText>
              <TouchableOpacity onPress={() => setIsTimePickerModalVisible(3)}>
                <CustomText color={COLORS.yellow}>
                  {finishExerciseTime}s
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={coverImage ? {uri: coverImage.uri} : IMAGES.exerciseDummy}
        style={styles.coverImage}
        imageStyle={styles.coverImageStyle}>
        <LinearGradient
          colors={['rgba(0,0,0,0)', '#1F1A16']}
          style={styles.gradient}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}>
          <View style={styles.headerContainer}>
            <CustomIcon onPress={handleBack} Icon={ICONS.BackArrow} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: wp(90),
              }}>
              <View style={{flex: 1}}>
                <CustomText color={COLORS.white} fontSize={18}>
                  {exerciseName ? exerciseName : 'New Exercise'}
                </CustomText>
              </View>
              {newExerciseStep === 1 ? (
                <CustomIcon
                  onPress={() => setIsUploadOptionModal(true)}
                  Icon={ICONS.EditIcon}
                  height={24}
                  width={24}
                />
              ) : newExerciseStep === 2 ? (
                <CustomIcon
                  onPress={() => setNewExerciseStep(1)}
                  Icon={ICONS.EditIcon}
                  height={24}
                  width={24}
                />
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {newExerciseStep === 1
          ? renderStep1()
          : newExerciseStep === 2
          ? renderStep2()
          : renderStep3()}

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={
              newExerciseStep === 1
                ? 'Next'
                : newExerciseStep === 2
                ? 'Next'
                : 'Save Exercise'
            }
            onPress={() => {
              if (newExerciseStep === 1) {
                setNewExerciseStep(2);
              } else if (newExerciseStep === 2) {
                setNewExerciseStep(3);
              } else {
                handleSaveExercise();
              }
            }}
            disabled={
              newExerciseStep === 1
                ? !exerciseName.trim()
                : newExerciseStep === 2
                ? !description.trim() ||
                  !instructions.trim() ||
                  !equipment.trim() ||
                  !difficulty ||
                  !location ||
                  !exerciseType ||
                  !force
                : !exerciseSets.trim() ||
                  !exerciseReps.trim() ||
                  isNaN(parseInt(exerciseSets)) ||
                  isNaN(parseInt(exerciseReps))
            }
          />
        </View>
      </ScrollView>

      {isUploadOptionModal && (
        <UploadImageOptions
          closeModal={closeModal}
          isModalVisible={isUploadOptionModal}
          onPressCamera={handleCameraPick}
          onPressGallery={handleImagePick}
        />
      )}

      {isExerciseImagesModal && (
        <UploadImageOptions
          closeModal={closeModal}
          isModalVisible={isExerciseImagesModal}
          onPressCamera={handleMultipleImageCamera}
          onPressGallery={handleMultipleImagePick}
        />
      )}

      {showMainFrontBodyModal && (
        <Modal
          transparent
          visible={showMainFrontBodyModal}
          animationType="fade"
          onRequestClose={() => setShowMainFrontBodyModal(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowMainFrontBodyModal(false)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              onStartShouldSetResponder={() => true} // Capture touch events
              onResponderRelease={e => e.stopPropagation()} // Prevent propagation
              style={{
                backgroundColor: COLORS.brown,
                borderRadius: 20,
                width: wp(90),
                height: hp(55),
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: COLORS.white,
              }}>
              <SkeletonFront
                containerWidth={wp(90)}
                showLabel
                selectedMuscles={mainMuscle.front}
                onMuscleToggle={muscle => {
                  setMainMuscle(prev => ({
                    ...prev,
                    front: [muscle as SpecificMuscle], // Single selection for main muscle
                    back: [], // Clear back when selecting front
                  }));
                }}
                viewBox="0 30 369 90"
                bodyChart={() => {}}
                frontMusclesData={() => {}}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {showMainBackBodyModal && (
        <Modal
          transparent
          visible={showMainBackBodyModal}
          animationType="fade"
          onRequestClose={() => setShowMainBackBodyModal(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowMainBackBodyModal(false)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              onStartShouldSetResponder={() => true} // Capture touch events
              onResponderRelease={e => e.stopPropagation()} // Prevent propagation
              style={{
                backgroundColor: COLORS.brown,
                borderRadius: 20,
                width: wp(90),
                height: hp(55),
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: COLORS.white,
              }}>
              <SkeletonBack
                containerWidth={wp(90)}
                showLabel
                selectedMuscles={mainMuscle.back}
                onMuscleToggle={muscle => {
                  setMainMuscle(prev => ({
                    ...prev,
                    back: [muscle as SpecificMuscle],
                    front: [], // Clear front when selecting back
                  }));
                }}
                viewBox="0 30 369 90"
                bodyChart={() => {}}
                backMusclesData={() => {}}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {showSecondaryFrontBodyModal && (
        <Modal
          transparent
          visible={showSecondaryFrontBodyModal}
          animationType="fade"
          onRequestClose={() => setShowSecondaryFrontBodyModal(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowSecondaryFrontBodyModal(false)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              onStartShouldSetResponder={() => true} // Capture touch events
              onResponderRelease={e => e.stopPropagation()} // Prevent propagation
              style={{
                backgroundColor: COLORS.brown,
                borderRadius: 20,
                width: wp(90),
                height: hp(55),
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: COLORS.white,
              }}>
              <SkeletonFront
                containerWidth={wp(90)}
                showLabel
                selectedMuscles={secondaryMuscle.front}
                onMuscleToggle={muscle => {
                  setSecondaryMuscle(prev => {
                    const isCurrentlySelected = prev.front.includes(
                      muscle as SpecificMuscle,
                    );
                    if (isCurrentlySelected) {
                      // Remove muscle from selection
                      return {
                        ...prev,
                        front: prev.front.filter(m => m !== muscle),
                      };
                    } else {
                      // Add muscle to selection
                      return {
                        ...prev,
                        front: [...prev.front, muscle as SpecificMuscle],
                      };
                    }
                  });
                }}
                viewBox="0 30 369 90"
                selectionColor={'#C3FF00'}
                bodyChart={() => {}}
                frontMusclesData={() => {}}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {showSecondaryBackBodyModal && (
        <Modal
          transparent
          visible={showSecondaryBackBodyModal}
          animationType="fade"
          onRequestClose={() => setShowSecondaryBackBodyModal(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowSecondaryBackBodyModal(false)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              onStartShouldSetResponder={() => true} // Capture touch events
              onResponderRelease={e => e.stopPropagation()} // Prevent propagation
              style={{
                backgroundColor: COLORS.brown,
                borderRadius: 20,
                width: wp(90),
                height: hp(55),
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: COLORS.white,
              }}>
              <SkeletonBack
                containerWidth={wp(90)}
                showLabel
                selectedMuscles={secondaryMuscle.back}
                onMuscleToggle={muscle => {
                  setSecondaryMuscle(prev => {
                    const isCurrentlySelected = prev.back.includes(
                      muscle as SpecificMuscle,
                    );
                    if (isCurrentlySelected) {
                      // Remove muscle from selection
                      return {
                        ...prev,
                        back: prev.back.filter(m => m !== muscle),
                      };
                    } else {
                      // Add muscle to selection
                      return {
                        ...prev,
                        back: [...prev.back, muscle as SpecificMuscle],
                      };
                    }
                  });
                }}
                viewBox="0 30 369 90"
                selectionColor={'#C3FF00'}
                bodyChart={() => {}}
                backMusclesData={() => {}}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Timer Picker Modal for Exercise Settings */}
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
    </SafeAreaView>
  );
};

export default AddNewExercise;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBrown,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
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
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  input: {
    backgroundColor: COLORS.lightBrown,
    borderRadius: 8,
    padding: horizontalScale(10),
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  textArea: {
    height: verticalScale(100),
    textAlignVertical: 'top',
    paddingTop: verticalScale(10),
  },
  buttonContainer: {
    marginTop: verticalScale(20),
    gap: verticalScale(10),
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  // Styles for step 2
  settingsSection: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
    gap: verticalScale(30),
  },
  settingItem: {
    marginBottom: verticalScale(15),
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(8),
    gap: horizontalScale(8),
  },
  difficultyButton: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    borderRadius: horizontalScale(10),
    backgroundColor: COLORS.lightBrown,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  activeDifficultyButton: {
    backgroundColor: COLORS.yellow,
  },
  optionsContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(8),
    gap: horizontalScale(10),
  },
  optionButton: {
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(5),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.white,
    backgroundColor: 'transparent',
  },
  activeOptionButton: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow,
  },
  // Styles for exercise images
  imagesSection: {
    marginBottom: verticalScale(20),
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: horizontalScale(5),
    marginTop: verticalScale(10),
    width: wp(90),
  },
  imageItem: {
    width: horizontalScale(100),
    height: horizontalScale(100),
    borderRadius: 20,

    overflow: 'hidden',
    position: 'relative',
    marginBottom: verticalScale(10),
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.darkBrown,
    borderRadius: 15,
    padding: 5,
  },
  addImageButton: {
    width: horizontalScale(100),
    height: horizontalScale(100),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    marginBottom: verticalScale(10),
  },
  subtitle: {
    textAlign: 'center',
    marginVertical: verticalScale(10),
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
  muscleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(8),
    marginTop: verticalScale(10),
  },
  muscleTag: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 15,
  },
  // Step 3 - Exercise Settings styles
  settingsCard: {
    gap: verticalScale(30),
    backgroundColor: COLORS.brown,
    padding: verticalScale(10),
    borderRadius: 10,
    alignItems: 'center',
  },
  strategyInput: {
    padding: verticalScale(10),
    fontSize: 36,
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
});
