import React, { FC, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ICONS from "../Assets/Icons";
import CustomIcon from "./CustomIcon";
import { CustomText } from "./CustomText";
import { horizontalScale, verticalScale } from "../Utilities/Metrics";
import COLORS from "../Utilities/Colors";

type AddLogButtonProps = {
  menuItems: {
    icon: any;
    label: string;
    onPress: () => void;
  }[];
};

const AddLogButton: FC<AddLogButtonProps> = ({ menuItems }) => {
  const [isLoggingButtonOpen, setIsLoggingButtonOpen] = useState(false);

  return (
    <>
      {/* Overlay to close the menu when tapping outside */}
      {isLoggingButtonOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setIsLoggingButtonOpen(false)}
          activeOpacity={1}
        />
      )}

      {/* Menu Items */}
      {isLoggingButtonOpen && (
        <View style={styles.loggingMenu}>
          {menuItems.map(({ icon, label, onPress }) => (
            <TouchableOpacity
              key={label}
              activeOpacity={0.9}
              style={styles.menuItem}
              onPress={() => {
                onPress();
                setIsLoggingButtonOpen(false);
              }}
            >
              <CustomIcon Icon={icon} height={24} width={24} />
              <CustomText style={styles.menuText}>{label}</CustomText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.95}
        style={[
          styles.loggingButton,
          {
            backgroundColor: isLoggingButtonOpen ? COLORS.white : COLORS.yellow,
          },
        ]}
        onPress={() => setIsLoggingButtonOpen(!isLoggingButtonOpen)}
      >
        <CustomIcon
          Icon={isLoggingButtonOpen ? ICONS.CrossIcon : ICONS.PlusIcon}
          height={verticalScale(29)}
          width={verticalScale(29)}
        />
      </TouchableOpacity>
    </>
  );
};

export default AddLogButton;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    opacity: 0.5,
    zIndex: 100,
  },
  loggingButton: {
    borderRadius: 100,
    position: "absolute",
    padding: verticalScale(13),
    bottom: verticalScale(80),
    right: horizontalScale(10),
    zIndex: 300,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loggingMenu: {
    position: "absolute",
    bottom: verticalScale(110),
    right: horizontalScale(10),
    alignItems: "flex-start",
    borderRadius: 12,
    padding: verticalScale(10),
    zIndex: 200,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    gap: verticalScale(10),
    backgroundColor: "transparent", // Ensure the menu background doesn't interfere
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(10),
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(15),
    backgroundColor: COLORS.yellow,
    borderRadius: 10,
  },
  menuText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: "medium",
  },
});
