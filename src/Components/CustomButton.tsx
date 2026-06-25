import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import COLORS from "../Utilities/Colors";
import { verticalScale } from "../Utilities/Metrics";
import { CustomText } from "./CustomText";

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  containerStyle?: ViewStyle;
}

const CustomButton: React.FC<Props> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        (disabled || loading) && styles.disabled,
        containerStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <CustomText fontFamily="medium" color={COLORS.white}>
          {label}
        </CustomText>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.DarkBrown,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    backgroundColor: COLORS.Grey,
    opacity: 0.7,
  },
});
