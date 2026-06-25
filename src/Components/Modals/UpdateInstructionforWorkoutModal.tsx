import React, { useEffect } from "react";
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale, wp } from "../../Utilities/Metrics";
import { CustomText } from "../CustomText";
import PrimaryButton from "../PrimaryButton";

type UpdateInstructionforWorkoutModalProps = {
  isModalVisible: boolean;
  closeModal: () => void;
  onSaveInstruction: (instruction: string) => void;
  initialInstruction?: string;
};

const UpdateInstructionforWorkoutModal: React.FC<
  UpdateInstructionforWorkoutModalProps
> = ({ isModalVisible, closeModal, onSaveInstruction, initialInstruction }) => {
  const [instruction, setInstruction] = React.useState(
    initialInstruction || ""
  );

  // Update instruction state when initialInstruction changes or modal becomes visible
  useEffect(() => {
    if (isModalVisible && initialInstruction !== undefined) {
      setInstruction(initialInstruction);
    }
  }, [initialInstruction, isModalVisible]);

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
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <CustomText fontSize={18} fontFamily="bold" color={COLORS.white}>
              Instructions
            </CustomText>
          </View>

          <View
            style={{
              paddingHorizontal: horizontalScale(20),
              paddingVertical: verticalScale(20),
            }}
          >
            <TextInput
              value={instruction}
              onChangeText={(text) => {
                setInstruction(text);
              }}
              multiline
              textAlignVertical="top"
              numberOfLines={5}
              style={{
                minHeight: verticalScale(100),
                borderWidth: 1,
                borderColor: COLORS.white,
                borderRadius: 15,
                paddingHorizontal: horizontalScale(10),
                color: COLORS.white,
              }}
            />

            <PrimaryButton
              title="Save"
              onPress={() => onSaveInstruction(instruction)}
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
              Give some instructions to help users understand the workout
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default UpdateInstructionforWorkoutModal;

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
