import React, { FC, useEffect } from "react";
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

type UpdateDayNameModalProps = {
  isModalVisible: boolean;
  closeModal: () => void;
  onSaveName: (instruction: string) => void;
  initialName?: string;
};

const UpdateDayNameModal: FC<UpdateDayNameModalProps> = ({
  isModalVisible,
  closeModal,
  onSaveName,
  initialName,
}) => {
  const [name, setName] = React.useState(initialName || "");

  // Update name state when initialName changes or modal becomes visible
  useEffect(() => {
    if (isModalVisible && initialName !== undefined) {
      setName(initialName);
    }
  }, [initialName, isModalVisible]);

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
              Rename
            </CustomText>
          </View>

          <View style={{ padding: verticalScale(10) }}>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
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
              onPress={() => onSaveName(name)}
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
              Give a name to identify the workout
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default UpdateDayNameModal;

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
