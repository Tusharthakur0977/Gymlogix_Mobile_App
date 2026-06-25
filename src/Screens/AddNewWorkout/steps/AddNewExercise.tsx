import React, {useEffect, useState} from 'react';
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
import ICONS from '../../../Assets/Icons';
import IMAGES from '../../../Assets/Images';
import SkeletonBack from '../../../Components/Cards/SkeletonBack';
import SkeletonFront from '../../../Components/Cards/SkeletonFront';
import CustomIcon from '../../../Components/CustomIcon';
import {CustomText} from '../../../Components/CustomText';
import DropdownSelect from '../../../Components/DropdownSelect';
import {KeyboardAvoidingContainer} from '../../../Components/KeyboardAvoidingComponent';
import UploadImageOptions from '../../../Components/Modals/UploadImageOptions';
import PrimaryButton from '../../../Components/PrimaryButton';
import {
  addCustomExercise,
  setExerciseCatalog,
} from '../../../Redux/slices/exerciseCatalogSlice';
import {
  MuscleSelection,
  SpecificMuscle,
} from '../../../Redux/slices/muscleSlice';
import {setActiveStep} from '../../../Redux/slices/newWorkoutSlice';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import COLORS from '../../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../../Utilities/Metrics';
import {postData, postFormData} from '../../../APIServices/api';
import ENDPOINTS from '../../../APIServices/endPoints';
import {Exercise, ExerciseCatalog} from '../../../Seeds/ExerciseCatalog';
import {
  getLocalStorageData,
  storeLocalStorageData,
} from '../../../Utilities/Storage';
import STORAGE_KEYS from '../../../Utilities/Constants';
import {showCustomToast} from '../../../Utilities/Helpers';

function mapLocation(equipment = '') {
  const eq = equipment.toLowerCase();
  if (eq.includes('bodyweight') || eq.includes('dumbbell')) return 'home';
  if (eq.includes('barbell') || eq.includes('machine')) return 'gym';
  return 'gym';
}

function mapType(type = '') {
  const t = type.toLowerCase();
  if (t.includes('compound')) return 'compound';
  if (t.includes('isolation')) return 'isolation';
  return 'other';
}

function mapForce(force = '') {
  const f = force.toLowerCase();
  if (f.includes('pull')) return 'pull';
  if (f.includes('push')) return 'push';
  return 'push';
}

const addExerciseToCatalog = (
  catalog: ExerciseCatalog,
  newExercise: Exercise,
): ExerciseCatalog => {
  const bodyPart = newExercise.mainMuscle || 'Other';

  const existingCategory = catalog.categories.find(
    cat => cat.bodyPart.toLowerCase() === bodyPart.toLowerCase(),
  );

  if (existingCategory) {
    // Create a deep copy of that category with the new exercise added
    const updatedCategories = catalog.categories.map(cat =>
      cat.bodyPart.toLowerCase() === bodyPart.toLowerCase()
        ? {
            ...cat,
            exercises: [...cat.exercises, newExercise],
          }
        : cat,
    );

    return {categories: updatedCategories};
  } else {
    // Create a new category
    return {
      categories: [
        ...catalog.categories,
        {
          bodyPart,
          exercises: [newExercise],
        },
      ],
    };
  }
};

