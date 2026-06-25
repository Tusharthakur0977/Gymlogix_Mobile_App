import React, { forwardRef, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import FONTS from "../Assets/fonts";
import ICONS from "../Assets/Icons";
import COLORS from "../Utilities/Colors";
import { horizontalScale, verticalScale, wp } from "../Utilities/Metrics";
import CustomIcon from "./CustomIcon";
import { CustomText } from "./CustomText";

type CustomInputProps = TextInputProps & {
  placeholder?: string;
  type?: "text" | "password" | "search" | "textArea" | "date" | "time";
  onChangeText: (text: string) => void;
  value: string;
  style?: object;
  label?: string;
  inputStyle?: StyleProp<TextStyle>;
  baseStyle?: StyleProp<ViewStyle>;
};

const CustomInput = forwardRef<TextInput, CustomInputProps>(
  (
    {
      placeholder,
      onChangeText,
      value,
      style,
      type = "text",
      label,
      inputStyle,
      baseStyle,
      ...rest
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false); // State to toggle password visibility

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    return (
      <View
        style={[
          style,
          {
            gap: verticalScale(10),
            backgroundColor: "transparent",
            width: wp(85),
            borderBottomColor: COLORS.white,
            borderBottomWidth: 1,
          },
        ]}
      >
        {label && (
          <CustomText fontFamily="medium" fontSize={14}>
            {label}
          </CustomText>
        )}
        <View
          style={[
            styles.container, // Base container style
            baseStyle,
          ]}
        >
          {/* Main input field */}
          <TextInput
            ref={ref}
            style={[styles.input, inputStyle]} // Input field style
            placeholder={placeholder} // Placeholder text
            placeholderTextColor={COLORS.white}
            secureTextEntry={type === "password" && !isPasswordVisible} // Hide input text for password type if visibility is off
            onChangeText={onChangeText} // Handle text change
            value={value} // Display current value
            editable={type !== "date" && type !== "time"}
            {...rest}
          />

          {/* Toggle password visibility for password type */}
          {type === "password" && (
            <TouchableOpacity
              style={styles.iconContainer} // Style for the icon container
              onPress={togglePasswordVisibility} // Toggle visibility on icon press
            >
              <CustomIcon
                Icon={isPasswordVisible ? ICONS.eyeOffcon : ICONS.eyeOnIcon}
                height={20}
                width={20}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: horizontalScale(5),
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontFamily: FONTS.medium,
    paddingVertical: verticalScale(5),
  },
  iconContainer: {
    marginLeft: 10,
  },
});
