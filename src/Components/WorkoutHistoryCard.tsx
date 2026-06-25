import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { CustomText } from "./CustomText";
import { WorkoutHistory } from "../Redux/slices/historySlice";
import COLORS from "../Utilities/Colors";
import { horizontalScale, verticalScale } from "../Utilities/Metrics";

interface WorkoutHistoryCardProps {
  workout: WorkoutHistory;
  onPress?: () => void;
}

const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({
  workout,
  onPress,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case "excellent":
        return COLORS.green;
      case "good":
        return COLORS.blue;
      case "average":
        return COLORS.yellow;
      case "poor":
        return COLORS.orange;
      case "terrible":
        return COLORS.red;
      default:
        return COLORS.nickel;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case "gym":
        return "🏋️";
      case "home":
        return "🏠";
      case "outdoor":
        return "🌳";
      default:
        return "📍";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <CustomText
            fontFamily="bold"
            fontSize={16}
            color={COLORS.white}
            numberOfLines={1}
          >
            {workout.workoutName}
          </CustomText>
          <View style={styles.locationContainer}>
            <CustomText fontSize={12}>{getLocationIcon(workout.location)}</CustomText>
          </View>
        </View>
        <CustomText
          fontFamily="medium"
          fontSize={12}
          color={COLORS.nickel}
        >
          {formatDate(workout.date)}
        </CustomText>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <CustomText
            fontFamily="bold"
            fontSize={14}
            color={COLORS.white}
          >
            {workout.duration ? formatDuration(workout.duration) : "N/A"}
          </CustomText>
          <CustomText
            fontFamily="regular"
            fontSize={10}
            color={COLORS.nickel}
          >
            Duration
          </CustomText>
        </View>

        <View style={styles.statItem}>
          <CustomText
            fontFamily="bold"
            fontSize={14}
            color={COLORS.white}
          >
            {workout.totalSets}
          </CustomText>
          <CustomText
            fontFamily="regular"
            fontSize={10}
            color={COLORS.nickel}
          >
            Sets
          </CustomText>
        </View>

        <View style={styles.statItem}>
          <CustomText
            fontFamily="bold"
            fontSize={14}
            color={COLORS.white}
          >
            {workout.totalVolume.toLocaleString()}
          </CustomText>
          <CustomText
            fontFamily="regular"
            fontSize={10}
            color={COLORS.nickel}
          >
            Volume (lbs)
          </CustomText>
        </View>

        <View style={styles.statItem}>
          <CustomText
            fontFamily="bold"
            fontSize={14}
            color={COLORS.white}
          >
            {workout.exercises.length}
          </CustomText>
          <CustomText
            fontFamily="regular"
            fontSize={10}
            color={COLORS.nickel}
          >
            Exercises
          </CustomText>
        </View>
      </View>

      {workout.mood && (
        <View style={styles.moodRow}>
          <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(workout.mood) }]} />
          <CustomText
            fontFamily="medium"
            fontSize={12}
            color={COLORS.nickel}
            style={{ textTransform: "capitalize" }}
          >
            Felt {workout.mood}
          </CustomText>
        </View>
      )}

      {workout.notes && (
        <CustomText
          fontFamily="italic"
          fontSize={12}
          color={COLORS.whiteTail}
          numberOfLines={2}
          style={styles.notes}
        >
          "{workout.notes}"
        </CustomText>
      )}

      {workout.tags && workout.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {workout.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <CustomText
                fontFamily="medium"
                fontSize={10}
                color={COLORS.yellow}
              >
                #{tag}
              </CustomText>
            </View>
          ))}
          {workout.tags.length > 3 && (
            <CustomText
              fontFamily="medium"
              fontSize={10}
              color={COLORS.nickel}
            >
              +{workout.tags.length - 3} more
            </CustomText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.brown,
    borderRadius: verticalScale(12),
    padding: horizontalScale(16),
    marginVertical: verticalScale(6),
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
  },
  header: {
    marginBottom: verticalScale(12),
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  locationContainer: {
    backgroundColor: COLORS.darkBrown,
    borderRadius: verticalScale(12),
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  moodIndicator: {
    width: horizontalScale(8),
    height: verticalScale(8),
    borderRadius: verticalScale(4),
    marginRight: horizontalScale(6),
  },
  notes: {
    marginBottom: verticalScale(8),
    fontStyle: "italic",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tag: {
    backgroundColor: COLORS.darkBrown,
    borderRadius: verticalScale(8),
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(2),
    marginRight: horizontalScale(4),
    marginBottom: verticalScale(2),
  },
});

export default WorkoutHistoryCard;