const AddNewExercise = ({}) => {
  const dispatch = useAppDispatch();
  const {catalog} = useAppSelector(state => state.exerciseCatalog);

  const [showMainFrontBodyModal, setShowMainFrontBodyModal] = useState(false);
  const [showMainBackBodyModal, setShowMainBackBodyModal] = useState(false);

  const [showSecondaryFrontBodyModal, setShowSecondaryFrontBodyModal] =
    useState(false);
  const [showSecondaryBackBodyModal, setShowSecondaryBackBodyModal] =
    useState(false);

  const [newExerciseStep, setNewExerciseStep] = useState(1);

  // State for both steps
  const [exerciseName, setExerciseName] = useState('');
  const [coverImage, setCoverImage] = useState<Asset | null>(null);
  const [description, setDescription] = useState('');

  const [showDescription, setShowDescription] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // State for step 2
  const [instructions, setInstructions] = useState('');
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

  const [uplaodFileData, setUploadFileData] = useState<any | null>(null);

  const [isUploadOptionModal, setIsUploadOptionModal] = useState(false);
  const [isExerciseImagesModal, setIsExerciseImagesModal] = useState(false);

  const [errors, setErrors] = useState({
    exerciseName: '',
    description: '',
    instructions: '',
    mainMuscle: '',
    secondaryMuscle: '',
    difficulty: '',
    equipment: '',
  });
  const closeModal = () => {
    setIsUploadOptionModal(false);
    setIsExerciseImagesModal(false);
  };

  const handleImagePick = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.5}, async response => {
      try {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];

          setCoverImage(asset);

          const formData = new FormData();
          formData.append('asset', {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName,
          });

          const apiResponse = await postFormData<any>(
            ENDPOINTS.uploadFile,
            formData,
          );

          if (apiResponse?.data?.url) {
            setUploadFileData(apiResponse.data.url);
          }
        }
      } catch (error) {
        console.error('Error in handleImagePick:', error);
      } finally {
        closeModal();
      }
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

        const formData = new FormData();
        const assesData = asset;
        formData.append('asset', {
          uri: assesData.uri,
          type: assesData.type,
          name: assesData.fileName,
        });

        const response = await postFormData<any>(
          ENDPOINTS.uploadFile,
          formData,
        );

        if (response.data) {
          const get_Image_Url = response.data.url;

          if (get_Image_Url) {
            setUploadFileData(get_Image_Url);
          }
        }
      }
      closeModal();
    } catch (error) {
      console.log('Camera capture failed:', error);
    } finally {
      closeModal();
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

  const validInputs = () => {
    let valid = true;
    let newErrors = {
      exerciseName: '',
      description: '',
      instructions: '',
      mainMuscle: '',
      secondaryMuscle: '',
      difficulty: '',
      equipment: '',
    };

    // if (!uplaodFileData) {
    //   valid = false;
    //   newErrors.uplaodFileData = 'Cover Image is required.';
    //   showCustomToast('error', newErrors.uplaodFileData);
    //   return;
    // }
    if (!exerciseName.trim()) {
      valid = false;
      newErrors.exerciseName = 'Title is required.';
      showCustomToast('error', newErrors.exerciseName);
      return;
    }
    if (!description.trim()) {
      valid = false;
      newErrors.description = 'Description is required.';
      showCustomToast('error', newErrors.description);
      return;
    }
    if (!instructions.trim()) {
      valid = false;
      newErrors.instructions = 'Instruction is required.';
      showCustomToast('error', newErrors.instructions);
      return;
    }
    if (mainMuscle.front.length < 1 && mainMuscle.back.length < 1) {
      valid = false;
      newErrors.mainMuscle = 'Main Muscle is required.';
      showCustomToast('error', newErrors.mainMuscle);
      return;
    }
    if (secondaryMuscle.front.length < 1 && secondaryMuscle.back.length < 1) {
      valid = false;
      newErrors.secondaryMuscle = 'Secondary Muscle is required.';
      showCustomToast('error', newErrors.secondaryMuscle);
      return;
    }
    if (!difficulty) {
      valid = false;
      newErrors.difficulty = 'Difficulty is required.';
      showCustomToast('error', newErrors.difficulty);
      return;
    }
    if (!equipment) {
      valid = false;
      newErrors.equipment = 'Equipment is required.';
      showCustomToast('error', newErrors.equipment);
      return;
    }

    setErrors(newErrors);
    return valid;
  };

  // Function to save the exercise and go back to exercise selection
  const handleSaveExercise = async () => {
    const primaryMuscle =
      mainMuscle.front.length > 0
        ? mainMuscle.front[0]
        : mainMuscle.back.length > 0
        ? mainMuscle.back[0]
        : 'Other';

    // Get secondary muscles as an array
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
    ].filter(Boolean);

    // Validate mainMuscle
    if (!primaryMuscle || typeof primaryMuscle !== 'string') {
      console.error('Invalid mainMuscle:', primaryMuscle);
      return;
    }

    const difficultyLevels: any = {
      1: 'beginner',
      2: 'intermediate',
      3: 'advance',
    };

    if (!validInputs()) {
      return;
    }

    const data = {
      name: exerciseName,
      description: description,
      instruction: instructions,
      images_urls: [uplaodFileData] ? [uplaodFileData] : [IMAGES.exerciseDummy],
      main_muscle: primaryMuscle,
      secondary_muscles: secondaryMuscleValues,
      mechanics: exerciseType,
      difficulty: difficultyLevels[difficulty] || 'beginner',
      type: exerciseType,
      equipment: equipment,
      force: force,
    };

    try {
      const response = await postData<any>(ENDPOINTS.create_update_exercise, {
        data,
      });
      if (response.data.data) {
        const item = response.data.data;

        const difficultyToIndex = Object.keys(difficultyLevels).reduce(
          (acc, key) => {
            acc[difficultyLevels[key]] = parseInt(key);
            return acc;
          },
          {} as Record<string, number>,
        );

        const difficultyLevel =
          difficultyToIndex[(item.difficulty || '').toLowerCase()] || 1;

        const newExercise = {
          id: item.exercise_id,
          name: item.name,
          coverImage: item.images_urls?.[0] ? {uri: item.images_urls[0]} : null,
          images: item.images_urls?.map((url: string) => ({uri: url})) || [],
          instruction: Array.isArray(item.instruction)
            ? item.instruction.join('\n')
            : item.instruction || '',
          description: item.description || '',
          mainMuscle: item.main_muscle,
          secondaryMuscle: item.secondary_muscles || [],
          difficulty: difficultyLevel,
          location: mapLocation(item.equipment),
          type: mapType(item.type),
          force: mapForce(item.force),
          equipment: item.equipment || '',
          targetMuscles: [item.main_muscle, ...(item.secondary_muscles || [])],
          defaultSets: [],
          recommendedSets: 10,
          recommendedReps: 10,
          exerciseSettings: null,
        };

        const updatedCatalog = addExerciseToCatalog(catalog, newExercise);

        const localExerciseList =
          (await getLocalStorageData(STORAGE_KEYS.localExerciseData)) || [];

        // 2. Add new exercise to the list
        const updatedExerciseList = [...localExerciseList, newExercise];
        // 3. Store updated list and catalog in local storage
        await storeLocalStorageData(
          STORAGE_KEYS.localExerciseData,
          updatedExerciseList,
        );
        await storeLocalStorageData(
          STORAGE_KEYS.localExerciseCatalog,
          updatedCatalog,
        );

        dispatch(setExerciseCatalog(updatedCatalog));
        dispatch(setActiveStep(8));
        // dispatch(addCustomExercise(newExercise));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  // Function to go back
  const handleBack = () => {
    if (newExerciseStep === 2) {
      // Go back to step 1
      setNewExerciseStep(1);
    } else {
      // Go back to exercise selection
      dispatch(setActiveStep(8));
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
            Give a meaningfull name for your exercise
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            Select a muscle
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
                backMusclesData={() => {}}
                bodyChart={() => {}}
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
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingContainer backgroundColor="transparent">
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
                <CustomText color={COLORS.white} fontSize={18}>
                  {exerciseName ? exerciseName : 'New Exercise'}
                </CustomText>
                {newExerciseStep === 2 ? (
                  <CustomIcon
                    onPress={() => setNewExerciseStep(1)}
                    Icon={ICONS.EditIcon}
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

        {newExerciseStep === 1 ? renderStep1() : renderStep2()}

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={newExerciseStep === 1 ? 'Next' : 'Save'}
            onPress={() => {
              if (newExerciseStep === 1) {
                setNewExerciseStep(2);
              } else {
                handleSaveExercise();
              }
            }}
            // disabled={
            //   newExerciseStep === 1
            //     ? !exerciseName.trim()
            //     : !description.trim() ||
            //       !instructions.trim() ||
            //       !equipment.trim() ||
            //       !difficulty ||
            //       !location ||
            //       !exerciseType ||
            //       !force
            // }
          />
        </View>

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
      </KeyboardAvoidingContainer>
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
    padding: horizontalScale(20),
    paddingBottom: verticalScale(40),
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
});
