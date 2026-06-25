import React from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {CustomText} from './CustomText';
import WorkoutHistoryCard from './WorkoutHistoryCard';
import {useAppSelector} from '../Redux/store';
import {
  selectRecentWorkouts,
  selectWorkoutStats,
} from '../Redux/slices/historySlice';
import COLORS from '../Utilities/Colors';
import {horizontalScale, verticalScale} from '../Utilities/Metrics';

interface RecentWorkoutsSectionProps {
  onViewAllPress?: () => void;
  onWorkoutPress?: (workoutId: string) => void;
}

const RecentWorkoutsSection: React.FC<RecentWorkoutsSectionProps> = ({
  onViewAllPress,
  onWorkoutPress,
}) => {
  const recentWorkouts = useAppSelector(state =>
    selectRecentWorkouts(state, 3),
  );
  const stats = useAppSelector(selectWorkoutStats);

  const formatStreak = (streak: number) => {
    if (streak === 0) return 'No current streak';
    if (streak === 1) return '1 day streak';
    return `${streak} day streak`;
  };

  const formatTotalVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <CustomText fontFamily="bold" fontSize={18} color={COLORS.white}>
          Recent Workouts
        </CustomText>
        {recentWorkouts.length > 0 && (
          <TouchableOpacity onPress={onViewAllPress}>
            <CustomText fontFamily="medium" fontSize={14} color={COLORS.yellow}>
              View All
            </CustomText>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <CustomText fontFamily="bold" fontSize={16} color={COLORS.white}>
            {stats.totalWorkouts}
          </CustomText>
          <CustomText fontFamily="regular" fontSize={12} color={COLORS.nickel}>
            Total Workouts
          </CustomText>
        </View>

        <View style={styles.statCard}>
          <CustomText fontFamily="bold" fontSize={16} color={COLORS.white}>
            {formatTotalVolume(stats.totalVolume)}
          </CustomText>
          <CustomText fontFamily="regular" fontSize={12} color={COLORS.nickel}>
            Total Volume
          </CustomText>
        </View>

        <View style={styles.statCard}>
          <CustomText fontFamily="bold" fontSize={16} color={COLORS.white}>
            {Math.round(stats.averageWorkoutDuration)}m
          </CustomText>
          <CustomText fontFamily="regular" fontSize={12} color={COLORS.nickel}>
            Avg Duration
          </CustomText>
        </View>

        <View style={styles.statCard}>
          <CustomText
            fontFamily="bold"
            fontSize={16}
            color={stats.currentStreak > 0 ? COLORS.green : COLORS.nickel}>
            {stats.currentStreak}
          </CustomText>
          <CustomText fontFamily="regular" fontSize={12} color={COLORS.nickel}>
            Day Streak
          </CustomText>
        </View>
      </View>

      {/* Recent Workouts List */}
      {recentWorkouts.length > 0 ? (
        <FlatList
          data={recentWorkouts}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <WorkoutHistoryCard
              workout={item}
              onPress={() => onWorkoutPress?.(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <CustomText
            fontFamily="medium"
            fontSize={16}
            color={COLORS.nickel}
            style={styles.emptyTitle}>
            No workouts yet
          </CustomText>
          <CustomText
            fontFamily="regular"
            fontSize={14}
            color={COLORS.whiteTail}
            style={styles.emptySubtitle}>
            Start your first workout to see your history here
          </CustomText>
        </View>
      )}

      {/* Current Streak Info */}
      {stats.currentStreak > 0 && (
        <View style={styles.streakContainer}>
          <View style={styles.streakIndicator} />
          <CustomText fontFamily="medium" fontSize={14} color={COLORS.green}>
            🔥 {formatStreak(stats.currentStreak)}! Keep it up!
          </CustomText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: verticalScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
  },
  statCard: {
    backgroundColor: COLORS.brown,
    borderRadius: verticalScale(8),
    padding: horizontalScale(12),
    alignItems: 'center',
    flex: 1,
    marginHorizontal: horizontalScale(2),
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(32),
    paddingHorizontal: horizontalScale(16),
  },
  emptyTitle: {
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGreen,
    borderRadius: verticalScale(8),
    padding: horizontalScale(12),
    marginHorizontal: horizontalScale(16),
    marginTop: verticalScale(12),
  },
  streakIndicator: {
    width: horizontalScale(8),
    height: verticalScale(8),
    borderRadius: verticalScale(4),
    backgroundColor: COLORS.green,
    marginRight: horizontalScale(8),
  },
});

export default RecentWorkoutsSection;
