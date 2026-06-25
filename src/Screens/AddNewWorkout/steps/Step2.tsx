import React, { FC } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ICONS from "../../../Assets/Icons";
import CustomIcon from "../../../Components/CustomIcon";
import { CustomText } from "../../../Components/CustomText";
import { setWorkoutData } from "../../../Redux/slices/newWorkoutSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/store";
import COLORS from "../../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../../Utilities/Metrics";

const Step2: FC<{}> = () => {
  const dispatch = useAppDispatch();
  const { workoutData } = useAppSelector((state) => state.newWorkout);
  const GoalsData = [
    {
      id: 1,
      name: "Hypertrophy",
      icon: ICONS.ExerciseGoal1Icon,
    },
    {
      id: 2,
      name: "Strength",
      icon: ICONS.ExerciseGoal2Icon,
    },
    {
      id: 3,
      name: "Endurance",
      icon: ICONS.ExerciseGoal3Icon,
    },
    {
      id: 4,
      name: "Cardio",
      icon: ICONS.ExerciseGoal4Icon,
    },
    {
      id: 5,
      name: "Flexibility",
      icon: ICONS.ExerciseGoal5Icon,
    },
    {
      id: 6,
      name: "Functionality",
      icon: ICONS.ExerciseGoal6Icon,
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: verticalScale(20),
      }}
    >
      <CustomText color={COLORS.yellow} fontFamily="italicBold">
        Select the goals of your program
      </CustomText>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: horizontalScale(20),
        }}
      >
        {GoalsData.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              dispatch(
                setWorkoutData({
                  ...workoutData,
                  goal: item.name as typeof workoutData.goal,
                })
              );
            }}
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: verticalScale(112),
              height: verticalScale(112),
              borderRadius: verticalScale(20),
              borderWidth: 1,
              borderColor:
                workoutData.goal === item.name ? COLORS.yellow : "transparent",
              backgroundColor:
                workoutData.goal === item.name ? "#312E2B" : "transparent",
            }}
          >
            <CustomIcon
              Icon={item.icon}
              height={verticalScale(70)}
              width={verticalScale(70)}
            />
            <CustomText
              color={COLORS.whiteTail}
              fontSize={14}
              fontFamily="bold"
            >
              {item.name}
            </CustomText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Step2;

const styles = StyleSheet.create({});
