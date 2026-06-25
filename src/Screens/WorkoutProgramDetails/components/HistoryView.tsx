import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {FC} from 'react';
import {horizontalScale, verticalScale} from '../../../Utilities/Metrics';
import {CustomText} from '../../../Components/CustomText';
import COLORS from '../../../Utilities/Colors';
import CustomIcon from '../../../Components/CustomIcon';
import ICONS from '../../../Assets/Icons';
import {useAppSelector} from '../../../Redux/store';

interface HistoryViewProps {
  planDayData: any;
  dayWorkoutData: any;
  ScheduleHistoryData: string;
}

const HistoryView: FC<HistoryViewProps> = ({
  planDayData,
  dayWorkoutData,
  ScheduleHistoryData,
}) => {
  const {scheduleData} = useAppSelector(state => state.scheduleData);
  const {exerciseData} = useAppSelector(state => state.exerciseData);

  // Filter history by plan, workout, AND matching date
  const getScheduleHistory = scheduleData
    ?.filter(item => {
      if (
        item.type !== 'workout' ||
        item.content.plan_id !== planDayData.allData.plan_id ||
        dayWorkoutData[0].workout_id !== item.content.Workout_id
      ) {
        return false;
      }

      if (!ScheduleHistoryData || typeof ScheduleHistoryData !== 'string')
        return true;

      const targetDate = ScheduleHistoryData.split('T')[0];
      const itemDate = (item.schedule_at || item.updated_at)?.split('T')[0];

      return itemDate === targetDate;
    })
    ?.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

  // Filter history to only include items with valid sets
  const historyWithSets = getScheduleHistory?.filter(item => {
    const exercises = item?.content?.Exercises;

    if (Array.isArray(exercises)) {
      // New structure: check if any exercise in any group has sets
      return exercises.some((group: any) => {
        if (group?.content && Array.isArray(group.content)) {
          return group.content.some(
            (ex: any) => ex?.Set && Array.isArray(ex.Set) && ex.Set.length > 0,
          );
        }
        return false;
      });
    } else if (typeof exercises === 'object' && exercises?.content) {
      // Old structure: check if any exercise has sets
      return exercises.content?.some(
        (ex: any) => ex?.Set && Array.isArray(ex.Set) && ex.Set.length > 0,
      );
    }

    return false;
  });

  const renderItem = ({item}: any) => {
    const {scheduleItem, exercise} = item;

    const findScheduleExercise = exerciseData?.find(
      ex => Number(ex.exercise_id) === Number(exercise?.Exercise_id),
    );

    return (
      <View
        style={{
          backgroundColor: COLORS.lightBrown,
          padding: 10,
          borderRadius: 10,
          flexDirection: 'row',
          gap: verticalScale(10),
        }}>
        <View
          style={{
            backgroundColor: COLORS.whiteTail,
            paddingVertical: verticalScale(10),
            paddingHorizontal: horizontalScale(10),
            borderRadius: 10,
          }}>
          <View
            style={{
              width: 35,
              height: 35,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: COLORS.sharpBlue,
              borderRadius: 100,
            }}>
            <CustomIcon Icon={ICONS.DumbellWhiteIcon} height={18} width={18} />
          </View>
        </View>

        <View style={{gap: verticalScale(5)}}>
          <CustomText fontFamily="medium" fontSize={15}>
            {findScheduleExercise?.name || 'Unknown'}
          </CustomText>

          <CustomText fontFamily="italic" fontSize={14}>
            {(() => {
              const date = new Date(scheduleItem.updated_at);
              return date.toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
            })()}
          </CustomText>
        </View>
      </View>
    );
  };

  const flatExerciseHistory = React.useMemo(() => {
    const result: any[] = [];

    historyWithSets?.forEach(item => {
      const exercises = item?.content?.Exercises;

      // NEW STRUCTURE (groups)
      if (Array.isArray(exercises)) {
        exercises.forEach((group: any) => {
          group?.content?.forEach((ex: any) => {
            if (Array.isArray(ex?.Set) && ex.Set.length > 0) {
              result.push({
                scheduleItem: item,
                exercise: ex,
              });
            }
          });
        });
      }

      // OLD STRUCTURE (fallback)
      else if (exercises?.content) {
        exercises.content.forEach((ex: any) => {
          if (Array.isArray(ex?.Set) && ex.Set.length > 0) {
            result.push({
              scheduleItem: item,
              exercise: ex,
            });
          }
        });
      }
    });

    return result;
  }, [historyWithSets]);

  return (
    <ScrollView
      style={{
        paddingBottom: verticalScale(10),
        paddingHorizontal: horizontalScale(10),
      }}
      contentContainerStyle={{
        rowGap: verticalScale(10),
      }}>
      {historyWithSets && historyWithSets?.length > 0 ? (
        <FlatList
          data={flatExerciseHistory}
          keyExtractor={(item, index) =>
            `${item.exercise.Exercise_id}-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: verticalScale(10),
            paddingHorizontal: horizontalScale(10),
            rowGap: verticalScale(10),
          }}
          ListEmptyComponent={
            <CustomText
              style={styles.noHistoryText}
              fontSize={16}
              fontFamily="bold"
              color={COLORS.yellow}>
              No history available for now
            </CustomText>
          }
        />
      ) : (
        <CustomText
          style={styles.noHistoryText}
          fontSize={16}
          fontFamily="bold"
          color={COLORS.yellow}>
          No history available for now{' '}
        </CustomText>
      )}
    </ScrollView>
  );
};

export default HistoryView;

const styles = StyleSheet.create({
  noHistoryText: {
    flex: 1,
    textAlign: 'center',
  },
});
