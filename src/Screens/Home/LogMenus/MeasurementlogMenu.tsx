import React, {useRef, useState} from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FONTS from '../../../Assets/fonts';
import {KeyboardAvoidingContainer} from '../../../Components/KeyboardAvoidingComponent'; // Keep if needed for overall screen layout
import PrimaryButton from '../../../Components/PrimaryButton';
import COLORS from '../../../Utilities/Colors';
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
} from '../../../Utilities/Metrics';
import {postData} from '../../../APIServices/api';
import ENDPOINTS from '../../../APIServices/endPoints';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import Toast from 'react-native-toast-message';
import {addSchedule} from '../../../Redux/slices/ScheduleSlice';
import {setHomeActiveIndex} from '../../../Redux/slices/initialSlice';

// Define interfaces
interface DropdownItem {
  title: string;
  unit: string;
}

interface Values {
  [key: string]: string;
}

const MeasurementlogMenu = () => {
  const dispatch = useAppDispatch();

  const {userData} = useAppSelector(state => state.userData);

  const flatListRef = useRef<FlatList>(null); // Explicitly type the ref

  const [values, setValues] = useState<Values>({
    Waist: '',
  });

  const [selectedTitles, setSelectedTitles] = useState<string[]>(['Waist']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [unitModalVisible, setUnitModalVisible] = useState<boolean>(false);
  const [activeUnitTitle, setActiveUnitTitle] = useState<string | null>(null);

  const [dropdownData, setDropdownData] = useState<DropdownItem[]>([
    {title: 'Waist', unit: 'CM'},
    {title: 'Body Fat', unit: '%'},
    {title: 'Biceps', unit: 'CM'},
    {title: 'Triceps', unit: 'LB'},
  ]);

  const unitOptions = ['CM', 'Inch', '%', 'KG', 'LB'];

  const handleValueChange = (title: string, value: string) => {
    setValues(prev => ({...prev, [title]: value}));
  };

  const handleAddMeasurement = () => {
    setEditingTitle(null);
    setModalVisible(true);
  };

  //  Add this function
  const handleUnitChange = (title: string, newUnit: string) => {
    setDropdownData(prev =>
      prev.map(item =>
        item.title === title ? {...item, unit: newUnit} : item,
      ),
    );
  };

  const handleSelectTitle = (newTitle: string) => {
    if (editingTitle) {
      const oldTitle = editingTitle;
      if (selectedTitles.includes(newTitle) || newTitle === oldTitle) {
        setModalVisible(false);
        setEditingTitle(null);
        return;
      }

      setSelectedTitles(prev =>
        prev.map(title => (title === oldTitle ? newTitle : title)),
      );

      setValues(prev => {
        const newValues = {...prev, [newTitle]: prev[oldTitle] || ''};
        delete newValues[oldTitle];
        return newValues;
      });

      setEditingTitle(null);
    } else {
      if (!selectedTitles.includes(newTitle)) {
        setSelectedTitles([...selectedTitles, newTitle]);
        setValues(prev => ({...prev, [newTitle]: ''}));
      }
    }
    setModalVisible(false);
  };

  const handleDeleteMeasurement = (title: string) => {
    if (selectedTitles.length <= 1) {
      return;
    }
    setSelectedTitles(selectedTitles.filter(t => t !== title));
    setValues(prev => {
      const newValues = {...prev};
      delete newValues[title];
      return newValues;
    });
  };

  const handleLabelPress = (title: string) => {
    setEditingTitle(title);
    setModalVisible(true);
  };

  const renderDropdownItem = ({item}: {item: DropdownItem}) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelectTitle(item.title)}
      disabled={
        selectedTitles.includes(item.title) && item.title !== editingTitle
      }>
      <Text
        style={[
          styles.dropdownText,
          selectedTitles.includes(item.title) &&
            item.title !== editingTitle &&
            styles.disabledText,
        ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderMeasurementItem = ({
    item: title,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const item = dropdownData.find(data => data.title === title);
    if (!item) return null;

    return (
      <View key={title} style={styles.inputRow}>
        <TouchableOpacity
          style={styles.labelButton}
          onPress={() => handleLabelPress(title)}>
          <Text style={styles.labelText}>{title}</Text>
        </TouchableOpacity>
        <TextInput
          value={values[title]}
          onChangeText={value => handleValueChange(title, value)}
          style={styles.valueButton}
          keyboardType="phone-pad"
          onFocus={() => {
            // Scroll to the focused item
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({
                animated: true,
                index: index,
                viewPosition: 0.5, // 0 is top, 0.5 is middle, 1 is bottom of the view
              });
            }
          }}
        />
        <TouchableOpacity
          style={styles.unitButton}
          onPress={() => {
            setActiveUnitTitle(title);
            setUnitModalVisible(true);
          }}>
          <Text style={styles.unitText}>{item.unit}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            selectedTitles.length <= 1 && styles.disabledDeleteButton,
          ]}
          onPress={() => handleDeleteMeasurement(title)}
          disabled={selectedTitles.length <= 1}>
          <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleLog = async () => {
    // validate first
    const emptyFields = selectedTitles.filter(
      title => !values[title] || values[title].trim() === '',
    );

    if (emptyFields.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Please enter all measurements',
        visibilityTime: 2000,
      });
      return; // stop execution
    }

    const now = new Date(); // current date
    const scheduleDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      ),
    );

    const list = selectedTitles.map(title => {
      const item = dropdownData.find(d => d.title === title);
      return {
        part: title,
        unit: item ? item.unit : '', // unit from dropdownData
        amount: values[title] || '0', // entered value
      };
    });

    const data = {
      description: '',
      schedule_at: scheduleDate.toISOString(),
      user_id: userData?.user_id,
      status: 'done',
      type: 'measurement',
      content: {
        list: list,
      },
    };

    try {
      const response = await postData<any>(ENDPOINTS.createSchedule, {data});
      if (response.data.data) {
        if (response.data.data) {
          dispatch(addSchedule(response.data.data));
        }
        Toast.show({
          type: 'success',
          text1: 'Measurements Logged Successfully',
          visibilityTime: 2000,
        });
        dispatch(setHomeActiveIndex(0));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          justifyContent: 'space-between',
        }}>
        <FlatList
          ref={flatListRef}
          data={selectedTitles}
          renderItem={renderMeasurementItem}
          keyExtractor={item => item}
          contentContainerStyle={{
            gap: verticalScale(10),
            paddingBottom: verticalScale(20), // Ensure space for the keyboard
          }}
          ListFooterComponent={() => {
            return (
              selectedTitles.length < 4 && (
                <PrimaryButton
                  title="Add"
                  onPress={handleAddMeasurement}
                  isFullWidth={false}
                  style={{
                    alignSelf: 'flex-end',
                    width: 'auto',
                    paddingVertical: verticalScale(4),
                    paddingHorizontal: horizontalScale(30),
                    borderRadius: verticalScale(5),
                    marginTop: verticalScale(10),
                  }}
                />
              )
            );
          }}
        />

        <PrimaryButton title="Log Measurements" onPress={handleLog} />
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingTitle(null);
        }}>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(false);
            setEditingTitle(null);
          }}
          activeOpacity={1}
          style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTitle ? 'Change Measurement' : 'Select Measurement'}
            </Text>
            <FlatList
              data={dropdownData}
              renderItem={renderDropdownItem}
              keyExtractor={item => item.title}
              style={styles.dropdownList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setEditingTitle(null);
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={unitModalVisible}
        onRequestClose={() => {
          setUnitModalVisible(false);
          setActiveUnitTitle(null);
        }}>
        <TouchableOpacity
          onPress={() => {
            setUnitModalVisible(false);
            setActiveUnitTitle(null);
          }}
          activeOpacity={1}
          style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Unit</Text>
            <FlatList
              data={unitOptions}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    if (activeUnitTitle) {
                      handleUnitChange(activeUnitTitle, item);
                    }
                    setUnitModalVisible(false);
                    setActiveUnitTitle(null);
                  }}>
                  <Text style={styles.dropdownText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.dropdownList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setUnitModalVisible(false);
                setActiveUnitTitle(null);
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MeasurementlogMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: verticalScale(10),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightBrown,
    borderRadius: 10,
    paddingVertical: verticalScale(20),
    borderWidth: 0.5,
    borderColor: COLORS.white,
    gap: horizontalScale(10),
  },
  labelButton: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(10),
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 10,
    width: '25%',
    height: verticalScale(55),
    alignItems: 'center',
  },
  labelText: {
    color: '#D3D3D3',
    fontSize: 16,
  },
  valueButton: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 10,
    width: '30%',
    height: verticalScale(55),
    alignItems: 'center',
    textAlign: 'center',
    fontSize: responsiveFontSize(20),
    fontFamily: FONTS.bold,
    color: COLORS.whiteTail,
  },
  unitButton: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(10),
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 10,
    height: verticalScale(55),
    width: '15%',
    alignItems: 'center',
  },
  unitText: {
    color: '#D3D3D3',
    fontSize: 16,
  },
  deleteButton: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 10,
    width: '10%',
    height: verticalScale(55),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
  },
  disabledDeleteButton: {
    backgroundColor: '#FF6B6B80',
    opacity: 0.5,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: verticalScale(20),
    width: '80%',
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  dropdownList: {
    flexGrow: 0,
  },
  dropdownItem: {
    padding: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: responsiveFontSize(16),
    color: COLORS.black,
  },
  disabledText: {
    color: '#aaa',
  },
  closeButton: {
    marginTop: verticalScale(10),
    padding: verticalScale(10),
    backgroundColor: '#F4A261',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
  },
});
