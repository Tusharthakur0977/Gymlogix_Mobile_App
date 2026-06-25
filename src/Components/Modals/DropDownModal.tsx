import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ICONS from '../../Assets/Icons';
import {CustomText} from '../../Components/CustomText';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale} from '../../Utilities/Metrics';
import CustomIcon from '../CustomIcon';

interface DropdownItem {
  label: string;
  value: any;
}

interface CustomDropdownProps {
  label: string;
  placeholder: string;
  modalTitle: string;
  items: DropdownItem[] | any;
  selectedValue: any;
  onValueChange: (value: any) => void;
  disabled: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder,
  modalTitle,
  items,
  selectedValue,
  onValueChange,
  disabled,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find((item: any) => item.value === selectedValue);
  const displayLabel = selectedItem ? selectedItem.label : placeholder;

  const handleSelectItem = (item: DropdownItem) => {
    onValueChange(item.value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <CustomText fontFamily="bold">{label}</CustomText>
      <Pressable
        style={styles.dropdownButton}
        disabled={disabled} // disables press
        onPress={() => !disabled && setModalVisible(true)} // double safe
      >
        <CustomText
          fontSize={12}
          color={selectedValue ? COLORS.black : COLORS.nickel}>
          {/* {selectedValue
            ? selectedValue.length > 10
              ? selectedValue.slice(0, 8) + '...'
              : selectedValue
            : placeholder} */}

          {items.find((item: any) => item.value === selectedValue)?.label
            ? items
                .find((item: any) => item.value === selectedValue)
                ?.label.slice(0, 8) + '...'
            : placeholder}
        </CustomText>
        <CustomIcon Icon={ICONS.DownArrowIcon} height={7} width={16} />
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
          style={styles.centeredView}>
          <View
            onStartShouldSetResponder={() => true}
            onResponderRelease={e => e.stopPropagation()}
            style={styles.modalView}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <CustomText fontFamily="bold" color={COLORS.black} fontSize={18}>
                {modalTitle}
              </CustomText>
              <CustomIcon
                onPress={() => setModalVisible(!modalVisible)}
                Icon={ICONS.CrossIcon}
              />
            </View>
            <ScrollView>
              {items.map((item: any) => (
                <Pressable
                  key={item.value}
                  style={styles.modalItem}
                  onPress={() => handleSelectItem(item)}>
                  <Text style={styles.itemText}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: verticalScale(5),
    height: 60,
  },
  dropdownButton: {
    backgroundColor: COLORS.whiteTail,
    borderRadius: 5,
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: {
    flex: 1, // Allow text to take up available space
  },
  icon: {
    marginLeft: horizontalScale(10),
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },

  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    gap: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxHeight: '70%',
  },
  modalItem: {
    paddingVertical: verticalScale(10),
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'flex-start',
  },
  itemText: {
    fontSize: 16,
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonClose: {
    backgroundColor: COLORS.yellow,
  },
});

export default CustomDropdown;
