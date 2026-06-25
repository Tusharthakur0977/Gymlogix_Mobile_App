import React, {
  FC,
  memo,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import {useAppSelector, useAppDispatch} from '../../Redux/store';
import {
  selectExercisesByCategory,
  selectAllExercises,
} from '../../Redux/slices/exerciseCatalogSlice';
import {updateExerciseInaPlan} from '../../Redux/slices/PlanDataSlice';
import {Exercise} from '../../Seeds/ExerciseCatalog';
import {ExerciseListScreenProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale, wp} from '../../Utilities/Metrics';
import IMAGES from '../../Assets/Images';
import {
  clearTempSelectedExercises,
  setTempSelectedExercises,
} from '../../Redux/slices/tempExerciseSelectionSlice';

const tabData = [
  {label: 'Category', value: 1},
  {label: 'History', value: 2},
  {label: 'List', value: 3},
];

const ExerciseList: FC<ExerciseListScreenProps> = ({navigation, route}) => {
  const dispatch = useAppDispatch();
  const exerciseCategories = useAppSelector(selectExercisesByCategory);
  const allExercises = useAppSelector(selectAllExercises);
  const fromTrainingPlan = route.params?.fromTrainingPlan;
  const previouslySelectedExercise = fromTrainingPlan?.exerciseIds;

  const [searchedWord, setSearchedWord] = useState('');
  const [activeTab, setActiveTab] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(exerciseCategories.map(item => item.bodyPart)),
  );
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(
    () => new Set(),
  );

  const tempSelectedIds = useAppSelector(
    state => state.tempExerciseSelection.selectedExerciseIds,
  );

  const historyExercises = useMemo(
    () => allExercises.slice(0, 10),
    [allExercises],
  );
  const listExercises = useMemo(
    () => allExercises.slice(10, 20),
    [allExercises],
  );

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

  const filteredData = useMemo(() => {
    const lowerSearch = searchedWord.toLowerCase().trim();
    if (!lowerSearch) return {history: historyExercises, list: listExercises};

    const filter = (ex: Exercise) =>
      ex.name.toLowerCase().includes(lowerSearch);

    return {
      history: historyExercises.filter(filter),
      list: listExercises.filter(filter),
    };
  }, [searchedWord, historyExercises, listExercises]);

  const toggleExerciseSelection = useCallback(
    (exerciseId: string) => {
      setSelectedExercises(prev => {
        const newSet = new Set(prev);

        if (newSet.has(exerciseId)) {
          newSet.delete(exerciseId);
        } else {
          newSet.add(exerciseId);
        }

        // 🔥 update redux ONCE per user action
        dispatch(setTempSelectedExercises(Array.from(newSet)));

        return newSet;
      });
    },
    [dispatch],
  );
  const toggleCategory = useCallback((bodyPart: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bodyPart)) newSet.delete(bodyPart);
      else newSet.add(bodyPart);
      return newSet;
    });
  }, []);

  const handleAddExercisesToTrainingPlan = useCallback(() => {
    if (!fromTrainingPlan) {
      Alert.alert('Error', 'No training plan context found');
      return;
    }

    if (selectedExercises.size === 0) {
      Alert.alert('No Selection', 'Please select at least one exercise');
      return;
    }

    const selectedIds = Array.from(selectedExercises);

    const selectedExerciseObjects = allExercises.filter(ex =>
      selectedIds.includes(ex.id),
    );

    if (selectedExerciseObjects.length === 0) {
      Alert.alert(
        'Error',
        'Selected exercises are not available in the current list',
      );
      return;
    }

    // Safe time conversion
    const toSeconds = (timeStr?: string): number => {
      if (!timeStr || typeof timeStr !== 'string') return 0;
      const trimmed = timeStr.trim();
      if (!trimmed) return 0;

      let parts = trimmed
        .split(':')
        .map(p => p.trim())
        .filter(p => p && !isNaN(Number(p)))
        .map(Number);

      if (parts.length < 2) return 0;
      if (parts.length > 2) parts = parts.slice(0, 2); // take only min:sec

      const [min = 0, sec = 0] = parts;
      return min * 60 + sec;
    };

    const toMinutesDecimal = (seconds: number): number => {
      if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0)
        return 0;
      const minutes = Math.floor(seconds / 60);
      const secs = (seconds % 60) / 60;
      return parseFloat((minutes + secs).toFixed(2));
    };

    const payload = selectedExerciseObjects.map(exe => ({
      exercise_id: exe.id,
      sets: exe.exerciseSettings?.sets || 0,
      reps: exe.exerciseSettings?.reps || 0,
      timing_warmup:
        toMinutesDecimal(toSeconds(exe.exerciseSettings?.timing?.warmUp)) || 0,
      timing_workset:
        toMinutesDecimal(toSeconds(exe.exerciseSettings?.timing?.workingSet)) ||
        0,
      timing_finish:
        toMinutesDecimal(
          toSeconds(exe.exerciseSettings?.timing?.finishExercise),
        ) || 0,
      Is_time: exe.exerciseSettings?.loggingType?.includes('Time')
        ? true
        : false,
      is_weight: exe.exerciseSettings?.loggingType?.includes('Weight')
        ? true
        : false,
      Is_distance: exe.exerciseSettings?.loggingType?.includes('Distance')
        ? true
        : false,
      alternate_exercise_id: exe.exerciseSettings?.alternateExercise || [],
    }));

    dispatch(
      updateExerciseInaPlan({
        planId: Number(fromTrainingPlan.programId),
        dayId: fromTrainingPlan.dayId,
        exercise: payload,
      }),
    );
    dispatch(clearTempSelectedExercises());
    setSelectedExercises(new Set());
    navigation.goBack();
  }, [fromTrainingPlan, selectedExercises, allExercises, navigation]);

  // === FLAT DATA FOR CATEGORY TAB (NO NESTED FlatList) ===
  const flatCategoryData = useMemo(() => {
    if (activeTab !== 1) return [];

    const lowerSearch = searchedWord.toLowerCase().trim();
    const result: Array<{type: 'header' | 'exercise'; data: any}> = [];

    exerciseCategories.forEach(category => {
      const filtered = lowerSearch
        ? category.exercises.filter(ex =>
            ex.name.toLowerCase().includes(lowerSearch),
          )
        : category.exercises;

      if (filtered.length === 0) return;

      result.push({
        type: 'header',
        data: {bodyPart: category.bodyPart, count: filtered.length},
      });

      if (expandedCategories.has(category.bodyPart)) {
        filtered.forEach(ex => result.push({type: 'exercise', data: ex}));
      }
    });

    return result;
  }, [activeTab, exerciseCategories, searchedWord, expandedCategories]);

  const renderCategoryItem = useCallback(
    ({item}: {item: any}) => {
      if (item.type === 'header') {
        const {bodyPart, count} = item.data;
        const isExpanded = expandedCategories.has(bodyPart);

        const normalizedKey = normalizeMuscleKey(bodyPart);
        const imageSource = MuscleImages[normalizedKey] || {
          uri: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        };

        return (
          <View style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <Pressable
                onPress={() => toggleCategory(bodyPart)}
                style={styles.categoryPressable}>
                <CustomIcon Icon={ICONS.ArrowDownIcon} height={7} width={18} />
                <CustomText color={COLORS.whiteTail} fontFamily="medium">
                  {bodyPart}
                </CustomText>
              </Pressable>
              <View style={styles.categoryInfo}>
                <CustomText>{count}</CustomText>
                <Image source={imageSource} style={styles.categoryImage} />
              </View>
            </View>
          </View>
        );
      }

      return (
        <ExerciseItem
          exercise={item.data}
          isSelected={selectedExercises.has(item.data.id)}
          onToggle={toggleExerciseSelection}
          navigation={navigation}
        />
      );
    },
    [
      expandedCategories,
      selectedExercises,
      toggleCategory,
      toggleExerciseSelection,
      navigation,
    ],
  );

  const keyExtractor = useCallback((item: any) => {
    return item.type === 'header' ? item.data.bodyPart : item.data.id;
  }, []);

  const renderMainView = useCallback(() => {
    switch (activeTab) {
      case 1:
        return (
          <FlatList
            data={flatCategoryData}
            renderItem={renderCategoryItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.mainListContent}
          />
        );
      case 2:
        return (
          <FlatList
            data={filteredData.history}
            keyExtractor={item => item.id}
            renderItem={({item: ex}) => (
              <ExerciseItem
                exercise={ex}
                isSelected={selectedExercises.has(ex.id)}
                onToggle={toggleExerciseSelection}
                navigation={navigation}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        );
      case 3:
        return (
          <FlatList
            data={filteredData.list}
            keyExtractor={item => item.id}
            renderItem={({item: ex}) => (
              <ExerciseItem
                exercise={ex}
                isSelected={selectedExercises.has(ex.id)}
                onToggle={toggleExerciseSelection}
                navigation={navigation}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    flatCategoryData,
    filteredData,
    renderCategoryItem,
    keyExtractor,
    selectedExercises,
    toggleExerciseSelection,
    previouslySelectedExercise,
    navigation,
  ]);

  useEffect(() => {
    if (tempSelectedIds?.length > 0) {
      //  restore unsaved selections
      setSelectedExercises(new Set(tempSelectedIds));
    } else if (
      previouslySelectedExercise &&
      previouslySelectedExercise?.length > 0
    ) {
      //  initial exercises already in plan
      setSelectedExercises(new Set(previouslySelectedExercise));
    } else {
      setSelectedExercises(new Set());
    }
  }, [tempSelectedIds, previouslySelectedExercise]);

  return (
    <View style={styles.main}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <CustomIcon
            onPress={() => navigation.goBack()}
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

          {/* FIXED: "New" label wrapped in View */}
          <TouchableOpacity
            onPress={() => navigation.navigate('addNewExercise')}
            style={styles.newButton}>
            <View style={styles.newIconContainer}>
              <CustomIcon Icon={ICONS.PlusIcon} height={26} width={26} />
            </View>
            <View style={{position: 'absolute', bottom: verticalScale(-22)}}>
              <CustomText>New</CustomText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {tabData.map(tab => (
            <Pressable
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              style={[
                styles.tabButton,
                activeTab === tab.value && {backgroundColor: COLORS.yellow},
              ]}>
              <CustomText fontSize={14} fontFamily="medium">
                {tab.label}
              </CustomText>
            </Pressable>
          ))}
        </View>

        {fromTrainingPlan && (
          <View style={styles.trainingPlanContext}>
            <CustomIcon Icon={ICONS.WorkoutIcon} height={16} width={16} />
            <CustomText color={COLORS.yellow} fontFamily="medium" fontSize={14}>
              Adding exercises to {fromTrainingPlan.dayId}
            </CustomText>
          </View>
        )}

        {selectedExercises.size > 0 && (
          <CustomText
            color={COLORS.nickel}
            fontFamily="italic"
            style={styles.selectedText}>
            {selectedExercises.size} Exercises selected
          </CustomText>
        )}

        {renderMainView()}

        <PrimaryButton
          title={fromTrainingPlan ? 'Add to Training Plan' : 'Add Exercises'}
          onPress={
            fromTrainingPlan
              ? handleAddExercisesToTrainingPlan
              : () => Alert.alert('Info', 'Functionality coming soon')
          }
          disabled={selectedExercises.size === 0}
        />
      </SafeAreaView>
    </View>
  );
};

// === REUSABLE EXERCISE ITEM ===
const ExerciseItem = memo(
  ({
    exercise,
    isSelected,
    onToggle,
    navigation,
  }: {
    exercise: Exercise;
    isSelected: boolean;
    onToggle: (id: string) => void;
    navigation: any;
  }) => {
    const tags = useMemo(
      () => [
        exercise.equipment,
        exercise.type,
        exercise.force,
        exercise.location,
      ],
      [exercise.equipment, exercise.type, exercise.force, exercise.location],
    );

    return (
      <View style={styles.exerciseItem}>
        <Image
          source={{
            uri:
              exercise.coverImage?.uri ||
              'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
          }}
          style={styles.exerciseImage}
        />
        <View style={styles.exerciseContent}>
          <View style={styles.exerciseHeader}>
            <CustomText color={COLORS.yellow} fontFamily="medium" fontSize={12}>
              {exercise.name}
            </CustomText>
            {isSelected ? (
              <View style={styles.selectedActions}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('exerciseSettings', {
                      exerciseId: exercise.id,
                    })
                  }
                  style={[styles.actionButton, styles.selectedButton]}>
                  <CustomIcon
                    Icon={ICONS.smallSettingIcon}
                    height={18}
                    width={18}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onToggle(exercise.id)}
                  style={[styles.actionButton, styles.selectedButton]}>
                  <CustomText>V</CustomText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => onToggle(exercise.id)}
                style={styles.actionButton}>
                <CustomIcon Icon={ICONS.PlusIcon} height={12} width={12} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.tagsContainer}>
            {tags.map((tag, idx) => (
              <CustomText
                key={idx}
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
  },
);

export default memo(ExerciseList);

const styles = StyleSheet.create({
  main: {
    backgroundColor: COLORS.darkBrown,
    flex: 1,
    paddingBottom: verticalScale(5),
  },
  safeArea: {flex: 1, gap: verticalScale(10)},
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
  trainingPlanContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.brown,
    marginHorizontal: horizontalScale(15),
    borderRadius: verticalScale(8),
  },
  mainListContent: {
    paddingHorizontal: horizontalScale(15),
    // gap: verticalScale(20),
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
    height: '100%',
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
  tagsContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
  },
  tag: {
    backgroundColor: '#403633',
    paddingHorizontal: horizontalScale(5),
  },
  categoryContainer: {
    gap: verticalScale(10),
    marginVertical: verticalScale(10),
  },
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
