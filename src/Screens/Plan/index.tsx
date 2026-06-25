import React, {FC} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import AddLogButton from '../../Components/AddLogButton';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import {
  setActiveNutritionprogramIndex,
  setActivePlanIndex,
  setActiveWorkoutprogramIndex,
  setCurrentprogramId,
  setPlanTab,
} from '../../Redux/slices/initialSlice';
import {
  resetNewWorkoutSlice,
  setActiveStep,
} from '../../Redux/slices/newWorkoutSlice';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import {ActivePlansData, myMealsList} from '../../Seeds/Plans';
import {PlanTabScreenProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale} from '../../Utilities/Metrics';
import ActivePlanList from './ActivePlanList';
import MealPlansList from './MealPlansList';
import NutritionPlanList from './NutritionPlanList';
import NutritionProgramDetails from './NutritionProgramDetails';
import WorkoutPlansList from './WorkoutPlansList';
import WorkoutProgramDetails from './WorkoutProgramDetails';

const PLAN: FC<PlanTabScreenProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {
    planTab,
    activePlanIndex,
    currentProgramId,
    activeWorkoutprogramIndex,
    activeNutritionprogramIndex,
  } = useAppSelector(state => state.initial);

  const topTabsData = [
    {
      label: 'Active Plans',
      value: 0,
      onClick: () => {
        dispatch(setPlanTab(0));
        dispatch(setActivePlanIndex(0));
        dispatch(setActiveWorkoutprogramIndex(0));
        dispatch(setActiveNutritionprogramIndex(0));
      },
    },
    {
      label: 'My Meals',
      value: 1,
      onClick: () => {
        dispatch(setPlanTab(1));
        dispatch(setActivePlanIndex(0));
        dispatch(setActiveWorkoutprogramIndex(0));
        dispatch(setActiveNutritionprogramIndex(0));
      },
    },
    {
      label: 'Training',
      value: 2,
      onClick: () => {
        dispatch(setPlanTab(2));
        dispatch(setActivePlanIndex(0));
        dispatch(setActiveWorkoutprogramIndex(0));
        dispatch(setActiveNutritionprogramIndex(0));
      },
    },
    {
      label: 'Nutrition',
      value: 3,
      onClick: () => {
        dispatch(setPlanTab(3));
        dispatch(setActivePlanIndex(0));
        dispatch(setActiveWorkoutprogramIndex(0));
        dispatch(setActiveNutritionprogramIndex(0));
      },
    },
  ];

  const renderTopTabs = () => {
    return (
      <View style={styles.topTabsContainer}>
        <View style={styles.tabsWrapper}>
          {topTabsData.map(tab => (
            <Pressable key={tab.value} onPress={tab.onClick}>
              <CustomText
                fontSize={13}
                fontFamily="medium"
                color={COLORS.whiteTail}
                style={[styles.tab, planTab === tab.value && styles.activeTab]}>
                {tab.label}
              </CustomText>
            </Pressable>
          ))}
        </View>
        <CustomIcon Icon={ICONS.FilterModalIcon} height={20} width={20} />
      </View>
    );
  };

  const renderPlanList = () => {
    switch (planTab) {
      case 0:
        return activePlanIndex === 0 ? (
          <ActivePlanList actviePlanList={ActivePlansData} />
        ) : activePlanIndex === 1 ? (
          <WorkoutProgramDetails
            onPressBack={() => {
              dispatch(setActivePlanIndex(0));
              dispatch(setCurrentprogramId(null));
            }}
          />
        ) : (
          <NutritionProgramDetails
            onPressBack={() => {
              dispatch(setActivePlanIndex(0));
              dispatch(setCurrentprogramId(null));
            }}
          />
        );
      case 1:
        return <MealPlansList navigation={navigation} />;
      case 2:
        return <WorkoutPlansList navigation={navigation} />;
      case 3:
        return <NutritionPlanList navigation={navigation} />;
    }
  };

  const LOGGING_MENU_ITEMS = [
    {
      icon: ICONS.WorkoutLogIcon,
      label: 'New workout Plan',
      onPress: () => {
        navigation.navigate('addNewWorkout');
        dispatch(resetNewWorkoutSlice());
        dispatch(setActiveStep(1));
      },
    },
    {
      icon: ICONS.MealLogIcon,
      label: 'New Meal',
      onPress: () => {
        navigation.navigate('addNewMeal');
      },
    },
  ];

  return (
    <View style={styles.main}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        {renderTopTabs()}
        {renderPlanList()}
        {planTab !== 1 &&
          activePlanIndex === 0 &&
          activeNutritionprogramIndex === 0 &&
          activeWorkoutprogramIndex === 0 && (
            <AddLogButton menuItems={LOGGING_MENU_ITEMS} />
          )}
      </SafeAreaView>
    </View>
  );
};

export default PLAN;

const styles = StyleSheet.create({
  main: {
    backgroundColor: COLORS.brown,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    gap: verticalScale(20),
  },
  topTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(10),
    paddingTop: verticalScale(10),
    gap: horizontalScale(10),
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  tab: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(8),
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: COLORS.yellow,
  },
  contentContainer: {
    flexGrow: 1,
    gap: verticalScale(30),
    paddingBottom: verticalScale(20),
    backgroundColor: COLORS.darkBrown,
  },
  scrollView: {
    flex: 1,
  },
});
