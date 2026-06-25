import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { hp, wp } from "../Utilities/Metrics";

const PointingView = ({
  label = "15kg", // The text to display in the label
  x = 0, // X position of the arrow's tip
  y = 0, // Y position of the arrow's tip
  labelWidth = wp(15), // Width of the label box
  labelHeight = hp(4), // Height of the label box
  arrowLength = 30, // Length of the arrow
  arrowColor = "#000", // Color of the arrow
  labelBackgroundColor = "#FFF", // Background color of the label
  labelTextColor = "#000", // Text color of the label
}) => {
  return (
    <View style={[styles.container, { top: y, left: x }]}>
      {/* Arrow */}
      <Svg
        width={arrowLength}
        height={arrowLength}
        style={styles.arrow}
        viewBox={`0 0 ${arrowLength} ${arrowLength}`}
      >
        {/* Arrow line */}
        <Path
          d={`M${arrowLength - 5} 0 L0 ${arrowLength / 2}`}
          stroke={arrowColor}
          strokeWidth="2"
          fill="none"
        />
        {/* Arrowhead (circle at the tip) */}
        <Circle cx="0" cy={arrowLength / 2} r="3" fill={arrowColor} />
      </Svg>

      {/* Label */}
      <View
        style={[
          styles.label,
          {
            width: labelWidth,
            height: labelHeight,
            backgroundColor: labelBackgroundColor,
            top: -labelHeight / 2, // Center the label vertically relative to the arrow
            left: -labelWidth - arrowLength, // Position the label to the left of the arrow
          },
        ]}
      >
        <Text style={[styles.labelText, { color: labelTextColor }]}>
          {label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  arrow: {
    transform: [{ rotate: "-45deg" }], // Rotate the arrow to point diagonally
  },
  label: {
    position: "absolute",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  labelText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default PointingView;
