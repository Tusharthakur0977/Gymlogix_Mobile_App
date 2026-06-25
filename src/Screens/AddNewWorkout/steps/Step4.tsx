import React, { FC } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { CustomText } from "../../../Components/CustomText";
import { setWorkoutData } from "../../../Redux/slices/newWorkoutSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/store";
import COLORS from "../../../Utilities/Colors";
import { horizontalScale, verticalScale, wp } from "../../../Utilities/Metrics";

const Step4: FC<{}> = () => {
  const dispatch = useAppDispatch();
  const { workoutData } = useAppSelector((state) => state.newWorkout);

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
        Instruction and tips for the program
      </CustomText>
      <TextInput
        value={workoutData.instruction}
        onChangeText={(text) => {
          dispatch(
            setWorkoutData({
              ...workoutData,
              instruction: text,
            })
          );
        }}
        multiline
        textAlignVertical="top"
        numberOfLines={10}
        style={{
          width: wp(90),
          minHeight: verticalScale(150),
          borderWidth: 0.4,
          borderColor: COLORS.white,
          borderRadius: 15,
          paddingHorizontal: horizontalScale(10),
          color: COLORS.white,
        }}
      />
    </View>
  );
};

export default Step4;


const styles = StyleSheet.create({});
