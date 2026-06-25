import React, { FC, useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { CustomText } from "../CustomText";
import CustomIcon from "../CustomIcon";
import ICONS from "../../Assets/Icons";
import COLORS from "../../Utilities/Colors";
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from "../../Utilities/Metrics";
import PrimaryButton from "../PrimaryButton";

type UScheduleCalendarProps = {
  isModalVisible: boolean;
  closeModal: () => void;
  onPressApply: () => void;
};

const ScheduleCalendar: FC<UScheduleCalendarProps> = ({
  isModalVisible,
  closeModal,
  onPressApply,
}) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("");

  return (
    <Modal transparent={true} visible={isModalVisible} animationType="fade">
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal}
        style={styles.modalContainer}
      >
        <View style={styles.header}>
          <CustomText>Choose Date</CustomText>
          <CustomIcon
            onPress={closeModal}
            Icon={ICONS.WhiteCrossIcon}
            height={15}
            width={15}
          />
        </View>
        <View>
          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: COLORS.darkBrown,
              calendarBackground: COLORS.darkBrown,
              textSectionTitleColor: "#b6c1cd",
              selectedDayBackgroundColor: "#FF0000",
              selectedDayTextColor: "#ffffff",
              todayTextColor: COLORS.yellow,
              dayTextColor: COLORS.white,
              textDisabledColor: "#dd99ee",
              monthTextColor: COLORS.white,
            }}
            onDayPress={(day: { dateString: React.SetStateAction<string> }) => {
              setSelected(day.dateString); // Save selected date
            }}
            markedDates={{
              [selected]: {
                selected: true,
                selectedColor: COLORS.yellow, // Customize selection color
              },
            }}
          />
        </View>
        <PrimaryButton
          title="Apply"
          onPress={onPressApply}
          style={styles.applyButton}
        />
      </TouchableOpacity>
    </Modal>
  );
};

export default ScheduleCalendar;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10),
    width: wp(90),
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
  },
  calendar: {
    width: wp(90),
    height: hp(50),
    zIndex: 100,
  },
  applyButton: {
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    borderTopStartRadius: 0,
    borderTopEndRadius: 0,
  },
});
