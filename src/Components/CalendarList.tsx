import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {useAnimatedStyle, withSpring} from 'react-native-reanimated';
import ICONS from '../Assets/Icons';
import {
  setDates,
  setHomeActiveIndex,
  setInitialIndex,
} from '../Redux/slices/initialSlice';
import {useAppDispatch, useAppSelector} from '../Redux/store';
import COLORS from '../Utilities/Colors';
import {horizontalScale, hp, verticalScale} from '../Utilities/Metrics';
import CustomIcon from './CustomIcon';
import {CustomText} from './CustomText';
import {setShowInitialData} from '../Redux/slices/ScheduleSlice';

export interface DayItem {
  day: string;
  date: number;
  month: string;
  isToday: boolean;
  timestamp: number;
}

/**
 * Activity indicators interface for calendar days
 * Shows small icons on calendar dates when activities are logged
 */
interface ActivityIndicators {
  hasWorkout: boolean; // Shows dumbbell icon for workout activities
  hasNotes: boolean; // Shows notes icon for note entries
  hasMeal: boolean; // Shows meal icon for food logging
  hasMeasurement: boolean; // Shows measurement icon for body measurements
  workoutColor: string | null;
}

const ITEM_WIDTH = horizontalScale(55);
const ITEM_MARGIN = horizontalScale(5);
const TOTAL_ITEM_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

