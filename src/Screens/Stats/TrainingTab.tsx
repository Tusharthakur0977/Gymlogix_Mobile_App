import React, {FC, useEffect, useState} from 'react';
import {View} from 'react-native';
import BarChart from '../../Components/Charts/BarChart';
import BodyChart from '../../Components/Charts/BodyChart';
import CustomLineChart from '../../Components/Charts/LineChart';
import {verticalScale} from '../../Utilities/Metrics';

export interface TrainingTabProps {
  exercises?: any;
}

const TrainingTab: FC<TrainingTabProps> = ({exercises}) => {
  const fetchDataForTab = async (tabValue: number) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    let newUnit = '';
    if (tabValue === 1) newUnit = 'kg';
    else if (tabValue === 2) newUnit = 'm';
    else if (tabValue === 3) newUnit = 'sec';
    else if (tabValue === 4) newUnit = 'reps';

    // Flatten setsData from single/multiple exercises
    const setsData = exercises.flatMap((ex: any) => ex.Set || []);

    // Group by date
    const daily: Record<string, {total: number; reps: number}> = {};

    setsData.forEach((c: any) => {
      const date = new Date(c.log_time).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      });

      if (!daily[date]) daily[date] = {total: 0, reps: 0};

      if (tabValue === 1 && c.weight) {
        daily[date].total += c.weight;
        daily[date].reps += c.reps || 0; // reps with weight
      } else if (tabValue === 2 && c.distance) {
        daily[date].total += c.distance;
        daily[date].reps += c.reps || 0; // reps with distance
      } else if (tabValue === 3 && c.time) {
        daily[date].total += c.time;
        daily[date].reps += c.reps || 0; // reps with time
      } else if (tabValue === 4) {
        daily[date].total += c.reps || 0; // total reps
        // no avg for reps
      }
    });

    // Prepare array
    const filtered = Object.entries(daily).map(([date, {total, reps}]) => {
      let avg = null;
      if (tabValue !== 4 && reps > 0) {
        avg = total / reps;
      }
      return {date, total, avg};
    });

    return {data: filtered, unit: newUnit};
  };

  const [chartData, setChartData] = useState<any[]>([]);
  const [chartUnit, setChartUnit] = useState('kg');
  const [currentTab, setCurrentTab] = useState(1); // Default to Weight tab
  const [selectedOption, setSelectedOption] = useState<'Total' | 'Average'>(
    'Total',
  );
  const [statValue, setStatValue] = useState(0);
  const [maxValue, setMaxValue] = useState<{
    date: string;
    value: number;
  } | null>(null);
  const [minValue, setMinValue] = useState<{
    date: string;
    value: number;
  } | null>(null);

  useEffect(() => {
    fetchDataForTab(currentTab).then(result => {
      let chart: {date: string; value: number}[] = [];

      if (selectedOption === 'Total') {
        chart = result.data.map((d: any) => ({
          date: d.date,
          value: d.total,
        }));
      } else {
        chart = result.data
          .filter((d: any) => d.avg !== null)
          .map((d: any) => ({
            date: d.date,
            value: d.avg,
          }));
      }

      setChartData(chart);
      setChartUnit(result.unit);

      if (chart.length > 0) {
        if (selectedOption === 'Total') {
          // sum all totals
          setStatValue(chart.reduce((sum, d) => sum + d.value, 0));
        } else {
          //  For Average, use mean of daily averages
          const avgValue =
            chart.reduce((sum, d) => sum + d.value, 0) / chart.length;
          setStatValue(avgValue);
        }

        // Max/Min calculation (same)
        const maxEntry = chart.reduce(
          (prev, curr) => (curr.value > prev.value ? curr : prev),
          chart[0],
        );
        const minEntry = chart.reduce(
          (prev, curr) => (curr.value < prev.value ? curr : prev),
          chart[0],
        );

        setMaxValue(maxEntry);
        setMinValue(minEntry);
      } else {
        setStatValue(0);
        setMaxValue(null);
        setMinValue(null);
      }
    });
  }, [currentTab, selectedOption, exercises]);

  const handleTabChange = (newTabValue: number) => {
    setCurrentTab(newTabValue);
  };

  const handleOptionChange = (option: 'Total' | 'Average') => {
    setSelectedOption(option);
  };

  return (
    <View
      style={{
        borderRadius: 10,
        paddingBottom: verticalScale(10),
        gap: verticalScale(10),
      }}>
      <CustomLineChart
        data={chartData}
        unit={chartUnit}
        onTabChange={handleTabChange}
        onOptionChange={handleOptionChange}
        initialTabValue={currentTab}
        initialSelectedOption={selectedOption}
        maxValue={maxValue}
        minValue={minValue}
        setStoreMuscle={() => {}}
        storeMuscle={() => {}}
      />
      <BodyChart primary_muscle={exercises} />
      <BarChart durationData={exercises} />
    </View>
  );
};

export default TrainingTab;
