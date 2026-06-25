import React, { FC } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { CustomText } from "../../../Components/CustomText";
import { setWorkoutData } from "../../../Redux/slices/newWorkoutSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/store";
import COLORS from "../../../Utilities/Colors";
import { horizontalScale, verticalScale, wp } from "../../../Utilities/Metrics";

const Step1: FC<{}> = () => {
  const dispatch = useAppDispatch();
  const { workoutData } = useAppSelector((state) => state.newWorkout);
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: verticalScale(10),
        }}
      >
        <CustomText color={COLORS.yellow} fontFamily="italicBold">
          Give a meanigull name for your program
        </CustomText>
        <TextInput
          value={workoutData.name}
          onChangeText={(text) => {
            dispatch(
              setWorkoutData({
                ...workoutData,
                name: text,
              })
            );
          }}
          style={{
            width: wp(90),
            height: verticalScale(50),
            borderWidth: 1,
            borderColor: COLORS.white,
            borderRadius: 15,
            paddingHorizontal: horizontalScale(10),
            color: COLORS.white,
          }}
        />
      </View>
    </View>
  );
};

export default Step1;

const styles = StyleSheet.create({});
