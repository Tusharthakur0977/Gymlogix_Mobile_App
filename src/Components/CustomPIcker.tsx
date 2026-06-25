// import React, {FC, useRef, useState, useEffect} from 'react';
// import {
//   Dimensions,
//   FlatList,
//   NativeScrollEvent,
//   NativeSyntheticEvent,
//   StyleSheet,
//   View,
// } from 'react-native';
// import COLORS from '../Utilities/Colors';
// import {verticalScale, wp} from '../Utilities/Metrics';
// import {CustomText} from './CustomText';

// const {height: SCREEN_HEIGHT} = Dimensions.get('window');
// const ITEM_HEIGHT = verticalScale(40);

// interface PickerComponentProps {
//   difficulty: string;
//   onValuesChange?: (values: {
//     reps: string;
//     distance: string;
//     weight: string;
//     time: string;
//   }) => void;
// }

// const PickerComponent: FC<PickerComponentProps> = ({
//   difficulty,
//   onValuesChange,
// }) => {
//   // Data for each column
//   const repsData = Array.from({length: 100}, (_, i) => (i + 1).toString());
//   const distanceData = Array.from({length: 100}, (_, i) => `${50 + i * 10}m`);
//   const weightData = Array.from({length: 300}, (_, i) => `${1 + i}kg`);
//   const timeData = Array.from({length: 100}, (_, i) => `${1 + i}m`);

//   // State to track selected index for each column
//   const [selectedRepsIndex, setSelectedRepsIndex] = useState(5);
//   const [selectedDistanceIndex, setSelectedDistanceIndex] = useState(5);
//   const [selectedWeightIndex, setSelectedWeightIndex] = useState(5);
//   const [selectedTimeIndex, setSelectedTimeIndex] = useState(5);

//   // Refs for FlatLists to programmatically scroll
//   const repsRef = useRef(null);
//   const distanceRef = useRef(null);
//   const weightRef = useRef(null);
//   const timeRef = useRef(null);

//   // Call onValuesChange when any value changes
//   useEffect(() => {
//     if (onValuesChange) {
//       onValuesChange({
//         reps: repsData[selectedRepsIndex],
//         distance: distanceData[selectedDistanceIndex],
//         weight: weightData[selectedWeightIndex],
//         time: timeData[selectedTimeIndex],
//       });
//     }
//   }, [
//     selectedRepsIndex,
//     selectedDistanceIndex,
//     selectedWeightIndex,
//     selectedTimeIndex,
//     onValuesChange,
//   ]);

//   // Item height for snapping

//   // Function to handle snapping and update selected index
//   const handleScroll = (
//     event: NativeSyntheticEvent<NativeScrollEvent>,
//     setIndex: (arg0: number) => void,
//     ref: any,
//     dataLength: number,
//   ) => {
//     const offsetY = event.nativeEvent.contentOffset.y;
//     const index = Math.round(offsetY / ITEM_HEIGHT);
//     if (index >= 0 && index < dataLength) {
//       setIndex(index);
//       ref.current?.scrollToIndex({index, animated: true});
//     }
//   };

//   // Render item for each FlatList
//   const renderItem = (
//     item: string,
//     index: number,
//     selectedIndex: any,
//     setIndex: any,
//   ) => {
//     const isSelected = index === selectedIndex;
//     return (
//       <View style={[styles.item, {height: ITEM_HEIGHT}]}>
//         <CustomText fontSize={20} color={isSelected ? COLORS.white : '#908E8E'}>
//           {item}
//         </CustomText>
//       </View>
//     );
//   };

