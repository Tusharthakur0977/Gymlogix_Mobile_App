import React from "react";
import { ActivityIndicator, View } from "react-native";
import COLORS from "../Utilities/Colors";

const FullLoader = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color={COLORS.whiteTail} size={"large"} />
    </View>
  );
};

export default FullLoader;
