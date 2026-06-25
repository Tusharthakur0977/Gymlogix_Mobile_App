import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { FC, useState, useEffect } from "react";
import { horizontalScale, verticalScale, wp } from "../../Utilities/Metrics";
import COLORS from "../../Utilities/Colors";
import { CustomText } from "../CustomText";
import PrimaryButton from "../PrimaryButton";
import { COLORS_ARRAY } from "../../Utilities/Helpers";

type SelectDayColorModalProps = {
  isModalVisible: boolean;
  closeModal: () => void;
  onSelectColor: (color: string) => void;
  initialColor?: string;
};

const SelectDayColorModal: FC<SelectDayColorModalProps> = ({
  isModalVisible,
  closeModal,
  onSelectColor,
  initialColor,
}) => {
  const [selectedColor, setSelectedColor] = useState(
    initialColor || COLORS_ARRAY[0]
  );

  // Update selectedColor state when initialColor changes or modal becomes visible
  useEffect(() => {
    if (isModalVisible && initialColor !== undefined) {
      setSelectedColor(initialColor);
    }
  }, [initialColor, isModalVisible]);

  const handleSave = () => {
    onSelectColor(selectedColor);
    closeModal();
  };

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="fade"
      onRequestClose={closeModal}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal}
        style={styles.modalOverlay}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <CustomText fontSize={18} fontFamily="bold" color={COLORS.white}>
              Color Selection
            </CustomText>
          </View>

          <View style={styles.colorGridContainer}>
            <View style={styles.colorGrid}>
              {COLORS_ARRAY.slice(0, 5).map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorCircle,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <View style={styles.colorGrid}>
              {COLORS_ARRAY.slice(5, 10).map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorCircle,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <PrimaryButton
              title="Save"
              onPress={handleSave}
              isFullWidth={false}
              style={{
                width: "auto",
                paddingHorizontal: horizontalScale(50),
                paddingVertical: verticalScale(8),
                borderRadius: 15,
                alignSelf: "center",
                marginVertical: verticalScale(10),
              }}
            />
          </View>

          <View style={styles.modalFooter}>
            <CustomText
              fontSize={14}
              fontFamily="italic"
              color={COLORS.whiteTail}
              style={styles.footerText}
            >
              Choose a color to represent the workout. This color will be shown
              in the calendar
            </CustomText>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default SelectDayColorModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: wp(90),
    backgroundColor: COLORS.lightBrown,
    borderRadius: 10,
    overflow: "hidden",
  },
  modalHeader: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "flex-start",
  },
  colorGridContainer: {
    paddingVertical: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    alignItems: "center",
  },
  colorGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: verticalScale(20),
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorCircle: {
    borderColor: COLORS.white,
    borderWidth: 2,
  },
  saveButton: {
    backgroundColor: "#FF8833",
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(40),
    borderRadius: 25,
    marginTop: verticalScale(10),
    alignItems: "center",
  },
  modalFooter: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  footerText: {
    textAlign: "left",
  },
});
