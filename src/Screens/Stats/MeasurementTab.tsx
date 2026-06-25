import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import CustomLineChart from '../../Components/Charts/LineChart';
import {verticalScale} from '../../Utilities/Metrics';

interface MeasurementTabProps {
  data?: any;
}

const MeasurementTab: FC<MeasurementTabProps> = ({data}) => {
  const [chartData, setChartData] = useState([]);
  const [chartUnit, setChartUnit] = useState('kg');
  const [currentTab, setCurrentTab] = useState(1); // Default to Weight tab
  const [storeMuscle, setStoreMuscle] = useState<any>([]);

  const fetchDataForTab = async (tabValue: any) => {
    // Simulate API call based on tab
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    let newData: any = [];
    let newUnit = 'kg';

    if (tabValue === 1) {
      // Weight
      newData = [
        {value: 0, date: '8/1'},
        {value: 60, date: '8/2'},
        {value: 50, date: '8/3'},
        {value: 80, date: '8/4'},
        {value: 75, date: '8/5'},
        {value: 90, date: '8/6'},
        {value: 85, date: '8/7'},
        {value: 100, date: '8/8'},
        {value: 95, date: '8/9'},
        {value: 104, date: '8/10'},
      ];
      newUnit = 'kg';
    } else if (tabValue === 2) {
      // Distance
      newData = [
        {value: 0, date: '8/1'},
        {value: 60, date: '8/2'},
        {value: 50, date: '8/3'},
        {value: 80, date: '8/4'},
        {value: 75, date: '8/5'},
        {value: 90, date: '8/6'},
        {value: 85, date: '8/7'},
        {value: 100, date: '8/8'},
        {value: 95, date: '8/9'},
        {value: 104, date: '8/10'},
      ];
      newUnit = 'km';
    } else if (tabValue === 3) {
      // Time
      newData = [
        {value: 0, date: '8/1'},
        {value: 60, date: '8/2'},
        {value: 50, date: '8/3'},
        {value: 80, date: '8/4'},
        {value: 75, date: '8/5'},
        {value: 90, date: '8/6'},
        {value: 85, date: '8/7'},
        {value: 100, date: '8/8'},
        {value: 95, date: '8/9'},
        {value: 104, date: '8/10'},
      ];
      newUnit = 'min';
    } else if (tabValue === 4) {
      // Reps (e.g., total reps for an exercise)
      newData = [
        {value: 0, date: '8/1'},
        {value: 60, date: '8/2'},
        {value: 50, date: '8/3'},
        {value: 80, date: '8/4'},
        {value: 75, date: '8/5'},
        {value: 90, date: '8/6'},
        {value: 85, date: '8/7'},
        {value: 100, date: '8/8'},
        {value: 95, date: '8/9'},
        {value: 104, date: '8/10'},
      ];
      newUnit = 'reps';
    }
    return {data: newData, unit: newUnit};
  };

  // useEffect(() => {
  //   // Fetch initial data or data when tab changes
  //   fetchDataForTab(currentTab).then(result => {
  //     setChartData(result.data);
  //     setChartUnit(result.unit);
  //   });
  // }, [currentTab]); // Re-fetch when currentTab changes

  useEffect(() => {
    if (!storeMuscle?.part) return;

    // Filter data for the selected muscle
    const filteredData = data
      ?.filter((item: any) => item.type === 'measurement')
      .flatMap((item: any) =>
        item.content.list.map((listItem: any) => ({
          ...listItem,
          schedule_at: item.schedule_at,
        })),
      )
      .filter((item: any) => item.part === storeMuscle.part);

    // Transform for chart
    const newData =
      filteredData?.map((item: any) => ({
        value: Number(item.amount) || 0,
        date: new Date(item.schedule_at).toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
        }),
      })) || [];

    // Get unit from the data - it can be cm, inch, %, kg, lb, etc.
    const newUnit = filteredData?.[0]?.unit || '';

    setChartData(newData);
    setChartUnit(newUnit);
  }, [storeMuscle, data]);

  const handleTabChange = (newTabValue: any) => {
    setCurrentTab(newTabValue);
    // Data fetching is handled by the useEffect hook
  };

  return (
    <View
      style={{
        borderRadius: 10,
        paddingVertical: verticalScale(10),
        gap: verticalScale(10),
      }}>
      <CustomLineChart
        isMeasurementTab={true}
        data={chartData}
        unit={chartUnit}
        onTabChange={handleTabChange}
        initialTabValue={currentTab} // Keep chart synced with parent state if needed
        // Optional: Customize further
        // lineColor={COLORS.green}
        // yAxisMaxValue={100} // Set a fixed max Y if needed
        storeMuscle={storeMuscle}
        setStoreMuscle={setStoreMuscle}
      />
      {/* <BarChart /> */}
    </View>
  );
};

export default MeasurementTab;

const styles = StyleSheet.create({});
