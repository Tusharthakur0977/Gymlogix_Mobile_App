import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ICONS from "../Assets/Icons";
import COLORS from "../Utilities/Colors";
import { horizontalScale, verticalScale } from "../Utilities/Metrics";
import CustomIcon from "./CustomIcon";
import { CustomText } from "./CustomText";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownSelectProps {
  label: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  containerStyle?: object;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  containerStyle,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownButtonRef = useRef<TouchableOpacity | null>(null);

  // Find the selected option label
  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const openDropdown = () => {
    console.log(`Opening dropdown: ${label}`); // Debug log
    if (dropdownButtonRef.current) {
      dropdownButtonRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          console.log(
            `Measure: x=${x}, y=${y}, width=${width}, height=${height}`
          ); // Debug log
          const windowHeight = Dimensions.get("window").height;
          const dropdownHeight = Math.min(options.length * 40, 200); // Estimated dropdown height
          const spaceBelow = windowHeight - y - height;

          // Position dropdown below the button, unless there's not enough space
          const top =
            spaceBelow >= dropdownHeight ? y + height : y - dropdownHeight;

          setDropdownPosition({
            top: top + 5, // Small offset to avoid overlap
            left: x,
            width,
          });
          setIsVisible(true);
        }
      );
    }
  };

  const closeDropdown = () => {
    console.log(`Closing dropdown: ${label}`); // Debug log
    setIsVisible(false);
  };

  const handleSelect = (value: string) => {
    console.log(`Selected ${label}: ${value}`); // Debug log
    onSelect(value);
    closeDropdown();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <CustomText fontSize={14} fontFamily="medium" color={COLORS.white}>
        {label}
      </CustomText>

      <TouchableOpacity
        ref={dropdownButtonRef}
        style={styles.dropdownButton}
        onPress={(e) => {
          e.stopPropagation();
          openDropdown();
        }}
        activeOpacity={0.7}
      >
        <CustomText
          fontSize={12}
          fontFamily="medium"
          color={COLORS.white}
          style={styles.selectedText}
        >
          {selectedOption?.label || "Select an option"}
        </CustomText>
        <CustomIcon Icon={ICONS.ArrowDownIcon} height={12} width={12} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableWithoutFeedback
          onPress={(e) => {
            e.stopPropagation();
            closeDropdown();
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={[
                  styles.dropdown,
                  {
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                  },
                ]}
              >
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[
                        styles.option,
                        selectedValue === item.value && styles.selectedOption,
                        {
                          borderBottomWidth:
                            index === options.length - 1 ? 0 : 1,
                          borderBottomColor: COLORS.lightBrown,
                        },
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      <CustomText
                        fontSize={12}
                        fontFamily="medium"
                        color={
                          selectedValue === item.value
                            ? COLORS.darkBrown
                            : COLORS.white
                        }
                      >
                        {item.label}
                      </CustomText>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(15),
  },
  dropdownButton: {
    backgroundColor: COLORS.lightBrown,
    borderRadius: 8,
    padding: horizontalScale(10),
    marginTop: verticalScale(8),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
  },
  selectedText: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: COLORS.brown,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000, // Ensure dropdown is on top
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  option: {
    padding: horizontalScale(10),
  },
  selectedOption: {
    backgroundColor: COLORS.yellow,
  },
});

export default DropdownSelect;
