import React, { FC } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ICONS from "../../../Assets/Icons";
import CustomIcon from "../../../Components/CustomIcon";
import { CustomText } from "../../../Components/CustomText";
import { setWorkoutData } from "../../../Redux/slices/newWorkoutSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/store";
import COLORS from "../../../Utilities/Colors";
import { verticalScale } from "../../../Utilities/Metrics";

const Step3: FC<{}> = () => {
  const dispatch = useAppDispatch();
  const { workoutData } = useAppSelector((state) => state.newWorkout);

  const LocationData = [
    {
      id: 1,
      name: "Gym",
      icon: ICONS.ExerciseLocation1Icon,
    },
    {
      id: 2,
      name: "Home",
      icon: ICONS.ExerciseLocation2Icon,
    },
    {
      id: 3,
      name: "Outdoor",
      icon: ICONS.ExerciseLocation3Icon,
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
        Select the location of your program
      </CustomText>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {LocationData.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              dispatch(
                setWorkoutData({
                  ...workoutData,
                  location: item.name as typeof workoutData.location,
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
                workoutData.location === item.name
                  ? COLORS.yellow
                  : "transparent",
              backgroundColor:
                workoutData.location === item.name ? "#312E2B" : "transparent",
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

export default Step3;

const styles = StyleSheet.create({});
