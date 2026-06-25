import React, {Dispatch, FC, SetStateAction, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import ICONS from '../../../Assets/Icons';
import CustomIcon from '../../../Components/CustomIcon';
import {CustomText} from '../../../Components/CustomText';
import ContextMenu from '../../../Components/Modals/ContextMenu';
import SelectDayColorModal from '../../../Components/Modals/SelectDayColorModal';
import UpdateDayNameModal from '../../../Components/Modals/UpdateDayNameModal';
import UpdateDayRestPeriodModal from '../../../Components/Modals/UpdateDayRestPeriodModal';
import UpdateInstructionforWorkoutModal from '../../../Components/Modals/UpdateInstructionforWorkoutModal';
import {
  addDay,
  createSuperset,
  deleteSuperset,
  ExerciseListItem,
  removeDay,
  removeExercise,
  removeExerciseFromSuperset,
  setActiveStep,
  Superset,
  updateDayColor,
  updateDayInstruction,
  updateDayName,
  updateDayRestPeriod,
  WorkoutExerciseItem,
} from '../../../Redux/slices/newWorkoutSlice';
import {Exercise} from '../../../Seeds/ExerciseCatalog';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import COLORS from '../../../Utilities/Colors';
import {getRandomColor} from '../../../Utilities/Helpers';
import {horizontalScale, hp, verticalScale} from '../../../Utilities/Metrics';
// Using Exercise type from Redux slice instead of Seeds

const WorkroutDataScreen: FC<{
  setSelectedDayForAddExercise: Dispatch<
    SetStateAction<ExerciseListItem | null>
  >;
  selectedDayForAddExercise: ExerciseListItem | null;
}> = ({selectedDayForAddExercise, setSelectedDayForAddExercise}) => {
  const dispatch = useAppDispatch();
  const {workoutData} = useAppSelector(state => state.newWorkout);
  const [activeTab, setActiveTab] = useState(1);

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveTab(1)}
          style={[
            styles.tabButton,
            {
              backgroundColor: activeTab === 1 ? COLORS.yellow : 'transparent',
            },
          ]}>
          <CustomText fontSize={14} fontFamily="medium" color={COLORS.white}>
            Exercise
          </CustomText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab(2)}
          style={[
            styles.tabButton,
            {
              backgroundColor: activeTab === 2 ? COLORS.yellow : 'transparent',
            },
          ]}>
          <CustomText fontSize={14} fontFamily="medium" color={COLORS.white}>
            Details
          </CustomText>
        </Pressable>
      </View>
    );
  };

  const renderMainView = () => {
    switch (activeTab) {
      case 1:
        return <ExercisesTab />;
      case 2:
        return <DetailsTab />;
    }
  };

  const ExercisesTab = () => {
    const [contextMenu, setContextMenu] = useState({
      isVisible: false,
      position: {top: 0, right: 100},
      selectedDayIndex: -1,
    });

    const [exerciseContextMenu, setExerciseContextMenu] = useState({
      isVisible: false,
      position: {top: 0, right: 100},
      selectedExerciseId: '',
      dayId: '',
      supersetId: '', // Add supersetId to track if the exercise is part of a superset
      isSuperset: false, // Flag to indicate if this is a superset itself
    });
    const [showColorModal, setShowColorModal] = useState(false);
    const [selectedDayForColor, setSelectedDayForColor] = useState(0);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const [showDayNameModal, setShowDayNameModal] = useState(false);
    const [showRestPeriodModal, setShowRestPeriodModal] = useState(false);

    // State for selected exercises and superset functionality - now per day
    const [selectedExercisesByDay, setSelectedExercisesByDay] = useState<{
      [dayId: string]: string[];
    }>({});
    const fadeAnimsByDay = React.useRef<{[dayId: string]: Animated.Value}>(
      {},
    ).current;

    // Initialize fade animations for each day
    React.useEffect(() => {
      workoutData.exerciseList.forEach(day => {
        if (!fadeAnimsByDay[day.id]) {
          fadeAnimsByDay[day.id] = new Animated.Value(0);
        }
      });
    }, [workoutData.exerciseList, fadeAnimsByDay]);

    // Show/hide the floating action bar when exercises are selected for each day
    React.useEffect(() => {
      Object.keys(selectedExercisesByDay).forEach(dayId => {
        const selectedCount = selectedExercisesByDay[dayId]?.length || 0;
        if (fadeAnimsByDay[dayId]) {
          Animated.timing(fadeAnimsByDay[dayId], {
            toValue: selectedCount > 0 ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      });
    }, [selectedExercisesByDay, fadeAnimsByDay]);

    const handleSaveInstruction = (instruction: string) => {
      dispatch(
        updateDayInstruction({
          id: workoutData.exerciseList[selectedDayForColor].id,
          instruction,
        }),
      );
      setShowInstructionModal(false);
    };

    const handleSaveRestPeriod = (days: number) => {
      // Here you would dispatch an action to update the rest period
      dispatch(
        updateDayRestPeriod({
          id: workoutData.exerciseList[selectedDayForColor].id,
          restPeriod: days,
        }),
      );
      setShowRestPeriodModal(false);
    };

    const handleSaveDayName = (name: string) => {
      dispatch(
        updateDayName({
          id: workoutData.exerciseList[selectedDayForColor].id,
          name,
        }),
      );
      setShowDayNameModal(false);
    };

    const handleColorSelect = (color: string) => {
      const dayId = workoutData.exerciseList[selectedDayForColor].id;
      dispatch(updateDayColor({id: dayId, color}));
      setShowColorModal(false);
    };

    const handleDayMenuPress = (event: any, dayIndex: number) => {
      // Get the position of the touch
      const {pageY, pageX} = event.nativeEvent;

      setSelectedDayForColor(dayIndex);
      setContextMenu({
        isVisible: true,
        position: {
          top: pageY + verticalScale(10),
          right: Dimensions.get('window').width - pageX,
        },
        selectedDayIndex: dayIndex,
      });
    };

    const handleExerciseMenuPress = (
      event: any,
      exercise: Exercise,
      dayId: string,
      supersetId: string = '',
    ) => {
      // Get the position of the touch
      const {pageY, pageX} = event.nativeEvent;

      setExerciseContextMenu({
        isVisible: true,
        position: {
          top: pageY + verticalScale(10),
          right: Dimensions.get('window').width - pageX,
        },
        selectedExerciseId: exercise.id,
        dayId: dayId,
        supersetId: supersetId,
        isSuperset: false,
      });
    };

    // Handle menu press for a superset
    const handleSupersetMenuPress = (
      event: any,
      superset: Superset,
      dayId: string,
    ) => {
      // Get the position of the touch
      const {pageY, pageX} = event.nativeEvent;

      setExerciseContextMenu({
        isVisible: true,
        position: {
          top: pageY + verticalScale(10),
          right: Dimensions.get('window').width - pageX,
        },
        selectedExerciseId: superset.id,
        dayId: dayId,
        supersetId: superset.id,
        isSuperset: true,
      });
    };

    // Handle long press on an exercise to select it
    const handleLongExercisePress = (exercise: Exercise, dayId: string) => {
      setSelectedExercisesByDay(prev => {
        const currentSelections = prev[dayId] || [];
        if (currentSelections.includes(exercise.id)) {
          // Remove from selection
          const newSelections = currentSelections.filter(
            id => id !== exercise.id,
          );
          return {
            ...prev,
            [dayId]: newSelections,
          };
        } else {
          // Add to selection
          return {
            ...prev,
            [dayId]: [...currentSelections, exercise.id],
          };
        }
      });
    };

    // Handle press on an exercise to toggle selection if in selection mode
    const handleExercisePress = (exercise: Exercise, dayId: string) => {
      const daySelections = selectedExercisesByDay[dayId] || [];
      if (daySelections.length > 0) {
        handleLongExercisePress(exercise, dayId);
      }
    };

    // Create a superset from selected exercises for a specific day
    const handleCreateSuperset = (dayId: string) => {
      const selectedExercises = selectedExercisesByDay[dayId] || [];
      if (selectedExercises.length <= 1) return;

      dispatch(
        createSuperset({
          dayId: dayId,
          exerciseIds: selectedExercises,
        }),
      );

      // Clear selections for this day
      setSelectedExercisesByDay(prev => ({
        ...prev,
        [dayId]: [],
      }));
    };

    // Clear selected exercises for a specific day
    const handleClearSelection = (dayId: string) => {
      setSelectedExercisesByDay(prev => ({
        ...prev,
        [dayId]: [],
      }));
    };

    // Render a single exercise card
    const renderSingleExerciseCard = (exercise: Exercise, dayId: string) => {
      const daySelections = selectedExercisesByDay[dayId] || [];
      const isSelected = daySelections.includes(exercise.id);

      return (
        <TouchableOpacity
          key={exercise.id}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderRadius: verticalScale(10),
            backgroundColor: isSelected
              ? COLORS.lighterBrown
              : COLORS.lightBrown,
            padding: verticalScale(5),
            borderWidth: 1,
            borderColor: isSelected ? COLORS.yellow : COLORS.white,
            marginBottom: verticalScale(4),
          }}
          onPress={() => handleExercisePress(exercise, dayId)}
          onLongPress={() => handleLongExercisePress(exercise, dayId)}
          delayLongPress={200}>
          <Image
            source={{
              uri:
                exercise.coverImage?.uri ||
                'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
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
            <CustomText color={COLORS.yellow} fontFamily="medium" fontSize={12}>
              {exercise.name}
            </CustomText>
            <CustomText color={COLORS.white} fontFamily="medium" fontSize={12}>
              {`${exercise.exerciseSettings?.sets || 3} sets x ${
                exercise.exerciseSettings?.reps || 10
              } reps`}
            </CustomText>
          </View>
          <TouchableOpacity
            style={{justifyContent: 'center'}}
            onPress={event => handleExerciseMenuPress(event, exercise, dayId)}>
            <CustomIcon
              Icon={ICONS.SidMultiDotView}
              height={verticalScale(27)}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    };

    // Render a superset card
    const renderSupersetCard = (superset: Superset, dayId: string) => {
      return (
        <View
          key={superset.id}
          style={{
            padding: verticalScale(4),
            gap: verticalScale(5),
            borderColor: COLORS.white,
            borderWidth: 1.5,
            borderRadius: 10,
            marginBottom: verticalScale(10),
            flex: 1,
          }}>
          <View
            style={{
              width: '100%',
              paddingHorizontal: horizontalScale(10),
              paddingVertical: verticalScale(5),
              borderTopRightRadius: 8,
              borderTopLeftRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <CustomText fontFamily="bold" fontSize={14} color={COLORS.white}>
              SUPERSET
            </CustomText>
          </View>
          <View
            style={{
              width: '98%',
              gap: verticalScale(5),
              alignSelf: 'center',
            }}>
            {superset.exercises.map((exercise: Exercise) => {
              const daySelections = selectedExercisesByDay[dayId] || [];
              const isSelected = daySelections.includes(exercise.id);

              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderRadius: verticalScale(10),
                    backgroundColor: isSelected
                      ? COLORS.lighterBrown
                      : COLORS.lightBrown,
                    padding: verticalScale(5),
                  }}
                  onPress={() => handleExercisePress(exercise, dayId)}
                  onLongPress={() => handleLongExercisePress(exercise, dayId)}
                  delayLongPress={200}>
                  <Image
                    source={{
                      uri: exercise.coverImage?.uri,
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
                      {exercise.name}
                    </CustomText>
                    <CustomText
                      color={COLORS.white}
                      fontFamily="medium"
                      fontSize={12}>
                      {`${exercise.exerciseSettings?.sets || 3} sets x ${
                        exercise.exerciseSettings?.reps || 10
                      } reps`}
                    </CustomText>
                  </View>
                  <TouchableOpacity
                    style={{justifyContent: 'center'}}
                    onPress={event =>
                      handleExerciseMenuPress(
                        event,
                        exercise,
                        dayId,
                        superset.id,
                      )
                    }>
                    <CustomIcon
                      Icon={ICONS.SidMultiDotView}
                      height={verticalScale(27)}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    };

    // Render exercise card (either a single exercise or a superset)
    const renderExerciseCard = (item: WorkoutExerciseItem, dayId: string) => {
      if ('type' in item && item.type === 'superset') {
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: horizontalScale(5),
            }}>
            {renderSupersetCard(item, dayId)}
            <TouchableOpacity
              onPress={event => handleSupersetMenuPress(event, item, dayId)}
              style={{padding: 5}}>
              <CustomIcon
                Icon={ICONS.SidMultiDotView}
                height={verticalScale(37)}
              />
            </TouchableOpacity>
          </View>
        );
      } else {
        return renderSingleExerciseCard(item, dayId);
      }
    };

    const renderDaySection = (_day: any, index: number) => {
      const dayId = workoutData.exerciseList[index].id;

      return (
        <View key={index} style={styles.daySection}>
          <View style={styles.daySectionHeader}>
            <View style={styles.dayTitleContainer}>
              <View
                style={{
                  height: 2,
                  width: 10,
                  backgroundColor: COLORS.white,
                }}
              />
              <View style={styles.dayIndicator}>
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: workoutData.exerciseList[index].color,
                    },
                  ]}
                />
              </View>
              <CustomText
                fontSize={16}
                fontFamily="medium"
                color={COLORS.white}
                style={{flex: 0.95}}>
                {workoutData.exerciseList[index].dayName}
              </CustomText>
            </View>
            <TouchableOpacity
              style={styles.dayMenuButton}
              onPress={event => handleDayMenuPress(event, index)}>
              <CustomIcon
                Icon={ICONS.HamBurgerMenuIcon}
                height={15}
                width={15}
              />
            </TouchableOpacity>
          </View>

          {/* Floating action bar for this specific day */}
          {renderFloatingActionBar(dayId)}

          <View style={styles.daySectionContent}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(5),
                flex: 1,
              }}>
              {_day.exercises && _day.exercises.length > 0 ? (
                <View style={{flex: 1}}>
                  {_day.exercises.map(
                    (exercise: any, exerciseIndex: number) => (
                      <View key={exerciseIndex}>
                        {renderExerciseCard(exercise, dayId)}
                      </View>
                    ),
                  )}
                </View>
              ) : (
                <View style={styles.emptyExercisesContainer}>
                  <CustomText
                    fontSize={14}
                    fontFamily="medium"
                    color={COLORS.whiteTail}>
                    No exercises added yet
                  </CustomText>
                </View>
              )}
              <TouchableOpacity
                style={{justifyContent: 'center'}}
                onPress={event => {}}>
                <CustomIcon
                  Icon={ICONS.SidMultiDotView}
                  height={verticalScale(40)}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                setSelectedDayForAddExercise(workoutData.exerciseList[index]);
                dispatch(setActiveStep(8));
              }}
              style={styles.addExerciseButton}>
              <CustomText
                fontSize={14}
                fontFamily="medium"
                color={COLORS.white}>
                Add Exercise
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    // Create an array of days based on daysInWeek
    const days = Array.from(
      {length: workoutData.exerciseList.length || 1},
      (_, i) => ({
        day: `Day ${i + 1}`,
        exercises: workoutData.exerciseList[i]?.exercise || [],
      }),
    );

    // Render floating action bar for a specific day
    const renderFloatingActionBar = (dayId: string) => {
      const daySelections = selectedExercisesByDay[dayId] || [];
      const fadeAnim = fadeAnimsByDay[dayId];

      if (!fadeAnim || daySelections.length === 0) return null;

      return (
        <Animated.View
          style={[
            styles.floatingActionBar,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={{flexDirection: 'row', gap: horizontalScale(20)}}>
            <TouchableOpacity
              onPress={() => handleClearSelection(dayId)}
              style={styles.actionButton}>
              <CustomIcon Icon={ICONS.DeleteIcon} height={15} width={15} />
              <CustomText fontSize={6} fontFamily="bold">
                CANCEL
              </CustomText>
            </TouchableOpacity>
          </View>
          {daySelections.length > 1 && (
            <TouchableOpacity
              onPress={() => handleCreateSuperset(dayId)}
              style={styles.actionButton}>
              <CustomIcon Icon={ICONS.SuperSetIcon} height={15} width={15} />
              <CustomText fontSize={6} fontFamily="bold">
                SUPERSET
              </CustomText>
            </TouchableOpacity>
          )}
        </Animated.View>
      );
    };

    return (
      <>
        <ScrollView
          style={{
            flex: 1,
            paddingHorizontal: horizontalScale(10),
          }}>
          {days.map((day, index) => {
            return (
              <View key={index}>
                {renderDaySection(day, index)}
                {days[index + 1] && index < workoutData.daysInWeek - 1 && (
                  <View style={styles.restPeriodContainer}>
                    <View style={styles.restPeriodLine} />
                    <CustomText
                      fontSize={12}
                      fontFamily="medium"
                      color={COLORS.whiteTail}>
                      {workoutData.exerciseList[index].restPeriod * 24} hours
                      rest period
                    </CustomText>
                    <View style={styles.restPeriodLine} />
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            onPress={() => {
              dispatch(addDay(getRandomColor()));
            }}
            style={styles.addWorkoutsButton}>
            <CustomText fontSize={14} fontFamily="medium" color={COLORS.white}>
              Add workouts
            </CustomText>
          </TouchableOpacity>
        </ScrollView>

        <ContextMenu
          isVisible={contextMenu.isVisible}
          onClose={() => setContextMenu({...contextMenu, isVisible: false})}
          position={contextMenu.position}
          menuItems={
            workoutData.exerciseList?.length > 1
              ? [
                  {
                    label: 'Rename',
                    onPress: () => {
                      setContextMenu({...contextMenu, isVisible: false});
                      setSelectedDayForColor(contextMenu.selectedDayIndex);
                      setShowDayNameModal(true);
                    },
                  },
                  {
                    label: 'Color',
                    onPress: () => {
                      setContextMenu({...contextMenu, isVisible: false});
                      setSelectedDayForColor(contextMenu.selectedDayIndex);
                      setShowColorModal(true);
                    },
                  },
                  {
                    label: 'Rest Period',
                    onPress: () => {
                      setContextMenu({...contextMenu, isVisible: false});
                      setSelectedDayForColor(contextMenu.selectedDayIndex);
                      setShowRestPeriodModal(true);
                    },
                  },
                  {
                    label: 'Instructions',
                    onPress: () => {
                      setContextMenu({...contextMenu, isVisible: false});
                      setSelectedDayForColor(contextMenu.selectedDayIndex);
                      setShowInstructionModal(true);
                    },
                  },
                  {
                    label: 'Delete',
                    onPress: () => {
                      dispatch(
                        removeDay(
                          workoutData.exerciseList[contextMenu.selectedDayIndex]
                            .id,
                        ),
                      );
                      setContextMenu({...contextMenu, isVisible: false});
                    },
                    textColor: '#E74C3C',
                  },
                ]
              : [
                  {
                    label: 'Rename',
                    onPress: () => {
                      setContextMenu({...contextMenu, isVisible: false});
                      setSelectedDayForColor(contextMenu.selectedDayIndex);
                      setShowDayNameModal(true);
                    },
                  },
                  {
                    label: 'Color',
                    onPress: () => {
                      setContextMenu({...contextMenu, isVisible: false});
                      setSelectedDayForColor(contextMenu.selectedDayIndex);
                      setShowColorModal(true);
                    },
                  },
                  {
                    label: 'Rest Period',
                    onPress: () => {
                      setContextMenu({...contextMenu, isVisible: false});
                      setSelectedDayForColor(contextMenu.selectedDayIndex);
                      setShowRestPeriodModal(true);
                    },
                  },
                  {
                    label: 'Instructions',
                    onPress: () => {
                      setContextMenu({...contextMenu, isVisible: false});
                      setSelectedDayForColor(contextMenu.selectedDayIndex);
                      setShowInstructionModal(true);
                    },
                  },
                ]
          }
        />

        <ContextMenu
          isVisible={exerciseContextMenu.isVisible}
          onClose={() =>
            setExerciseContextMenu({...exerciseContextMenu, isVisible: false})
          }
          position={exerciseContextMenu.position}
          menuItems={
            exerciseContextMenu.isSuperset
              ? [
                  // Superset menu items
                  {
                    label: 'Delete Superset',
                    onPress: () => {
                      dispatch(
                        deleteSuperset({
                          dayId: exerciseContextMenu.dayId,
                          supersetId: exerciseContextMenu.supersetId,
                        }),
                      );
                      setExerciseContextMenu({
                        ...exerciseContextMenu,
                        isVisible: false,
                      });
                    },
                    textColor: '#E74C3C',
                  },
                ]
              : exerciseContextMenu.supersetId
              ? [
                  // Exercise in superset menu items
                  {
                    label: 'Remove from Superset',
                    onPress: () => {
                      dispatch(
                        removeExerciseFromSuperset({
                          dayId: exerciseContextMenu.dayId,
                          supersetId: exerciseContextMenu.supersetId,
                          exerciseId: exerciseContextMenu.selectedExerciseId,
                        }),
                      );
                      setExerciseContextMenu({
                        ...exerciseContextMenu,
                        isVisible: false,
                      });
                    },
                    textColor: '#E74C3C',
                  },
                ]
              : [
                  // Regular exercise menu items
                  {
                    label: 'Remove',
                    onPress: () => {
                      dispatch(
                        removeExercise(exerciseContextMenu.selectedExerciseId),
                      );
                      setExerciseContextMenu({
                        ...exerciseContextMenu,
                        isVisible: false,
                      });
                    },
                    textColor: '#E74C3C',
                  },
                ]
          }
        />

        <SelectDayColorModal
          isModalVisible={showColorModal}
          closeModal={() => setShowColorModal(false)}
          onSelectColor={handleColorSelect}
          initialColor={
            workoutData.exerciseList[selectedDayForColor].color || 'black'
          }
        />

        <UpdateInstructionforWorkoutModal
          isModalVisible={showInstructionModal}
          closeModal={() => setShowInstructionModal(false)}
          onSaveInstruction={handleSaveInstruction}
          initialInstruction={
            workoutData.exerciseList[selectedDayForColor].dayInstruction
          }
        />
        <UpdateDayNameModal
          isModalVisible={showDayNameModal}
          closeModal={() => setShowDayNameModal(false)}
          onSaveName={handleSaveDayName}
          initialName={workoutData.exerciseList[selectedDayForColor].dayName}
        />

        <UpdateDayRestPeriodModal
          isModalVisible={showRestPeriodModal}
          closeModal={() => setShowRestPeriodModal(false)}
          onSaveRestPeriod={handleSaveRestPeriod}
          initialRestPeriod={
            workoutData.exerciseList[selectedDayForColor].restPeriod
          }
        />

        {/* Floating action bar for superset creation */}
      </>
    );
  };

  const DetailsTab = () => {
    const workoutGoalIcon = () => {
      switch (workoutData.goal) {
        case 'strength':
          return ICONS.ExerciseGoal1Icon;
        case 'endurance':
          return ICONS.ExerciseGoal3Icon;
        case 'hypertrophy':
          return ICONS.ExerciseGoal3Icon;
        case 'Cardio':
          return ICONS.ExerciseGoal4Icon;
        case 'Flexibility':
          return ICONS.ExerciseGoal5Icon;
        case 'Functionality':
          return ICONS.ExerciseGoal6Icon;
        default:
          return ICONS.ExerciseGoal1Icon;
      }
    };

    const workoutLocation = () => {
      switch (workoutData.location!.toLowerCase()) {
        case 'gym':
          return ICONS.ExerciseLocation1Icon;
        case 'home':
          return ICONS.ExerciseLocation2Icon;
        case 'outdoor':
          return ICONS.ExerciseLocation3Icon;
        default:
          return ICONS.ExerciseLocation1Icon;
      }
    };

    const renderLevelWithStars = () => {
      const getDifficultyLevel = (rating: number) => {
        if (rating <= 1) return 'Beginner';
        if (rating <= 2) return 'Intermediate';
        return 'Advanced';
      };

      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: verticalScale(10),
          }}>
          <StarRatingDisplay
            rating={workoutData.difficulty}
            maxStars={3}
            starSize={53}
            color={COLORS.yellow}
            emptyColor={COLORS.whiteTail}
            StarIconComponent={({type, size}) => {
              const Icon =
                type === 'full' || type === 'half'
                  ? ICONS.FilledStarIcon
                  : ICONS.EmptyStarIcon;

              return <CustomIcon Icon={Icon} height={size} width={size} />;
            }}
          />
          <CustomText fontFamily="bold" color={COLORS.white}>
            {getDifficultyLevel(workoutData.difficulty)}
          </CustomText>
        </View>
      );
    };

    return (
      <ScrollView contentContainerStyle={styles.detailsContainer}>
        <View style={styles.detailsStatsContainer}>
          <View style={styles.statItem}>
            <CustomIcon Icon={workoutGoalIcon()} height={48} width={48} />
            <CustomText fontSize={14} fontFamily="bold">
              {workoutData.goal}
            </CustomText>
          </View>
          <View style={styles.statItem}>
            <CustomIcon Icon={ICONS.GreenCalendarIcon} height={48} width={48} />
            <CustomText fontSize={14} fontFamily="bold">
              {workoutData.durationInWeeks} Weeks
            </CustomText>
          </View>
          <View style={styles.statItem}>
            <CustomIcon Icon={workoutLocation()} height={48} width={48} />
            <CustomText fontSize={14} fontFamily="bold">
              {workoutData.location}
            </CustomText>
          </View>
          <View style={styles.statItem}>
            <CustomText fontSize={30} fontFamily="bold">
              {workoutData.daysInWeek}
            </CustomText>
            <CustomText fontSize={14} fontFamily="bold">
              Days
            </CustomText>
          </View>
        </View>
        {renderLevelWithStars()}
        <View
          style={{
            paddingHorizontal: horizontalScale(20),
            gap: verticalScale(10),
          }}>
          <CustomText fontSize={22} fontFamily="extraBold">
            Details
          </CustomText>
          <CustomText fontSize={14} style={styles.detailsText}>
            {workoutData.instruction}
          </CustomText>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderTabs()}
      {renderMainView()}
    </View>
  );
};

export default WorkroutDataScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBrown,
  },
  headerBackground: {
    height: hp(25),
    width: '100%',
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(30),
    marginVertical: verticalScale(20),
  },
  tabButton: {
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(30),
    paddingVertical: verticalScale(10),
    borderRadius: 10,
  },
  detailsContainer: {
    paddingHorizontal: horizontalScale(10),
    gap: verticalScale(10),
  },
  detailsStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    minHeight: verticalScale(85),
    maxHeight: verticalScale(85),
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelContainer: {
    gap: verticalScale(20),
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    justifyContent: 'center',
  },
  detailsText: {
    lineHeight: 22,
  },
  // Exercise tab styles
  daySection: {
    marginBottom: verticalScale(10),
    backgroundColor: COLORS.brown,
  },
  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
  },
  dayTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  dayIndicator: {
    width: 20,
    alignItems: 'center',
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayMenuButton: {
    padding: 8,
  },
  daySectionContent: {
    paddingHorizontal: horizontalScale(10),
    paddingBottom: verticalScale(10),
    gap: verticalScale(5),
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brown,
    borderRadius: 10,
    padding: 10,
    marginBottom: verticalScale(10),
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  exerciseInfo: {
    flex: 1,
    paddingHorizontal: horizontalScale(10),
  },
  exerciseMenuButton: {
    padding: 5,
  },
  emptyExercisesContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    flex: 1,
  },
  addExerciseButton: {
    backgroundColor: '#DC3639',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: verticalScale(10),
  },
  restPeriodContainer: {
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(5),
  },
  restPeriodLine: {
    width: 1,
    height: verticalScale(20),
    backgroundColor: COLORS.white,
  },
  addWorkoutsButton: {
    backgroundColor: '#DC3676',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginVertical: verticalScale(20),
  },
  // Styles for superset functionality
  floatingActionBar: {
    backgroundColor: COLORS.brown,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: verticalScale(10),
    marginHorizontal: horizontalScale(10),
    marginTop: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(2),
    padding: verticalScale(5),
  },
});