//   // Render each column
//   const renderColumn = (
//     data: string | ArrayLike<any> | null | undefined,
//     selectedIndex: number | null | undefined,
//     setIndex: {
//       (value: React.SetStateAction<number>): void;
//       (value: React.SetStateAction<number>): void;
//       (value: React.SetStateAction<number>): void;
//       (value: React.SetStateAction<number>): void;
//     },
//     ref: React.LegacyRef<FlatList<any>> | undefined,
//   ) => (
//     <FlatList
//       ref={ref}
//       data={data}
//       keyExtractor={(item, index) => item + index}
//       renderItem={({item, index}) =>
//         renderItem(item, index, selectedIndex, setIndex)
//       }
//       showsVerticalScrollIndicator={false}
//       snapToInterval={ITEM_HEIGHT}
//       decelerationRate="fast"
//       initialScrollIndex={selectedIndex}
//       getItemLayout={(data, index) => ({
//         length: ITEM_HEIGHT,
//         offset: ITEM_HEIGHT * index,
//         index,
//       })}
//       onMomentumScrollEnd={event =>
//         handleScroll(event, setIndex, ref, data!.length)
//       }
//       style={styles.column}
//       contentContainerStyle={{
//         paddingVertical:
//           (SCREEN_HEIGHT * verticalScale(0.14) - ITEM_HEIGHT) / 2, // Center the items
//       }}
//     />
//   );

//   const difficultyColor = difficulty
//     ? difficulty === 'Warmup'
//       ? '#777777'
//       : difficulty === 'Easy'
//       ? '#28A745'
//       : difficulty === 'Medium'
//       ? '#FFC107'
//       : '#DC3545'
//     : undefined;

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <CustomText fontFamily="semiBold" color={COLORS.whiteTail}>
//           Reps
//         </CustomText>
//         <CustomText fontFamily="semiBold" color={COLORS.whiteTail}>
//           Distance
//         </CustomText>
//         <CustomText fontFamily="semiBold" color={COLORS.whiteTail}>
//           Weight(kg)
//         </CustomText>
//         <CustomText fontFamily="semiBold" color={COLORS.whiteTail}>
//           Time
//         </CustomText>
//       </View>
//       <View style={styles.divider} />
//       <View style={styles.pickerContainer}>
//         {renderColumn(
//           repsData,
//           selectedRepsIndex,
//           setSelectedRepsIndex,
//           repsRef,
//         )}
//         {renderColumn(
//           distanceData,
//           selectedDistanceIndex,
//           setSelectedDistanceIndex,
//           distanceRef,
//         )}
//         {renderColumn(
//           weightData,
//           selectedWeightIndex,
//           setSelectedWeightIndex,
//           weightRef,
//         )}
//         {renderColumn(
//           timeData,
//           selectedTimeIndex,
//           setSelectedTimeIndex,
//           timeRef,
//         )}
//         <View style={styles.highlightOverlay}>
//           <View
//             style={{
//               width: 30,
//               height: ITEM_HEIGHT,
//               backgroundColor: difficultyColor,
//               left: -30,
//               borderTopLeftRadius: 10,
//               borderBottomLeftRadius: 10,
//             }}
//           />
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     borderRadius: 10,
//     width: wp(100),
//     alignItems: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     paddingVertical: 10,
//     width: wp(80),
//   },
//   headerText: {},
//   divider: {
//     height: 0.4,
//     backgroundColor: '#FFFFFF',
//     marginVertical: 5,
//     width: wp(80),
//   },
//   pickerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     width: wp(80),
//     height: SCREEN_HEIGHT * verticalScale(0.14), // Adjust height to show 3 items (1 above, 1 selected, 1 below)
//   },
//   column: {
//     zIndex: 2,
//   },
//   item: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   highlightOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: (SCREEN_HEIGHT * verticalScale(0.14) - ITEM_HEIGHT) / 2,
//     height: ITEM_HEIGHT,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     borderRadius: 5,
//     zIndex: 1,
//   },
// });

// export default PickerComponent;

