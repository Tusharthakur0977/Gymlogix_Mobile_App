import React, {FC, useState} from 'react';
import {FlatList, Image, ScrollView, StyleSheet, View} from 'react-native';
import ICONS from '../../Assets/Icons'; // Assuming you have an ICONS file with a lock icon
import CustomIcon from '../../Components/CustomIcon'; // Assuming you have a CustomIcon component
import {CustomText} from '../../Components/CustomText'; // Assuming you have a CustomText component
import {workoutPlan, WorkoutProgram} from '../../Seeds/WorkoutProgramData';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale} from '../../Utilities/Metrics';
import PrimaryButton from '../../Components/PrimaryButton';
import ScheduleCalendar from '../../Components/Modals/ScheduleCalendar';

type ProgramExcerciseProps = {
  programData: WorkoutProgram[];
  isActivated: boolean;
  onPressActive: () => void;
};

const ProgramExcercise: FC<ProgramExcerciseProps> = ({
  programData,
  isActivated,
  onPressActive,
}) => {
  const [isCalendar, setIsCalendar] = useState(false);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  const toggleDayExpand = (day: string) => {
    if (expandedDays.includes(day)) {
      // remove from expanded
      setExpandedDays(expandedDays.filter(d => d !== day));
    } else {
      // add to expanded
      setExpandedDays([...expandedDays, day]);
    }
  };

  const renderExercise = ({
    item,
    day,
  }: {
    item: (typeof workoutPlan)[0]['exercises'][0];
    day: string;
  }) => (
    <>
      {expandedDays.includes(day) && (
        <View style={styles.exerciseCont}>
          <Image
            source={{uri: item.image}}
            style={{height: 70, width: 70, borderRadius: 10}}
          />
          <View style={{gap: verticalScale(10)}}>
            <CustomText color={COLORS.yellow} fontSize={15} fontFamily="medium">
              {item.name}
            </CustomText>
            <CustomText fontFamily="italic" fontSize={15}>
              {item.sets} Sets x {item.reps}
            </CustomText>
          </View>
        </View>
      )}
    </>
  );

  const renderDay = ({
    item,
    index,
  }: {
    item: (typeof workoutPlan)[0];
    index: number;
  }) => {
    const dayExpanded = expandedDays.includes(item.day);
    return (
      <View key={index}>
        {/* Day Header with Dot and Lock Icon */}
        <View style={styles.dayHeader}>
          <View style={styles.timelineContainer}>
            <View style={[styles.dot, {backgroundColor: item.dotColor}]} />
            <CustomText color={COLORS.white} fontFamily="bold">
              {item.day}
            </CustomText>
          </View>

          <CustomText
            fontFamily="bold"
            onPress={() => toggleDayExpand(item.day)}>
            {dayExpanded ? '-' : '+'}
          </CustomText>

          {/* {!item.locked ? (
            <CustomIcon
              Icon={ICONS.LockIcon} // Assuming you have a lock icon in your ICONS file
              height={20}
              width={20}
            />
          ) : (
            <CustomText
              fontFamily="bold"
              onPress={() =>
                setExpandedDay(expandedDay === item.day ? null : item.day)
              }>
              {expandedDay === item.day ? '-' : '+'}
            </CustomText>
          )} */}
        </View>

        {/* Exercises List (Hidden if Locked) */}

        <FlatList
          data={item.exercises}
          renderItem={({item: ex}) => renderExercise({item: ex, day: item.day})}
          keyExtractor={exercise => exercise.id}
          style={styles.exerciseList}
          scrollEnabled={false} // Let the outer ScrollView handle scrolling
        />

        {/* Rest Period */}
        {item.restPeriod && (
          <View style={styles.restPeriodContainer}>
            <View style={styles.restPeriodLine} />
            <CustomText color={COLORS.whiteTail} fontSize={12}>
              {item.restPeriod}
            </CustomText>
            <View style={styles.restPeriodLine} />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{flex: 1}}
      showsVerticalScrollIndicator={false}>
      <FlatList
        data={programData}
        renderItem={renderDay}
        keyExtractor={item => item.day}
        contentContainerStyle={styles.listContainer}
        style={{gap: 10}}
        scrollEnabled={false} // Let the outer ScrollView handle scrolling
      />
      {isActivated ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: horizontalScale(20),
          }}>
          <PrimaryButton
            onPress={onPressActive}
            title="Deactivate"
            isFullWidth={false}
            style={{
              paddingVertical: verticalScale(8),
              paddingHorizontal: horizontalScale(20),
              borderRadius: 10,
            }}
          />
          <PrimaryButton
            onPress={() => setIsCalendar(true)}
            title="Schedule"
            isFullWidth={false}
            style={{
              paddingVertical: verticalScale(8),
              paddingHorizontal: horizontalScale(20),
              borderRadius: 10,
            }}
          />
        </View>
      ) : (
        <PrimaryButton
          title="Activate"
          onPress={onPressActive}
          isFullWidth={false}
          style={{
            paddingVertical: verticalScale(8),
            paddingHorizontal: horizontalScale(20),
            borderRadius: 10,
            alignSelf: 'center',
          }}
        />
      )}
      <ScheduleCalendar
        isModalVisible={isCalendar}
        closeModal={() => setIsCalendar(false)}
        onPressApply={() => {
          setIsCalendar(false);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: verticalScale(20),
  },
  listContainer: {
    paddingVertical: verticalScale(10),
  },

  exerciseCont: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E8E7E9',
    borderWidth: 1,
    padding: 5,
    borderRadius: 10,
    gap: horizontalScale(15),
    backgroundColor: COLORS.lightBrown,
    marginBottom: verticalScale(10),
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    backgroundColor: COLORS.brown,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(5),
    justifyContent: 'space-between',
  },
  timelineContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginVertical: 5,
  },

  exerciseList: {
    paddingHorizontal: horizontalScale(10),
  },

  restPeriodContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(10),
    gap: verticalScale(5),
  },
  restPeriodLine: {
    height: verticalScale(20),
    width: 1,
    backgroundColor: COLORS.whiteTail,
  },
});

export default ProgramExcercise;
