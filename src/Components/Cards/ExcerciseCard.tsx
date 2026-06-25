import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { CustomText } from "../CustomText";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../Utilities/Metrics";

type ExcerciseCardProps = {
  image: string;
  title: string;
  sets: string;
  reps: string;
};

const ExcerciseCard = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#E8E7E9",
        borderWidth: 1,
        padding: 8,
        borderRadius: 10,
        gap: horizontalScale(10),
        backgroundColor: COLORS.lightBrown,
      }}
    >
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1613845205719-8c87760ab728?q=80&w=1635&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }}
        style={{ height: 70, width: 70 }}
      />

      <View style={{ gap: verticalScale(20) }}>
        <CustomText color={COLORS.yellow} fontSize={15} fontFamily="medium">
          Smith machine shrug
        </CustomText>
        <CustomText fontFamily="italic" fontSize={15}>
          3 Sets x 3 reps
        </CustomText>
      </View>
    </View>
  );
};

export default ExcerciseCard;

const styles = StyleSheet.create({});