const DayCard = React.memo(
  ({
    item,
    onPressDate,
    selectedDate,
    activityIndicators,
  }: {
    item: DayItem;
    onPressDate: (item: DayItem) => void;
    selectedDate: DayItem | null;
    activityIndicators: ActivityIndicators;
  }) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{scale: withSpring(item.isToday ? 1.05 : 1)}],
    }));

    const dayCardBackgroundColor = useMemo(() => {
      if (selectedDate) {
        if (selectedDate.timestamp === item.timestamp) {
          return COLORS.yellow;
        } else {
          return COLORS.whiteTail;
        }
      } else {
        if (item.isToday) {
          return COLORS.yellow;
        } else {
          return COLORS.whiteTail;
        }
      }
    }, [item.isToday, item.timestamp, selectedDate?.timestamp]);

    const textColor = useMemo(() => {
      if (selectedDate) {
        if (selectedDate.timestamp === item.timestamp) {
          return COLORS.white;
        } else {
          return COLORS.nickel;
        }
      } else {
        if (item.isToday) {
          return COLORS.white;
        } else {
          return COLORS.nickel;
        }
      }
    }, [item.isToday, item.timestamp, selectedDate?.timestamp]);

    const hasAnyActivity =
      activityIndicators.hasWorkout ||
      activityIndicators.hasNotes ||
      activityIndicators.hasMeal ||
      activityIndicators.hasMeasurement;

    return (
      <TouchableOpacity onPress={() => onPressDate(item)} activeOpacity={1}>
        <Animated.View
          style={[
            styles.dayCard,
            animatedStyle,
            {
              backgroundColor: dayCardBackgroundColor,
            },
          ]}>
          <CustomText fontFamily="italic" fontSize={12} color={textColor}>
            {item.day}
          </CustomText>
          <CustomText fontFamily="bold" fontSize={12} color={textColor}>
            {item.date}
          </CustomText>

          {/* Activity Indicators */}
          {hasAnyActivity && (
            <View style={styles.activityIndicators}>
              {activityIndicators.hasWorkout && (
                <View
                  style={[
                    {
                      width: 20,
                      height: 20,
                      borderRadius: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor:
                        activityIndicators.workoutColor || COLORS.blue,
                    },
                  ]}>
                  <CustomIcon
                    Icon={ICONS.DumbellWhiteIcon}
                    width={12}
                    height={12}
                  />
                </View>
              )}
              {/* {activityIndicators.hasMeal && (
                <CustomIcon Icon={ICONS.MealLogIcon} width={15} height={15} />
              )}
              {activityIndicators.hasMeasurement && (
                <CustomIcon
                  Icon={ICONS.MeasurementLogIcon}
                  width={15}
                  height={15}
                />
              )} */}
              {activityIndicators.hasNotes && (
                <CustomIcon
                  Icon={ICONS.dumbellRedWithCalendarIcon}
                  width={15}
                  height={15}
                />
              )}
              {activityIndicators.hasMeasurement && (
                <View style={styles.hasMeasurementStyle}>
                  <CustomIcon
                    Icon={ICONS.MeasurementLogIcon}
                    width={12}
                    height={12}
                  />
                </View>
              )}
              {activityIndicators.hasMeal && (
                <View style={styles.mealStyle}>
                  <CustomIcon Icon={ICONS.mealIcon} width={12} height={12} />
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

const CalendarList = () => {
  const flatListRef = useRef<FlatList<DayItem>>(null);
  const dispatch = useAppDispatch();
  const {dates, initialIndex, homeActiveIndex} = useAppSelector(
    state => state.initial,
  );
  const {planData} = useAppSelector(state => state.planData);
  const {scheduleData} = useAppSelector(state => state.scheduleData);
  const [month, setMonth] = useState('');

  // Function to get activity indicators for a specific date
  const getActivityIndicators = useCallback(
    (timestamp: number) => {
      if (!scheduleData) {
        return {
          hasWorkout: false,
          hasNotes: false,
          hasMeal: false,
          hasMeasurement: false,
        };
      }

      const dateString = new Date(timestamp).toDateString();

      const dayActivities = scheduleData.filter(item => {
        const itemDateString = new Date(item.schedule_at).toDateString();
        return itemDateString === dateString;
      });

      let workoutColor: string | null = null;

      const workoutItem = dayActivities
        .filter(a => a.type === 'workout')
        .sort(
          (a, b) =>
            new Date(b.schedule_at).getTime() -
            new Date(a.schedule_at).getTime(),
        )[0];

      if (workoutItem) {
        const Exercise_id = Number(
          workoutItem.content.Exercises?.[0]?.content?.[0]?.Exercise_id,
        );

        const workoutData = planData
          ?.flatMap(plan => {
            if (plan.allData?.plan_id !== workoutItem.content.plan_id)
              return [];

            return (
              plan.allData?.content?.workouts
                ?.filter(w => w.workout_id === workoutItem.content.Workout_id)
                ?.map(w => ({
                  ...w,
                  plan_id: plan.allData?.plan_id,
                })) || []
            );
          })
          .find(w =>
            w.exercises.some(ex =>
              ex.workout_exercises.some(we => we.exercise_id === Exercise_id),
            ),
          );

        workoutColor = workoutData?.color || null;
      }

      return {
        hasWorkout: dayActivities.some(item => item.type === 'workout'),
        hasNotes: dayActivities.some(item => item.type === 'note'),
        hasMeal: dayActivities.some(item => item.type === 'food'),
        hasMeasurement: dayActivities.some(item => item.type === 'measurement'),
        workoutColor,
      };
    },
    [scheduleData, planData],
  );

  // When a day is pressed, update Redux index
  const onPressDate = (item: DayItem) => {
    dispatch(setShowInitialData(false));
    const index = dates.findIndex(d => d.timestamp === item.timestamp);
    if (index !== -1) {
      // If same date is clicked again → unselect
      if (initialIndex === index) {
        // dispatch(setInitialIndex(-1)); // reset selection
      } else {
        dispatch(setInitialIndex(index));
        console.log('ELSE');
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  };

  const generateDates = useCallback(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const initialMonthName = today.toLocaleString('en-US', {
      month: 'long',
    });
    setMonth(initialMonthName);

    const datesArray: DayItem[] = [];
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    let todayIndex = -1;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const date = new Date(d);
      const dayName = date
        .toLocaleString('en-US', {weekday: 'short'})
        .toUpperCase();
      const dayDate = date.getDate();
      const monthName = date.toLocaleString('en-US', {month: 'long'});
      const isToday = date.toDateString() === today.toDateString();

      datesArray.push({
        day: dayName,
        date: dayDate,
        month: monthName,
        isToday,
        timestamp: date.getTime(),
      });

      if (isToday) {
        todayIndex = datesArray.length - 1;
      }
    }

    dispatch(setInitialIndex(todayIndex));
    dispatch(setDates(datesArray));
    if (todayIndex !== -1) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: todayIndex,
          animated: false,
          viewPosition: 0.5,
        });
      });
    }
  }, [dispatch]);

  useEffect(() => {
    if (dates.length === 0) {
      generateDates();
    }
  }, [dates, generateDates]);

  const onViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: Array<{item: DayItem}>}) => {
      if (viewableItems.length > 0) {
        setMonth(viewableItems[0].item.month);
      }
    },
    [],
  );

  const getItemLayout = useCallback(
    (data: DayItem[] | null | any, index: number) => ({
      length: TOTAL_ITEM_WIDTH,
      offset: TOTAL_ITEM_WIDTH * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: DayItem) => `${item.timestamp}`, []);

  const renderDay = useCallback(
    ({item, index}: {item: DayItem; index: number}) => (
      <DayCard
        key={index}
        item={item}
        onPressDate={onPressDate}
        selectedDate={initialIndex !== -1 ? dates[initialIndex] : null}
        activityIndicators={getActivityIndicators(item.timestamp)}
      />
    ),
    [dates, initialIndex, getActivityIndicators],
  );

  const onScrollToIndexFailed = useCallback(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      const offset = info.averageItemLength * info.index;
      flatListRef.current?.scrollToOffset({offset, animated: false});

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: false,
          viewPosition: 0.5,
        });
      });
    },
    [],
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 10,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      {homeActiveIndex !== 0 && (
        <View style={{marginLeft: 10}}>
          <CustomIcon
            onPress={() => {
              dispatch(setHomeActiveIndex(0));
            }}
            Icon={ICONS.BackArrow}
          />
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity style={styles.monthButton}>
          <CustomText fontSize={17} fontFamily="bold">
            {month.toUpperCase()}
          </CustomText>
        </TouchableOpacity>
        <CustomText fontSize={14} fontFamily="regular">
          Keep track on your calendar
        </CustomText>
      </View>

      {dates.length > 0 && (
        <FlatList
          ref={flatListRef}
          data={dates}
          renderItem={renderDay}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={onScrollToIndexFailed}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={7}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.brown,
    paddingVertical: verticalScale(20),
    gap: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: horizontalScale(10),
  },
  monthButton: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopEndRadius: 5,
    borderBottomEndRadius: 5,
  },
  dayCard: {
    borderRadius: 5,
    padding: 8,
    width: ITEM_WIDTH,
    height: hp(11),
    alignItems: 'center',
    marginHorizontal: ITEM_MARGIN,
    gap: verticalScale(5),
    position: 'relative',
  },
  activityIndicators: {
    position: 'absolute',
    justifyContent: 'flex-start',
    bottom: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    maxWidth: ITEM_WIDTH - 8,
    width: '100%',
  },
  mealStyle: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 100,
    paddingVertical: verticalScale(2),
    paddingHorizontal: horizontalScale(2),
  },
  hasMeasurementStyle: {
    backgroundColor: COLORS.blue,
    borderRadius: 100,
    paddingVertical: verticalScale(2),
    paddingHorizontal: horizontalScale(2),
  },
});

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(CalendarList);
