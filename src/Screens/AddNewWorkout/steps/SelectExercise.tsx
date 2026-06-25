import React, {
  Dispatch,
  FC,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import ICONS from '../../../Assets/Icons';
import CustomIcon from '../../../Components/CustomIcon';
import {CustomText} from '../../../Components/CustomText';
import PrimaryButton from '../../../Components/PrimaryButton';
import {
  selectAllExercises,
  selectExercisesByCategory,
} from '../../../Redux/slices/exerciseCatalogSlice';
import {
  addExercise,
  addToTempSelection,
  clearTempSelection,
  ExerciseListItem,
  removeFromTempSelection,
  setActiveStep,
  setTempSelectedExercises,
  updateDayExercises,
} from '../../../Redux/slices/newWorkoutSlice';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import {Exercise} from '../../../Seeds/ExerciseCatalog';
import COLORS from '../../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../../Utilities/Metrics';
import IMAGES from '../../../Assets/Images';
import {useFocusEffect} from '@react-navigation/native';

const tabData = [
  {label: 'Category', value: 1},
  {label: 'History', value: 2},
  {label: 'List', value: 3},
];

const SelectExercise: FC<{
  selectedDayForAddExercise: ExerciseListItem | null;
  setSelectedExerciseForSettingsStep: Dispatch<SetStateAction<string | null>>;
}> = ({selectedDayForAddExercise, setSelectedExerciseForSettingsStep}) => {
  const dispatch = useAppDispatch();
  const {activeStep, tempSelectedExerciseIds} = useAppSelector(
    state => state.newWorkout,
  );

  const insets = useSafeAreaInsets();

  // Get exercises from Redux store
  const exerciseCategories = useAppSelector(selectExercisesByCategory);

  const allExercises = useAppSelector(selectAllExercises);

  const [searchedWord, setSearchedWord] = useState('');
  const [activeTab, setActiveTab] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState(() =>
    (exerciseCategories ?? []).map(item => item.bodyPart),
  );

  // Utility: filter by search
  // simple filter function (no useCallback needed)
  const filterExercises = (exercises: Exercise[]) => {
    if (!searchedWord.trim()) return exercises;

    return exercises.filter(ex =>
      ex.name.toLowerCase().includes(searchedWord.toLowerCase()),
    );
  };

  // Helper function to get all exercise IDs from a day (including exercises in supersets)
  const getExerciseIdsFromDay = useCallback(
    (day: ExerciseListItem | null): string[] => {
      if (!day) return [];

      const exerciseIds: string[] = [];

      day.exercise.forEach(item => {
        if ('type' in item && item.type === 'superset') {
          // If it's a superset, get all exercise IDs from it
          exerciseIds.push(...item.exercises.map(ex => ex.id));
        } else {
          // If it's a regular exercise, get its ID
          exerciseIds.push(item.id);
        }
      });

      return exerciseIds;
    },
    [],
  );

  // Initialize selectedExercises with exercises already added to the current day

  // Update selectedExercises when selectedDayForAddExercise changes
  useFocusEffect(
    useCallback(() => {
      if (selectedDayForAddExercise && tempSelectedExerciseIds.length === 0) {
        const existingIds = getExerciseIdsFromDay(selectedDayForAddExercise);
        dispatch(setTempSelectedExercises(existingIds));
      }
    }, [selectedDayForAddExercise, tempSelectedExerciseIds.length, dispatch]),
  );
  // Generate random exercises only once when component mounts
  const [historyExercises] = useState(() => allExercises.slice(0, 10));

  const [listExercises] = useState(() => allExercises.slice(10, 20));

  // Toggle exercise selection in the single state
  const toggleExerciseSelection = useCallback(
    (exerciseId: string) => {
      if (tempSelectedExerciseIds.includes(exerciseId)) {
        dispatch(removeFromTempSelection(exerciseId));
      } else {
        dispatch(addToTempSelection(exerciseId));
      }
    },
    [tempSelectedExerciseIds, dispatch],
  );

  const toggleCategory = useCallback((bodyPart: string) => {
    setExpandedCategories(prev =>
      prev.includes(bodyPart)
        ? prev.filter(category => category !== bodyPart)
        : [...prev, bodyPart],
    );
  }, []);

  const selectedExercises = tempSelectedExerciseIds;

  const ExerciseItem = memo(({exercise}: {exercise: Exercise}) => {
    const selectedExercises = useAppSelector(
      state => state.newWorkout.tempSelectedExerciseIds,
    );
    const isSelected = selectedExercises.includes(exercise.id);
    return (
      <View style={[styles.exerciseItem]}>
        <Image
          source={{
            uri:
              exercise.coverImage?.uri ??
              'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
          }}
          style={styles.exerciseImage}
        />
        <View style={styles.exerciseContent}>
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseNameContainer}>
              <CustomText
                color={COLORS.yellow}
                fontFamily="medium"
                fontSize={12}>
                {exercise.name}
              </CustomText>
            </View>
            {isSelected ? (
              <View style={styles.selectedActions}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedExerciseForSettingsStep(exercise.id);
                    dispatch(setActiveStep(10));
                  }}
                  style={[styles.actionButton, styles.selectedButton]}>
                  <CustomIcon
                    Icon={ICONS.smallSettingIcon}
                    height={18}
                    width={18}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleExerciseSelection(exercise.id)}
                  style={[styles.actionButton, styles.selectedButton]}>
                  <CustomText>V</CustomText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => toggleExerciseSelection(exercise.id)}
                style={styles.actionButton}>
                <CustomIcon Icon={ICONS.PlusIcon} height={12} width={12} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.tagsContainer}>
            {[
              exercise.equipment,
              exercise.type,
              exercise.force,
              exercise.location,
            ].map((tag, idx) => (
              <CustomText
                key={`${exercise.id}-${idx}`}
                style={styles.tag}
                fontSize={10}
                color={COLORS.whiteTail}>
                {tag}
              </CustomText>
            ))}
          </View>
        </View>
      </View>
    );
  });

  const CategoryItem = memo(({item}: {item: any}) => {
    const isExpanded = expandedCategories.includes(item.bodyPart);
    const normalizedKey = normalizeMuscleKey(item.bodyPart);
    const imageSource = MuscleImages[normalizedKey] || {
      uri: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    };
    return (
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Pressable
            onPress={() => toggleCategory(item.bodyPart)}
            style={styles.categoryPressable}>
            <CustomIcon Icon={ICONS.ArrowDownIcon} height={7} width={18} />
            <CustomText color={COLORS.whiteTail} fontFamily="medium">
              {item.bodyPart}
            </CustomText>
          </Pressable>
          <View style={styles.categoryInfo}>
            <CustomText>{item.exercises.length}</CustomText>
            <Image source={imageSource} style={styles.categoryImage} />
          </View>
        </View>
        {isExpanded && (
          <FlatList
            data={item.exercises}
            keyExtractor={exercise => exercise.name}
            renderItem={({item: exercise, index}) => (
              <ExerciseItem exercise={exercise} />
            )}
          />
        )}
      </View>
    );
  });

  const renderTabs = useCallback(
    () => (
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
    ),
    [activeTab],
  );

  const renderMainView = useCallback(() => {
    switch (activeTab) {
      case 1:
        return (
          <FlatList
            data={exerciseCategories}
            keyExtractor={item => item.bodyPart}
            renderItem={({item}) => {
              const filteredExercises = filterExercises(item.exercises);
              if (filteredExercises.length === 0) return null; // hide empty categories
              return (
                <CategoryItem item={{...item, exercises: filteredExercises}} />
              );
            }}
            contentContainerStyle={styles.mainListContent}
            extraData={searchedWord}
          />
        );
      case 2:
        return (
          <FlatList
            data={filterExercises(historyExercises)}
            keyExtractor={exercise => exercise.id}
            renderItem={({item: exercise}) => (
              <ExerciseItem exercise={exercise} />
            )}
            contentContainerStyle={styles.listContent}
            extraData={searchedWord}
          />
        );
      case 3:
        return (
          <FlatList
            data={filterExercises(listExercises)}
            keyExtractor={exercise => exercise.id}
            renderItem={({item: exercise}) => (
              <ExerciseItem exercise={exercise} />
            )}
            contentContainerStyle={styles.listContent}
            extraData={searchedWord}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    expandedCategories,
    selectedExercises,
    historyExercises,
    listExercises,
    exerciseCategories,
    filterExercises,
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

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingBottom:
            Platform.OS === 'android'
              ? verticalScale(50) + insets.bottom
              : verticalScale(20) + insets.bottom,
        },
      ]}
      edges={['bottom']}>
      <View style={styles.main}>
        <View style={styles.header}>
          <CustomIcon
            onPress={() => {
              dispatch(setActiveStep(activeStep - 1));
            }}
            Icon={ICONS.BackArrow}
          />
          <View style={styles.searchContainer}>
            <CustomIcon Icon={ICONS.searchIcon} height={25} width={25} />
            <TextInput
              value={searchedWord}
              onChangeText={setSearchedWord}
              placeholder="Search for an exercise"
              placeholderTextColor={COLORS.nickel}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              dispatch(setActiveStep(9)); // Navigate to AddNewExercise screen
            }}
            style={styles.newButton}>
            <View style={styles.newIconContainer}>
              <CustomIcon Icon={ICONS.PlusIcon} height={26} width={26} />
            </View>
            <CustomText
              style={{position: 'absolute', bottom: verticalScale(-22)}}>
              New
            </CustomText>
          </TouchableOpacity>
        </View>
        {selectedExercises.length > 0 && (
          <CustomText
            color={COLORS.nickel}
            fontFamily="italic"
            style={styles.selectedText}>
            {selectedExercises.length} Exercises selected
          </CustomText>
        )}
        {renderTabs()}
        {renderMainView()}
        <PrimaryButton
          title={(() => {
            const existingExerciseIds = getExerciseIdsFromDay(
              selectedDayForAddExercise,
            );
            const newlySelectedCount = selectedExercises.filter(
              exerciseId => !existingExerciseIds.includes(exerciseId),
            ).length;

            const deselectedCount = existingExerciseIds.filter(
              exerciseId => !selectedExercises.includes(exerciseId),
            ).length;

            // If there are changes (additions or removals)
            if (newlySelectedCount > 0 || deselectedCount > 0) {
              if (newlySelectedCount > 0 && deselectedCount > 0) {
                return 'Update Exercises';
              } else if (newlySelectedCount > 0) {
                return newlySelectedCount === 1
                  ? 'Add 1 Exercise'
                  : `Add ${newlySelectedCount} Exercises`;
              } else {
                return 'Back';
              }
            } else {
              return 'Back';
            }
          })()}
          onPress={() => {
            // Get the exercises that were already in the day
            const existingExerciseIds = getExerciseIdsFromDay(
              selectedDayForAddExercise,
            );

            // Find newly selected exercises (to add)
            const newlySelectedExerciseIds = selectedExercises.filter(
              exerciseId => !existingExerciseIds.includes(exerciseId),
            );

            // Find deselected exercises (to remove)
            const deselectedExerciseIds = existingExerciseIds.filter(
              exerciseId => !selectedExercises.includes(exerciseId),
            );

            // If there are changes (additions or removals), update the day's exercises
            if (
              newlySelectedExerciseIds.length > 0 ||
              deselectedExerciseIds.length > 0
            ) {
              // Get all exercises that should be in the final list
              const finalExerciseIds = selectedExercises;
              const finalExercises = allExercises.filter(exercise =>
                finalExerciseIds.includes(exercise.id),
              );

              // Update the entire exercise list for the day ̰

              // Only add the newly selected exercises
              if (newlySelectedExerciseIds.length > 0) {
                dispatch(
                  updateDayExercises({
                    id: selectedDayForAddExercise!.id,
                    exercises: finalExercises,
                  }),
                );
                dispatch(clearTempSelection());
              }

              dispatch(setActiveStep(activeStep - 1));
            }
            dispatch(setActiveStep(activeStep - 1));
          }}
          disabled={false}
          style={{marginTop: verticalScale(10)}}
        />
      </View>
    </SafeAreaView>
  );
};

