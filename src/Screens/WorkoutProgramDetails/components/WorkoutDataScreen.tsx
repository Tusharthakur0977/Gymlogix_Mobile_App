import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import {CustomText} from '../../../Components/CustomText';
import COLORS from '../../../Utilities/Colors';
import {
  horizontalScale,
  verticalScale,
  wp,
  hp,
} from '../../../Utilities/Metrics';
import CustomIcon from '../../../Components/CustomIcon';
import ICONS from '../../../Assets/Icons';

// Mock data for the workout program
const workoutProgramData = {
  title: 'New Training Program',
  coverImage:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  days: [
    {
      day: 'Day 1',
      exercises: [
        {
          name: 'Smith machine shrug',
          sets: 3,
          reps: 3,
          image:
            'https://images.unsplash.com/photo-1613845205719-8c87760ab728?q=80&w=1635&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
      ],
    },
    {
      day: 'Day 2',
      exercises: [],
    },
  ],
};

const WorkoutDataScreen = () => {
  const [activeTab, setActiveTab] = useState(1); // 1 for Exercise, 2 for Details
  const [expandedDays, setExpandedDays] = useState<number[]>([0]); // Default expand first day

  const toggleDayExpansion = (dayIndex: number) => {
    if (expandedDays.includes(dayIndex)) {
      setExpandedDays(expandedDays.filter(index => index !== dayIndex));
    } else {
      setExpandedDays([...expandedDays, dayIndex]);
    }
  };

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveTab(1)}
          style={[
            styles.tabButton,
            {
              backgroundColor: activeTab === 1 ? COLORS.orange : 'transparent',
            },
          ]}>
          <CustomText
            fontSize={14}
            fontFamily="medium"
            color={activeTab === 1 ? COLORS.white : COLORS.white}>
            Exercise
          </CustomText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab(2)}
          style={[
            styles.tabButton,
            {
              backgroundColor: activeTab === 2 ? COLORS.orange : 'transparent',
            },
          ]}>
          <CustomText
            fontSize={14}
            fontFamily="medium"
            color={activeTab === 2 ? COLORS.white : COLORS.white}>
            Details
          </CustomText>
        </Pressable>
      </View>
    );
  };

  const renderExerciseCard = (exercise: any) => {
    return (
      <View style={styles.exerciseCard}>
        <Image source={{uri: exercise.image}} style={styles.exerciseImage} />
        <View style={styles.exerciseInfo}>
          <CustomText color={COLORS.yellow} fontSize={15} fontFamily="medium">
            {exercise.name}
          </CustomText>
          <CustomText fontFamily="italic" fontSize={15}>
            {exercise.sets} Sets x {exercise.reps} reps
          </CustomText>
        </View>
        <TouchableOpacity style={styles.exerciseMenuButton}>
          <CustomIcon Icon={ICONS.SidMultiDotView} height={24} width={24} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDaySection = (day: any, index: number) => {
    const isExpanded = expandedDays.includes(index);

    return (
      <View key={index} style={styles.daySection}>
        <TouchableOpacity
          style={styles.daySectionHeader}
          onPress={() => toggleDayExpansion(index)}>
          <View style={styles.dayTitleContainer}>
            <View style={styles.dayIndicator}>
              <View
                style={[
                  styles.dayDot,
                  {backgroundColor: index === 0 ? 'red' : 'green'},
                ]}
              />
            </View>
            <CustomText fontSize={16} fontFamily="medium" color={COLORS.white}>
              {day.day}
            </CustomText>
          </View>
          <TouchableOpacity style={styles.dayMenuButton}>
            <CustomIcon Icon={ICONS.SidMultiDotView} height={24} width={24} />
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.daySectionContent}>
            {day.exercises.length > 0 ? (
              day.exercises.map((exercise: any, exerciseIndex: number) => (
                <View key={exerciseIndex}>{renderExerciseCard(exercise)}</View>
              ))
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

            <TouchableOpacity style={styles.addExerciseButton}>
              <CustomText
                fontSize={14}
                fontFamily="medium"
                color={COLORS.white}>
                Add Exercise
              </CustomText>
            </TouchableOpacity>
          </View>
        )}

        {index < workoutProgramData.days.length - 1 && (
          <View style={styles.restPeriodContainer}>
            <View style={styles.restPeriodLine} />
            <CustomText
              fontSize={12}
              fontFamily="medium"
              color={COLORS.whiteTail}>
              24 hours rest period
            </CustomText>
            <View style={styles.restPeriodLine} />
          </View>
        )}
      </View>
    );
  };

  const renderExercisesTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {workoutProgramData.days.map((day, index) =>
          renderDaySection(day, index),
        )}

        <TouchableOpacity style={styles.addWorkoutsButton}>
          <CustomText fontSize={14} fontFamily="medium" color={COLORS.white}>
            Add workouts
          </CustomText>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderDetailsTab = () => {
    return (
      <View style={styles.tabContent}>
        <CustomText fontSize={16} fontFamily="medium" color={COLORS.white}>
          Details content goes here
        </CustomText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{uri: workoutProgramData.coverImage}}
        style={styles.headerBackground}>
        <View style={styles.headerOverlay}>
          <View style={styles.headerContent}>
            <CustomText fontSize={18} fontFamily="bold" color={COLORS.white}>
              {workoutProgramData.title}
            </CustomText>
            <TouchableOpacity style={styles.settingsButton}>
              <CustomIcon Icon={ICONS.SettingsTabIcon} height={24} width={24} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {renderTabs()}

      {activeTab === 1 ? renderExercisesTab() : renderDetailsTab()}
    </View>
  );
};

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
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    gap: horizontalScale(10),
  },
  tabButton: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(8),
    borderRadius: 8,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: horizontalScale(10),
  },
  daySection: {
    marginBottom: verticalScale(10),
  },
  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
  },
  dayTitleContainer: {
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
  },
  addExerciseButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: verticalScale(10),
  },
  restPeriodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
  },
  restPeriodLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.whiteTail,
  },
  addWorkoutsButton: {
    backgroundColor: '#E83E8C',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: verticalScale(20),
  },
});

export default WorkoutDataScreen;