import React, {FC, useRef, useState, useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import COLORS from '../Utilities/Colors';
import {verticalScale, wp} from '../Utilities/Metrics';
import {CustomText} from './CustomText';
import PrimaryButton from './PrimaryButton';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const ITEM_HEIGHT = verticalScale(40);

interface PickerComponentProps {
  difficulty: string;
  onValuesChange?: (values: {
    reps: string;
    distance?: string;
    weight?: string;
    time?: string;
  }) => void;
  showDistance?: boolean; // controlled by Is_distance
  showWeight?: boolean; // controlled by is_weight
  showTime?: boolean;
}

const PickerComponent: FC<PickerComponentProps> = ({
  difficulty,
  onValuesChange,
  showDistance = false,
  showWeight = false,
  showTime = false,
}) => {
  // Data arrays
  const repsData = Array.from({length: 1000}, (_, i) => (i + 1).toString());
  const distanceData = Array.from({length: 1000}, (_, i) => `${1 + i}m`);
  const weightData = Array.from({length: 3000}, (_, i) => `${1 + i}kg`);
  const timeData = Array.from({length: 1000}, (_, i) => `${1 + i}m`);

  const maxValues: any = {
    reps: repsData.length,
    distance: distanceData.length,
    weight: weightData.length,
    time: timeData.length,
  };

  // State
  const [selectedRepsIndex, setSelectedRepsIndex] = useState(5);
  const [selectedDistanceIndex, setSelectedDistanceIndex] = useState(5);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(5);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(5);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Refs
  const repsRef = useRef<FlatList>(null);
  const distanceRef = useRef<FlatList>(null);
  const weightRef = useRef<FlatList>(null);
  const timeRef = useRef<FlatList>(null);

  // Callback to parent
  useEffect(() => {
    if (!onValuesChange) return;

    onValuesChange({
      reps: repsData[selectedRepsIndex],

      distance: showDistance ? distanceData[selectedDistanceIndex] : '--',

      weight: showWeight ? weightData[selectedWeightIndex] : '--',

      time: showTime ? timeData[selectedTimeIndex] : '--',
    });
  }, [
    selectedRepsIndex,
    selectedDistanceIndex,
    selectedWeightIndex,
    selectedTimeIndex,
    showDistance,
    showWeight,
    showTime,
  ]);

  // Helper to get visible columns count
  const visibleColumns = [showDistance, showWeight, showTime].filter(
    Boolean,
  ).length;

  // Smooth scroll handling
  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    setIndex: (index: number) => void,
    dataLength: number,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < dataLength) {
      setIndex(index);
    }
  };

  // Open modal
  const openModal = (column: string, currentValue: string) => {
    setEditingColumn(column);
    setInputValue(currentValue.replace(/[^0-9]/g, ''));
    setError(null);
    setModalVisible(true);
  };

  // Validate input as user types
  const handleInputChange = (text: string) => {
    setInputValue(text);
    const numeric = Number(text);
    if (!editingColumn) return;
    if (numeric < 1 || numeric > maxValues[editingColumn]) {
      setError(`Value must be between 1 and ${maxValues[editingColumn]}`);
    } else {
      setError(null);
    }
  };

  // Update value from modal
  const updateValue = () => {
    if (!editingColumn) return;

    let numericValue = Number(inputValue);
    if (numericValue < 1) numericValue = 1;
    if (numericValue > maxValues[editingColumn])
      numericValue = maxValues[editingColumn];

    switch (editingColumn) {
      case 'reps':
        setSelectedRepsIndex(numericValue - 1);
        repsRef.current?.scrollToIndex({
          index: numericValue - 1,
          animated: true,
        });
        break;
      case 'distance':
        setSelectedDistanceIndex(numericValue - 1);
        distanceRef.current?.scrollToIndex({
          index: numericValue - 1,
          animated: true,
        });
        break;
      case 'weight':
        setSelectedWeightIndex(numericValue - 1);
        weightRef.current?.scrollToIndex({
          index: numericValue - 1,
          animated: true,
        });
        break;
      case 'time':
        setSelectedTimeIndex(numericValue - 1);
        timeRef.current?.scrollToIndex({
          index: numericValue - 1,
          animated: true,
        });
        break;
    }

    setModalVisible(false);
    setEditingColumn(null);
  };

  // Render FlatList item
  const renderItem = (
    item: string,
    index: number,
    selectedIndex: number,
    column: string,
  ) => {
    const isSelected = index === selectedIndex;
    return (
      <TouchableOpacity
        style={[styles.item, {height: ITEM_HEIGHT}]}
        onPress={() => isSelected && openModal(column, item)}>
        <CustomText fontSize={20} color={isSelected ? COLORS.white : '#908E8E'}>
          {item}
        </CustomText>
      </TouchableOpacity>
    );
  };

  // Render column
  const renderColumn = (
    data: string[],
    selectedIndex: number,
    setIndex: (value: number) => void,
    ref: React.RefObject<FlatList>,
    column: string,
  ) => (
    <FlatList
      ref={ref}
      data={data}
      keyExtractor={(item, index) => item + index}
      renderItem={({item, index}) =>
        renderItem(item, index, selectedIndex, column)
      }
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={event => handleScroll(event, setIndex, data.length)}
      initialScrollIndex={selectedIndex}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      style={styles.column}
      contentContainerStyle={{
        paddingVertical:
          (SCREEN_HEIGHT * verticalScale(0.14) - ITEM_HEIGHT) / 2,
      }}
    />
  );

  const difficultyColor =
    difficulty === 'Warmup'
      ? '#777777'
      : difficulty === 'Easy'
      ? '#28A745'
      : difficulty === 'Medium'
      ? '#FFC107'
      : '#DC3545';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText fontFamily="semiBold" color={COLORS.whiteTail}>
          Reps
        </CustomText>
        {showDistance && (
          <CustomText fontFamily="semiBold" color={COLORS.whiteTail}>
            Distance
          </CustomText>
        )}
        {showWeight && (
          <CustomText fontFamily="semiBold" color={COLORS.whiteTail}>
            Weight(kg)
          </CustomText>
        )}
        {showTime && (
          <CustomText fontFamily="semiBold" color={COLORS.whiteTail}>
            Time
          </CustomText>
        )}
      </View>
      <View style={styles.divider} />
      <View
        style={[
          styles.pickerContainer,
          {
            justifyContent:
              visibleColumns === 1
                ? 'center'
                : visibleColumns === 2
                ? 'space-around'
                : 'space-evenly',
            width: wp(80),
          },
        ]}>
        {renderColumn(
          repsData,
          selectedRepsIndex,
          setSelectedRepsIndex,
          repsRef,
          'reps',
        )}
        {showDistance &&
          renderColumn(
            distanceData,
            selectedDistanceIndex,
            setSelectedDistanceIndex,
            distanceRef,
            'distance',
          )}
        {showWeight &&
          renderColumn(
            weightData,
            selectedWeightIndex,
            setSelectedWeightIndex,
            weightRef,
            'weight',
          )}
        {showTime &&
          renderColumn(
            timeData,
            selectedTimeIndex,
            setSelectedTimeIndex,
            timeRef,
            'time',
          )}
        {visibleColumns > 0 && (
          <View style={styles.highlightOverlay}>
            <View
              style={{
                width: 30,
                height: ITEM_HEIGHT,
                backgroundColor: difficultyColor,
                left: -30,
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
              }}
            />
          </View>
        )}
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={10}
            onPress={e => e.stopPropagation()}>
            <CustomText fontSize={18} fontFamily="semiBold">
              Edit {editingColumn}
            </CustomText>
            <TextInput
              style={styles.modalInput}
              value={inputValue}
              onChangeText={handleInputChange}
              keyboardType="number-pad"
              autoFocus
            />
            {error && (
              <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
            )}
            <PrimaryButton
              title="Update"
              onPress={updateValue}
              backgroundColor={
                !inputValue || !!error ? 'rgba(255,165,0,0.6)' : COLORS.orange
              }
              isFullWidth={false}
              style={styles.btnStyle}
              textColor={COLORS.whiteTail}
              disabled={!inputValue || !!error}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    width: wp(100),
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    width: wp(80),
  },
  divider: {
    height: 0.4,
    backgroundColor: '#FFFFFF',
    marginVertical: 5,
    width: wp(80),
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: wp(80),
    height: SCREEN_HEIGHT * verticalScale(0.14),
  },
  column: {zIndex: 2},
  item: {justifyContent: 'center', alignItems: 'center'},
  highlightOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (SCREEN_HEIGHT * verticalScale(0.14) - ITEM_HEIGHT) / 2,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 5,
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: wp(70),
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalInput: {
    width: '80%',
    height: 40,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 15,
    color: COLORS.whiteTail,
    textAlign: 'center',
  },
  btnStyle: {paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8},
});

export default PickerComponent;