export default SelectExercise;

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  safeArea: {
    height: hp(100),
    gap: verticalScale(10),
    backgroundColor: COLORS.darkBrown,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(15),
    width: wp(100),
  },
  searchContainer: {
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 100,
    paddingHorizontal: verticalScale(10),
    paddingVertical: verticalScale(5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    flex: 0.85,
  },
  searchInput: {width: '100%', color: COLORS.white},
  newButton: {alignItems: 'center', gap: verticalScale(5)},
  newIconContainer: {
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 100,
    padding: verticalScale(10),
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(10),
    marginTop: verticalScale(10),
  },
  tabButton: {
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  selectedText: {paddingHorizontal: horizontalScale(15)},
  mainListContent: {
    paddingHorizontal: horizontalScale(15),
    gap: verticalScale(20),
  },
  listContent: {
    paddingHorizontal: horizontalScale(15),
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: verticalScale(10),
    backgroundColor: COLORS.lightBrown,
    padding: verticalScale(5),
    borderWidth: 1,
    borderColor: COLORS.white,
    gap: horizontalScale(10),
    marginVertical: verticalScale(5),
  },
  exerciseImage: {
    minHeight: 71,
    width: 66,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  exerciseContent: {
    flex: 1,
    justifyContent: 'center',
    gap: verticalScale(15),
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: horizontalScale(20),
  },
  exerciseNameContainer: {
    flex: 1,
    gap: verticalScale(2),
  },
  alreadyAddedExercise: {
    borderColor: COLORS.green,
    borderWidth: 2,
  },
  selectedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(5),
  },
  actionButton: {
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
    borderRadius: 100,
    height: verticalScale(28),
    width: verticalScale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: COLORS.yellow,
  },
  alreadyAddedButton: {
    backgroundColor: COLORS.green,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
  },
  tag: {
    backgroundColor: '#403633',
    paddingHorizontal: horizontalScale(5),
  },
  categoryContainer: {gap: verticalScale(10)},
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(20),
  },
  categoryImage: {
    height: 60,
    width: 60,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
  },
});
