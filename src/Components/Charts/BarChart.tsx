import React, {FC, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {
  BarChart as GiftedBarChart,
  yAxisSides,
} from 'react-native-gifted-charts';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, wp} from '../../Utilities/Metrics';
import {CustomText} from '../CustomText';

export type BarChartProps = {
  durationData: any;
};

const BarChart: FC<BarChartProps> = ({durationData}) => {
  const [activeTab, setActiveTab] = useState(1);

  // Always ensure durationData is an array
  const exercises = Array.isArray(durationData) ? durationData : [durationData];

  // Format date helper
  const formatDate = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
        })
      : '';

  const workoutDurations =
    exercises.map(exercise => {
      const sets = exercise.Set || [];
      // Pick the first timestamp
      const getCreated = sets[0]?.log_time;
      const total = sets.reduce(
        (acc: any, set: any) => acc + (set.time || 0),
        0,
      );

      return {
        label: getCreated ? formatDate(getCreated) : '',
        value: total,
        frontColor: '#D9D9D9',
      };
    }) || [];

  const exerciseDurations =
    exercises.map(exercise => {
      const sets = exercise.Set || [];

      const getCreated = sets[0]?.log_time;

      const total = sets.reduce(
        (acc: any, set: any) => acc + (set.time || 0),
        0,
      );
      const avg = sets.length > 0 ? total / sets.length : 0;

      return {
        label: getCreated ? formatDate(getCreated) : '',
        value: avg,
        frontColor: '#D9D9D9',
      };
    }) || [];

  const repsDurations =
    exercises.map(exercise => {
      const sets = exercise.Set || [];
      const getCreated = sets[0]?.log_time;
      const perSet = sets.map((set: any) =>
        set.reps > 0 ? (set.time || 0) / set.reps : 0,
      );

      const avg =
        perSet.length > 0
          ? perSet.reduce((a: any, b: any) => a + b, 0) / perSet.length
          : 0;

      return {
        label: getCreated ? formatDate(getCreated) : '',
        value: avg,
        frontColor: '#D9D9D9',
      };
    }) || [];

  const tabs = [
    {
      label: 'Workout Duration',
      value: 1,
      data: workoutDurations,
    },
    {
      label: 'Exercise',
      value: 2,
      data: exerciseDurations,
    },
    {
      label: 'Reps',
      value: 3,
      data: repsDurations,
    },
  ];

  const activeData = tabs.find(tab => tab.value === activeTab)?.data || [];

  return (
    <View style={styles.container}>
      <View style={styles.topTabsContainer}>
        {tabs.map(tab => (
          <Pressable
            key={tab.value}
            onPress={() => setActiveTab(tab.value)}
            style={[styles.tab, activeTab === tab.value && styles.activeTab]}>
            <CustomText
              fontSize={13}
              fontFamily="medium"
              color={activeTab === tab.value ? COLORS.black : COLORS.white}>
              {tab.label}
            </CustomText>
          </Pressable>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <GiftedBarChart
          data={activeData}
          yAxisSide={yAxisSides.RIGHT}
          barWidth={25}
          spacing={horizontalScale(15)}
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          yAxisTextStyle={{color: COLORS.white}}
          xAxisLabelTextStyle={{color: COLORS.white, textAlign: 'center'}}
          noOfSections={4}
          xAxisColor={COLORS.white}
          yAxisColor={'transparent'}
          maxValue={activeTab === 3 ? 400 : activeTab === 2 ? 20 : 100}
          yAxisLabelWidth={30}
          backgroundColor="transparent"
          adjustToWidth
          initialSpacing={20}
          endSpacing={6}
          yAxisOffset={0}
          width={wp(85)}
        />
      </View>
    </View>
  );
};

export default BarChart;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.brown,
    borderRadius: 16,
    overflow: 'hidden',
  },
  topTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.white,
  },
  chartContainer: {
    alignItems: 'center',
  },
});
