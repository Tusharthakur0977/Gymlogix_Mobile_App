import React, {FC, useEffect, useMemo, useState} from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {LineChart, yAxisSides} from 'react-native-gifted-charts';
import COLORS from '../../Utilities/Colors'; // Adjust the import based on your project structure
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics'; // Adjust the import based on your project structure
import {CustomText} from '../CustomText';
import {Picker, PickerIOS} from '@react-native-picker/picker';
import FONTS from '../../Assets/fonts';
import CustomIcon from '../CustomIcon';
import ICONS from '../../Assets/Icons';
import {useAppSelector} from '../../Redux/store';

// Utility functions to format date strings
const formatDate = (dateStr: string): string => {
  // Parse the date string (assuming format is "M/D")
  const [month, day] = dateStr.split('/').map(Number);

  // Get month name
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Assume current year if not provided
  const year = new Date().getFullYear();

  // Return formatted date
  return `${day} ${monthNames[month - 1].slice(0, 3)} ${year}`;
};

// Shorter format for axis labels
const formatShortDate = (dateStr: string): string => {
  // Parse the date string (assuming format is "M/D")
  const [month, day] = dateStr.split('/').map(Number);

  // Get abbreviated month name
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Return short formatted date
  return `${monthNames[month - 1]} ${day}`;
};

// Define the structure for a single data point
interface DataPoint {
  value: number;
  date: string; // Keep date as string for display, consider using Date objects if complex date logic is needed
  // Add other potential fields if needed depending on the data source
}

// Define the props for the WeightChart component
interface LineChartProps {
  /** The dataset to display in the chart */
  data: DataPoint[];
  /** The unit for the values (e.g., 'kg', 'lbs', 'km', 'mi', 'min', 'reps') */
  unit?: string;
  /** Optional initial active tab value */
  initialTabValue?: number;
  /** Optional initial selected stat option */
  initialSelectedOption?: 'Total' | 'Average';
  /** Optional tabs configuration if it needs to be dynamic */
  tabs?: {label: string; value: number}[];
  /** Callback function when a tab is changed */
  onTabChange?: (tabValue: number) => void;
  /** Callback function when option (Total/Average) is changed */
  onOptionChange?: (option: 'Total' | 'Average', value: number) => void;
  /** Optional chart line color */
  lineColor?: string;
  /** Optional chart data point color */
  dataPointColor?: string;
  /** Optional max value for Y Axis (useful for consistent scale across datasets) */
  yAxisMaxValue?: number;
  /** Optional number of sections for Y Axis */
  yAxisSections?: number;
  isMeasurementTab?: boolean;
  maxValue?: {date: string; value: number} | null;
  minValue?: {date: string; value: number} | null;
  storeMuscle: any;
  setStoreMuscle: any;
}

// Default Tabs if not provided via props
const defaultChartTabsData = [
  {label: 'Weight', value: 1},
  {label: 'Distance', value: 2},
  {label: 'Time', value: 3},
  {label: 'Reps', value: 4},
];

