import React, { FC } from "react";
import { 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  TouchableWithoutFeedback 
} from "react-native";
import { CustomText } from "../CustomText";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../Utilities/Metrics";

interface MenuItem {
  label: string;
  onPress: () => void;
  textColor?: string;
}

interface ContextMenuProps {
  isVisible: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  position: {
    top: number;
    right: number;
  };
}

const ContextMenu: FC<ContextMenuProps> = ({
  isVisible,
  onClose,
  menuItems,
  position,
}) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.menuContainer,
              {
                top: position.top,
                right: position.right,
              },
            ]}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastMenuItem,
                ]}
                onPress={() => {
                  item.onPress();
                  onClose();
                }}
              >
                <CustomText
                  fontSize={14}
                  fontFamily="medium"
                  color={item.textColor || COLORS.whiteTail}
                >
                  {item.label}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: COLORS.lightBrown,
    borderRadius: 8,
    overflow: "hidden",
    width: horizontalScale(150),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    borderBottomWidth: 0.6,
    borderBottomColor: COLORS.lighterBrown,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
});

export default ContextMenu;
