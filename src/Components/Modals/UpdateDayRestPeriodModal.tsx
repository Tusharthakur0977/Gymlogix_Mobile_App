import React, { FC, useState, useEffect } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale, wp } from "../../Utilities/Metrics";
import { CustomText } from "../CustomText";

type UpdateDayRestPeriodModalProps = {
  isModalVisible: boolean;
  closeModal: () => void;
  onSaveRestPeriod: (restPeriod: number) => void;
  initialRestPeriod?: number;
};

const UpdateDayRestPeriodModal: FC<UpdateDayRestPeriodModalProps> = ({
  isModalVisible,
  closeModal,
  onSaveRestPeriod,
  initialRestPeriod,
}) => {
  const [days, setDays] = useState(initialRestPeriod || 1);

  // Update days state when initialRestPeriod changes or modal becomes visible
  useEffect(() => {
    if (isModalVisible && initialRestPeriod !== undefined) {
      setDays(initialRestPeriod);
    }
  }, [initialRestPeriod, isModalVisible]);

  const handleIncrease = () => {
    setDays((prev) => Math.min(prev + 1, 7)); // Maximum 7 days
  };

  const handleDecrease = () => {
    setDays((prev) => Math.max(prev - 1, 1)); // Minimum 1 day
  };

  const handleSave = () => {
    onSaveRestPeriod(days);
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
              Rest period
            </CustomText>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={handleDecrease}
              >
                <CustomText
                  fontSize={24}
                  fontFamily="bold"
                  color={COLORS.white}
                >
                  -
                </CustomText>
              </TouchableOpacity>

              <View style={styles.daysContainer}>
                <CustomText
                  fontSize={60}
                  fontFamily="bold"
                  color={COLORS.white}
                >
                  {days}
                </CustomText>
                <CustomText
                  fontSize={16}
                  fontFamily="medium"
                  color={COLORS.whiteTail}
                >
                  DAYS
                </CustomText>
              </View>

              <TouchableOpacity
                style={styles.counterButton}
                onPress={handleIncrease}
              >
                <CustomText
                  fontSize={24}
                  fontFamily="bold"
                  color={COLORS.white}
                >
                  +
                </CustomText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <CustomText
                fontSize={16}
                fontFamily="medium"
                color={COLORS.white}
              >
                Save
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.modalFooter}>
            <CustomText
              fontSize={14}
              fontFamily="italic"
              color={COLORS.whiteTail}
              style={styles.footerText}
            >
              How long after the workout the trainee should rest
            </CustomText>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default UpdateDayRestPeriodModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: wp(80),
    backgroundColor: COLORS.lightBrown,
    borderRadius: 10,
    overflow: "hidden",
  },
  modalHeader: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  contentContainer: {
    paddingVertical: verticalScale(30),
    paddingHorizontal: horizontalScale(20),
    alignItems: "center",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: verticalScale(30),
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  daysContainer: {
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#FF8833",
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(40),
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
  },
  modalFooter: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  footerText: {
    textAlign: "center",
    lineHeight: 22,
  },
});