const CustomLineChart: FC<LineChartProps> = ({
  data = [], // Default to empty array if no data is provided
  unit = 'kg', // Default unit
  initialTabValue = 1,
  initialSelectedOption = 'Total',
  tabs = defaultChartTabsData,
  onTabChange,
  onOptionChange,
  lineColor = COLORS.blue,
  dataPointColor = COLORS.blue,
  yAxisMaxValue, // Allow parent to control max Y value
  yAxisSections = 3, // Default number of sections for Y axis labels (3 sections = 4 labels including 0)
  isMeasurementTab = false,
  maxValue,
  minValue,
  storeMuscle,
  setStoreMuscle,
}) => {
  const [chartTabs, setChartsTabs] = useState(initialTabValue);
  const {scheduleData} = useAppSelector(state => state.scheduleData);
  const [selectedOption, setSelectedOption] = useState(initialSelectedOption);

  const [plan, setPlan] = useState<any>('Select Muscle');

  const [isMeasurementModal, setIsMeasurementModal] = useState(false);

  const plans = scheduleData
    ?.filter(item => item.type === 'measurement')
    .flatMap(item => item.content.list) // get all measurement objects
    .reduce((acc, curr) => {
      const key = curr.part;
      if (!acc[key]) {
        acc[key] = {...curr, amount: Number(curr.amount)};
      } else {
        acc[key].amount += Number(curr.amount); // add amounts
      }
      return acc;
    }, {});

  // convert object back to array
  const groupedPlans = Object.values(plans);

  // Memoize calculations to avoid re-computing on every render unless data changes
  const {
    total,
    average,
    chartData,
    xAxisLabels,
    maxTotalEntry,
    minTotalEntry,
    maxAverageEntry,
    minAverageEntry,
  } = useMemo(() => {
    if (!data || data.length === 0) {
      // Handle empty data case
      return {
        total: 0,
        average: 0,
        chartData: [],
        xAxisLabels: [],
        maxTotalEntry: null,
        minTotalEntry: null,
        maxAverageEntry: null,
        minAverageEntry: null,
      };
    }

    const values = data.map(item => item.value);
    const calculatedTotal = values.reduce((sum, item) => sum + item, 0);
    const calculatedAverage =
      values.length > 0 ? calculatedTotal / values.length : 0;

    // Group data by date to calculate totals and averages for each date
    const dateGroups = data.reduce(
      (groups: Record<string, DataPoint[]>, item) => {
        const date = item.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      },
      {},
    );

    // Calculate totals and averages for each date group
    const dateStats = Object.entries(dateGroups).map(([date, items]) => {
      const dateValues = items.map(item => item.value);
      const dateTotal = dateValues.reduce((sum, val) => sum + val, 0);
      const dateAverage =
        dateValues.length > 0 ? dateTotal / dateValues.length : 0;
      return {
        date,
        total: dateTotal,
        average: dateAverage,
      };
    });

    // Find max and min for totals
    const totalValues = dateStats.map(stat => stat.total);
    const maxTotal = Math.max(...totalValues);
    const minTotal = Math.min(...totalValues);
    const maxTotalStat =
      dateStats.find(stat => stat.total === maxTotal) || null;
    const minTotalStat =
      dateStats.find(stat => stat.total === minTotal) || null;

    // Find max and min for averages
    const averageValues = dateStats.map(stat => stat.average);
    const maxAverage = Math.max(...averageValues);
    const minAverage = Math.min(...averageValues);
    const maxAverageStat =
      dateStats.find(stat => stat.average === maxAverage) || null;
    const minAverageStat =
      dateStats.find(stat => stat.average === minAverage) || null;

    // Create entries for max/min total and average
    const calculatedMaxTotalEntry = maxTotalStat
      ? {
          date: maxTotalStat.date,
          value: maxTotalStat.total,
        }
      : null;

    const calculatedMinTotalEntry = minTotalStat
      ? {
          date: minTotalStat.date,
          value: minTotalStat.total,
        }
      : null;

    const calculatedMaxAverageEntry = maxAverageStat
      ? {
          date: maxAverageStat.date,
          value: maxAverageStat.average,
        }
      : null;

    const calculatedMinAverageEntry = minAverageStat
      ? {
          date: minAverageStat.date,
          value: minAverageStat.average,
        }
      : null;

    // Prepare data for the gifted-charts LineChart component
    // For chart display, we'll create data points based on the selected option
    let preparedChartData;

    // For X-axis labels, use unique dates to avoid duplicates
    const uniqueDates = [...new Set(data.map(item => item.date))];

    // Format the dates for display
    const preparedXAxisLabels = uniqueDates.map(date => formatShortDate(date));

    // If we're showing Total or Average, we need to aggregate the data by date
    if (selectedOption === 'Total' || selectedOption === 'Average') {
      // Create data points based on the totals or averages for each date
      preparedChartData = dateStats.map(stat => ({
        value: selectedOption === 'Total' ? stat.total : stat.average,
        date: stat.date,
      }));
    } else {
      // Use the original data points
      preparedChartData = data.map(item => ({value: item.value}));
    }

    return {
      total: calculatedTotal,
      average: calculatedAverage,
      chartData: preparedChartData,
      xAxisLabels: uniqueDates,
      maxTotalEntry: calculatedMaxTotalEntry,
      minTotalEntry: calculatedMinTotalEntry,
      maxAverageEntry: calculatedMaxAverageEntry,
      minAverageEntry: calculatedMinAverageEntry,
    };
  }, [data, selectedOption]); // Dependency array: recalculate when data or selectedOption changes

  const handleTabClick = (tabValue: number) => {
    setChartsTabs(tabValue);
    if (onTabChange) {
      onTabChange(tabValue); // Notify parent component of tab change
    }
  };

  // Determine Y-axis labels dynamically or use provided max value
  // Calculate Y-axis properties for the chart
  const yAxisProps = useMemo(() => {
    // Find the maximum value in the data for Y-axis scaling
    const dataMax =
      data && data.length > 0 ? Math.max(...data.map(item => item.value)) : 0;

    const effectiveMax =
      yAxisMaxValue ??
      (dataMax > 0
        ? Math.ceil(dataMax / yAxisSections) * yAxisSections
        : yAxisSections * 10); // Calculate a reasonable max if not provided
    const step = effectiveMax > 0 ? effectiveMax / yAxisSections : 10; // Avoid division by zero

    return {
      maxValue: effectiveMax,
      stepValue: step,
      noOfSections: yAxisSections,
    };
  }, [data, yAxisMaxValue, yAxisSections]);

  // Call onOptionChange when component mounts or when data/selectedOption changes
  useEffect(() => {
    if (onOptionChange && data && data.length > 0) {
      if (selectedOption === 'Total') {
        onOptionChange('Total', total);
      } else {
        onOptionChange('Average', average);
      }
    }
  }, [data, selectedOption, total, average, onOptionChange]);

  return (
    <View style={styles.container}>
      {/* Tabs Section */}
      {!isMeasurementTab && (
        <View style={styles.topTabsContainer}>
          {tabs.map(tab => (
            <Pressable
              key={tab.value}
              style={styles.tab}
              onPress={() => handleTabClick(tab.value)}>
              <CustomText
                fontSize={14}
                fontFamily="medium"
                color={
                  chartTabs === tab.value ? COLORS.brown : COLORS.whiteTail
                }
                style={[
                  styles.tabText,
                  chartTabs === tab.value && styles.activeTab,
                ]}>
                {tab.label}
              </CustomText>
            </Pressable>
          ))}
        </View>
      )}

      {isMeasurementTab && (
        <View style={styles.dropdownWrapper}>
          <CustomText fontFamily="bold">Measurements</CustomText>
          <Pressable
            style={styles.dropdownButton}
            onPress={() => setIsMeasurementModal(true)}>
            <CustomText
              fontSize={12}
              color={plan ? COLORS.black : COLORS.nickel}>
              {plan ? plan : 'Select Muscle'}
            </CustomText>
            <CustomIcon Icon={ICONS.DownArrowIcon} height={7} width={16} />
          </Pressable>
          {/* {Platform.OS === "ios" ? (
            <PickerIOS
              selectedValue={plan}
              onValueChange={(itemValue) => setPlan(itemValue)}
              style={[styles.dropdown, { borderRadius: 15 }]}
            >
              {plans.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
              ))}
            </PickerIOS>
          ) : (
            <View style={{ borderRadius: 5, overflow: "hidden" }}>
              <Picker
                selectedValue={plan}
                onValueChange={(itemValue) => setPlan(itemValue)}
                style={styles.dropdown}
                dropdownIconColor={COLORS.darkBrown}
              >
                {plans.map((item, index) => {
                  return (
                    <Picker.Item
                      color={index === 0 ? COLORS.nickel : COLORS.black}
                      style={{
                        fontSize: 12,
                        fontFamily: FONTS.medium,
                      }}
                      key={index}
                      label={item}
                      value={item}
                    />
                  );
                })}
              </Picker>
            </View>
          )} */}

          <Modal
            animationType="slide"
            transparent={true}
            visible={isMeasurementModal}
            onRequestClose={() => {
              setIsMeasurementModal(!isMeasurementModal);
            }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setIsMeasurementModal(!isMeasurementModal);
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
                  <CustomText
                    fontFamily="bold"
                    color={COLORS.black}
                    fontSize={18}>
                    Select Muscle
                  </CustomText>
                  <CustomIcon
                    onPress={() => setIsMeasurementModal(!isMeasurementModal)}
                    Icon={ICONS.CrossIcon}
                  />
                </View>
                <ScrollView>
                  {groupedPlans.map((item: any, index) => (
                    <Pressable
                      key={index}
                      style={styles.modalItem}
                      onPress={() => {
                        setStoreMuscle(item); // whole object with summed amount
                        setPlan(item?.part); // just the part
                        setIsMeasurementModal(false);
                      }}>
                      <CustomText color={COLORS.black} style={styles.itemText}>
                        {item?.part}
                      </CustomText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}

      {/* Line Chart */}
      {data && data.length > 0 ? ( // Only render chart if data exists
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={wp(85)}
            height={hp(30)}
            color={lineColor}
            dataPointsRadius1={5}
            dataPointsColor={dataPointColor}
            spacing={horizontalScale(40)} // Consider making this dynamic based on data length?
            thickness={2}
            yAxisTextStyle={styles.yAxisText}
            xAxisLabelTextStyle={styles.xAxisText}
            xAxisTextNumberOfLines={2}
            endFillColor="rgba(0, 122, 255, 0.2)" // Prop? Use lineColor with opacity?
            yAxisColor={COLORS.brown} // Prop?
            xAxisColor={COLORS.brown} // Prop?
            hideRules // Prop?
            yAxisSide={yAxisSides.RIGHT} // Prop?
            xAxisLabelTexts={xAxisLabels}
            initialSpacing={20}
            endSpacing={6}
            yAxisOffset={0}
            adjustToWidth={true} // useful if spacing is fixed but data length varies
          />
          {/* Y-Axis Overlay - Position might need adjustment based on dynamic labels */}
          <View style={styles.yAxisOverlay}>
            <CustomText fontFamily="bold" fontSize={12}>
              {`${yAxisProps.maxValue.toFixed(0)} ${unit}`}
              {/* Use calculated max and dynamic unit */}
            </CustomText>
            <View style={styles.yAxisBackground} />
          </View>
        </View>
      ) : (
        // Placeholder or message when there is no data
        <View style={styles.noDataContainer}>
          <CustomText color={COLORS.whiteTail}>
            No data available for this period or category.
          </CustomText>
        </View>
      )}

      {/* Stats Option Section */}
      {!isMeasurementTab && (
        <View style={styles.statsContainer}>
          <TouchableOpacity
            onPress={() => {
              setSelectedOption('Total');
              if (onOptionChange && data && data.length > 0) {
                onOptionChange('Total', total);
              }
            }}
            style={styles.statItem}
            disabled={!data || data.length === 0} // Disable if no data
          >
            <CustomText
              fontFamily="bold"
              color={
                !data || data.length === 0 ? COLORS.whiteTail : COLORS.whiteTail
              }>
              Total
            </CustomText>
            <View
              style={[
                styles.radioCircle,
                selectedOption === 'Total'
                  ? styles.radioSelected
                  : styles.radioUnselected,
                (!data || data.length === 0) && styles.radioDisabled,
              ]}
            />
            {/* Optional: Display the total value */}
            {/* <CustomText>{`${total.toFixed(1)} ${unit}`}</CustomText> */}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedOption('Average');
              if (onOptionChange && data && data.length > 0) {
                onOptionChange('Average', average);
              }
            }}
            style={styles.statItem}
            disabled={!data || data.length === 0} // Disable if no data
          >
            <CustomText
              fontFamily="bold"
              color={
                !data || data.length === 0 ? COLORS.whiteTail : COLORS.whiteTail
              }>
              Average
            </CustomText>
            <View
              style={[
                styles.radioCircle,
                selectedOption === 'Average'
                  ? styles.radioSelected
                  : styles.radioUnselected,
                (!data || data.length === 0) && styles.radioDisabled,
              ]}
            />
            {/* Optional: Display the average value */}
            {/* <CustomText>{`${average.toFixed(1)} ${unit}`}</CustomText> */}
          </TouchableOpacity>
        </View>
      )}

      {/* Max and Min Section */}
      <View
        style={[
          styles.minMaxContainer,
          isMeasurementTab && {marginTop: verticalScale(70)},
        ]}>
        {/* Max */}
        <View style={styles.minMaxItem}>
          <CustomText
            fontFamily="italicBold"
            color={COLORS.yellow}
            fontSize={18}>
            Max
          </CustomText>
          <CustomText fontFamily="medium" fontSize={18} color={COLORS.black}>
            {selectedOption === 'Total'
              ? maxTotalEntry
                ? `${maxTotalEntry.value.toFixed(0)} ${unit}`
                : `N/A`
              : maxAverageEntry
              ? `${maxAverageEntry.value.toFixed(0)} ${unit}`
              : `N/A`}
          </CustomText>
          <CustomText
            fontFamily="italic"
            color={COLORS.lightBrown}
            fontSize={12}>
            {selectedOption === 'Total'
              ? maxTotalEntry
                ? formatDate(maxTotalEntry.date)
                : '-'
              : maxAverageEntry
              ? formatDate(maxAverageEntry.date)
              : '-'}
          </CustomText>
        </View>

        {/* Min */}
        <View style={styles.minMaxItem}>
          <CustomText
            fontFamily="italicBold"
            color={COLORS.yellow}
            fontSize={18}>
            Min
          </CustomText>
          <CustomText fontFamily="medium" fontSize={18} color={COLORS.black}>
            {selectedOption === 'Total'
              ? minTotalEntry
                ? `${minTotalEntry.value.toFixed(0)} ${unit}`
                : `N/A`
              : minAverageEntry
              ? `${minAverageEntry.value.toFixed(0)} ${unit}`
              : `N/A`}
          </CustomText>
          <CustomText
            fontFamily="italic"
            color={COLORS.lightBrown}
            fontSize={12}>
            {selectedOption === 'Total'
              ? minTotalEntry
                ? formatDate(minTotalEntry.date)
                : '-'
              : minAverageEntry
              ? formatDate(minAverageEntry.date)
              : '-'}
          </CustomText>
        </View>
      </View>
    </View>
  );
};

export default CustomLineChart;

// --- Styles remain largely the same, with minor additions ---
const styles = StyleSheet.create({
  container: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(40),
    backgroundColor: COLORS.brown || '#333',
    borderRadius: 10,
    gap: verticalScale(30),
  },
  topTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Adjust if tabs overflow: maybe 'flex-start' and scrollview
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    marginHorizontal: horizontalScale(20),
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
  },
  tab: {
    // Adjust padding/margin if needed for more tabs
  },
  tabText: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 5,
    textAlign: 'center',
    overflow: 'hidden', // Prevent text overflow issues on long labels
  },
  activeTab: {
    backgroundColor: COLORS.whiteTail,
    color: COLORS.brown, // Ensure text color contrasts with background
    borderRadius: 10,
  },
  chartWrapper: {
    position: 'relative',
    marginHorizontal: horizontalScale(10), // Give chart slightly more space
    height: hp(32), // Ensure wrapper accommodates chart height + potential overflows
    // backgroundColor: 'rgba(255,0,0,0.1)', // DEBUG: uncomment to see wrapper bounds
  },
  yAxisText: {
    color: COLORS.white || '#FFF',
    fontSize: 10, // Slightly smaller if labels get crowded
  },
  xAxisText: {
    color: COLORS.white || '#FFF',
    fontSize: 10, // Slightly smaller if labels get crowded
    textAlign: 'left',
    marginTop: 5,
  },
  yAxisOverlay: {
    position: 'absolute',
    right: horizontalScale(30), // Adjust position based on yAxisSide and label width
    top: verticalScale(-15), // Adjust vertical position
    height: '105%', // May need adjustment
    alignItems: 'center',
    gap: verticalScale(5),
    // backgroundColor: 'rgba(0,255,0,0.1)', // DEBUG: uncomment to see overlay bounds
  },
  yAxisBackground: {
    backgroundColor: '#F1F1F1',
    width: horizontalScale(40), // Ensure this width accommodates labels
    height: '100%',
    opacity: 0.2,
    borderRadius: 10,
  },
  noDataContainer: {
    height: hp(32), // Same height as chart area
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: horizontalScale(20),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: horizontalScale(10),
    marginTop: verticalScale(10),
  },
  statItem: {
    gap: verticalScale(10),
    alignItems: 'center',
  },
  // --- Radio button styles ---
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: COLORS.black, // Default border
  },
  radioSelected: {
    backgroundColor: COLORS.yellow, // Selected fill color
    borderColor: COLORS.yellow, // Selected border color
  },
  radioUnselected: {
    backgroundColor: COLORS.black, // Or transparent if preferred
  },
  radioDisabled: {
    backgroundColor: COLORS.lightBrown, // Disabled appearance
    borderColor: COLORS.lightBrown,
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: horizontalScale(20),
    paddingHorizontal: horizontalScale(10),
  },
  minMaxItem: {
    backgroundColor: COLORS.white || '#FFF',
    borderRadius: 10,
    paddingVertical: verticalScale(5),
    alignItems: 'center',
    minWidth: horizontalScale(120), // Ensure items have minimum width
  },

  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.brown,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    gap: horizontalScale(5),
    width: wp(50),
  },
  dropdownWrapper: {
    flex: 1,
    gap: verticalScale(5),
    alignSelf: 'center',
    width: wp(50),
  },
  dropdown: {
    backgroundColor: COLORS.whiteTail,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#CECECE',
    overflow: 'hidden',
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
    paddingHorizontal: horizontalScale(10),
  },
  itemText: {
    fontSize: 16,
  },
});
