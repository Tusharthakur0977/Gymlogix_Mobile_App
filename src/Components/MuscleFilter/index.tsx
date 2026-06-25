import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { CustomText } from "../CustomText";
import CustomIcon from "../CustomIcon";
import { useAppSelector, useAppDispatch } from "../../Redux/store";
import {
  selectMuscleGroups,
  selectMuscleDatabase,
  MuscleGroup,
  SpecificMuscle
} from "../../Redux/slices/muscleSlice";
import {
  setSelectedCategory,
  setSearchQuery
} from "../../Redux/slices/exerciseCatalogSlice";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../Utilities/Metrics";
import ICONS from "../../Assets/Icons";

interface MuscleFilterProps {
  selectedCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  showAllOption?: boolean;
  compact?: boolean;
}

const MuscleFilter: React.FC<MuscleFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  showAllOption = true,
  compact = false,
}) => {
  const dispatch = useAppDispatch();
  const muscleGroups = useAppSelector(selectMuscleGroups);
  const muscleDatabase = useAppSelector(selectMuscleDatabase);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSpecificMuscles, setShowSpecificMuscles] = useState(false);

  const handleCategorySelect = (category: string | null) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      dispatch(setSelectedCategory(category));
    }
  };

  const handleSpecificMuscleSelect = (muscle: SpecificMuscle) => {
    const muscleName = muscleDatabase.find(m => m.name === muscle)?.displayName || muscle;
    dispatch(setSearchQuery(muscleName));
    setShowSpecificMuscles(false);
  };

  const getMuscleGroupColor = (group: MuscleGroup): string => {
    const colorMap: Record<MuscleGroup, string> = {
      "Chest": "#FF6B6B",
      "Back": "#4ECDC4",
      "Shoulders": "#45B7D1",
      "Arms": "#96CEB4",
      "Legs": "#FFEAA7",
      "Core": "#DDA0DD",
      "Neck": "#98D8C8",
      "Glutes": "#F7DC6F",
      "Cardio": "#BB8FCE"
    };
    return colorMap[group] || COLORS.lightBrown;
  };

  const renderMuscleGroupButton = (group: MuscleGroup) => {
    const isSelected = selectedCategory === group;
    const backgroundColor = isSelected ? getMuscleGroupColor(group) : COLORS.brown;

    return (
      <TouchableOpacity
        key={group}
        style={[
          styles.filterButton,
          compact && styles.compactButton,
          { backgroundColor }
        ]}
        onPress={() => handleCategorySelect(isSelected ? null : group)}
      >
        <CustomText
          fontSize={compact ? 10 : 12}
          color={COLORS.white}
          fontFamily={isSelected ? "bold" : "medium"}
        >
          {group}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const renderSpecificMuscleButton = (muscle: SpecificMuscle) => {
    const muscleData = muscleDatabase.find(m => m.name === muscle);
    if (!muscleData) return null;

    return (
      <TouchableOpacity
        key={muscle}
        style={[
          styles.specificMuscleButton,
          { backgroundColor: getMuscleGroupColor(muscleData.group) }
        ]}
        onPress={() => handleSpecificMuscleSelect(muscle)}
      >
        <CustomText fontSize={10} color={COLORS.white}>
          {muscleData.displayName}
        </CustomText>
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.compactScrollContent}
        >
          {showAllOption && (
            <TouchableOpacity
              style={[
                styles.filterButton,
                styles.compactButton,
                { backgroundColor: !selectedCategory ? COLORS.yellow : COLORS.brown }
              ]}
              onPress={() => handleCategorySelect(null)}
            >
              <CustomText
                fontSize={10}
                color={COLORS.white}
                fontFamily={!selectedCategory ? "bold" : "medium"}
              >
                All
              </CustomText>
            </TouchableOpacity>
          )}
          {muscleGroups.map(renderMuscleGroupButton)}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText fontSize={16} fontFamily="bold" color={COLORS.white}>
          Filter by Muscle Group
        </CustomText>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandButton}
        >
          <CustomIcon
            Icon={isExpanded ? ICONS.ArrowUpIcon : ICONS.ArrowDownIcon}
            height={12}
            width={12}
          />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Muscle Groups */}
          <View style={styles.filterSection}>
            <CustomText fontSize={14} fontFamily="medium" color={COLORS.whiteTail}>
              Muscle Groups
            </CustomText>
            <View style={styles.filterGrid}>
              {showAllOption && (
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    { backgroundColor: !selectedCategory ? COLORS.yellow : COLORS.brown }
                  ]}
                  onPress={() => handleCategorySelect(null)}
                >
                  <CustomText
                    fontSize={12}
                    color={COLORS.white}
                    fontFamily={!selectedCategory ? "bold" : "medium"}
                  >
                    All Exercises
                  </CustomText>
                </TouchableOpacity>
              )}
              {muscleGroups.map(renderMuscleGroupButton)}
            </View>
          </View>

          {/* Specific Muscles Toggle */}
          <TouchableOpacity
            style={styles.specificMusclesToggle}
            onPress={() => setShowSpecificMuscles(!showSpecificMuscles)}
          >
            <CustomText fontSize={14} fontFamily="medium" color={COLORS.whiteTail}>
              Specific Muscles
            </CustomText>
            <CustomIcon
              Icon={showSpecificMuscles ? ICONS.ArrowUpIcon : ICONS.ArrowDownIcon}
              height={12}
              width={12}
            />
          </TouchableOpacity>

          {/* Specific Muscles */}
          {showSpecificMuscles && (
            <View style={styles.specificMusclesGrid}>
              {muscleDatabase
                .filter(muscle => !selectedCategory || muscle.group === selectedCategory)
                .map(muscle => renderSpecificMuscleButton(muscle.name as SpecificMuscle))
              }
            </View>
          )}

          {/* Clear Filters */}
          {selectedCategory && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                handleCategorySelect(null);
                dispatch(setSearchQuery(""));
              }}
            >
              <CustomText fontSize={12} color={COLORS.yellow} fontFamily="medium">
                Clear Filters
              </CustomText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightBrown,
    borderRadius: 12,
    padding: verticalScale(12),
    marginVertical: verticalScale(8),
  },
  compactContainer: {
    marginVertical: verticalScale(8),
  },
  compactScrollContent: {
    paddingHorizontal: horizontalScale(15),
    gap: horizontalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandButton: {
    padding: verticalScale(4),
  },
  expandedContent: {
    marginTop: verticalScale(12),
    gap: verticalScale(12),
  },
  filterSection: {
    gap: verticalScale(8),
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(8),
  },
  filterButton: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 16,
    backgroundColor: COLORS.brown,
  },
  compactButton: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 12,
  },
  specificMusclesToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(4),
  },
  specificMusclesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(6),
  },
  specificMuscleButton: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 12,
    backgroundColor: COLORS.brown,
  },
  clearButton: {
    alignSelf: "center",
    paddingVertical: verticalScale(8),
  },
});

export default MuscleFilter;
