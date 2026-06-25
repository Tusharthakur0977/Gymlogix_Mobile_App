import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import CustomLineChart from '../../Components/Charts/LineChart';
import MacronutrientChart, {
  NutrientData,
} from '../../Components/Charts/PieChart';
import {verticalScale} from '../../Utilities/Metrics';

export interface NutritionTabProps {
  foods: any;
}

const NutritionTab: FC<NutritionTabProps> = ({foods}) => {
  const [selectedOption, setSelectedOption] = useState<'Total' | 'Average'>(
    'Total',
  );

  const fetchDataForTab = async (
    tabValue: any,
    option: 'Total' | 'Average',
  ) => {
    // Aggregate data based on foods prop
    const aggregatedData: any = {};

    foods.forEach((item: any) => {
      const date = new Date(item.schedule_at).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      });
      if (!aggregatedData[date]) {
        aggregatedData[date] = {
          date,
          calories: 0,
          carbs: 0,
          fat: 0,
          protein: 0,
          count: 0, // Track number of entries per date for average
        };
      }
      const content = item.content;
      const valueKey =
        tabValue === 1
          ? 'calories'
          : tabValue === 2
          ? 'fat'
          : tabValue === 3
          ? 'protein'
          : 'carbs';
      const value =
        content[
          tabValue === 1
            ? 'calories'
            : tabValue === 2
            ? 'fat'
            : tabValue === 3
            ? 'protein'
            : 'carbs'
        ];
      aggregatedData[date][valueKey] += value;
      aggregatedData[date].count += 1;
    });

    const newData = Object.values(aggregatedData)
      .map((item: any) => {
        const valueKey =
          tabValue === 1
            ? 'calories'
            : tabValue === 2
            ? 'fat'
            : tabValue === 3
            ? 'protein'
            : 'carbs';
        const value =
          option === 'Average'
            ? item.count > 0
              ? item[valueKey] / item.count
              : 0
            : item[valueKey]; // Use total if not average
        return {
          value,
          date: item.date,
        };
      })
      .sort((a, b) => {
        const dateA: any = new Date(`2025-${a.date.replace('/', '-')}`);
        const dateB: any = new Date(`2025-${b.date.replace('/', '-')}`);
        return dateA - dateB;
      });

    const newUnit =
      tabValue === 1
        ? 'kcal'
        : tabValue === 2
        ? 'g'
        : tabValue === 3
        ? 'g'
        : 'g';
    return {data: newData, unit: newUnit};
  };

  // Calculate total macronutrients for the pie chart
  const total = foods.reduce(
    (acc: any, item: any) => ({
      calories: acc.calories + item.content.calories,
      carbs: acc.carbs + item.content.carbs,
      fat: acc.fat + item.content.fat,
      protein: acc.protein + item.content.protein,
    }),
    {calories: 0, carbs: 0, fat: 0, protein: 0},
  );

  const macroData: NutrientData[] = [
    {
      id: 'calories',
      name: 'Calories',
      percentage:
        (total.calories /
          (total.calories + total.carbs + total.fat + total.protein)) *
        100,
      value: total.calories,
      unit: 'kcal',
      color: '#D9D9D9',
    },
    {
      id: 'carbs',
      name: 'Carbs',
      percentage:
        (total.carbs /
          (total.calories + total.carbs + total.fat + total.protein)) *
        100,
      value: total.carbs,
      unit: 'g',
      color: '#FFD966',
    },
    {
      id: 'protein',
      name: 'Proteins',
      percentage:
        (total.protein /
          (total.calories + total.carbs + total.fat + total.protein)) *
        100,
      value: total.protein,
      unit: 'g',
      color: '#85E0A3',
    },
    {
      id: 'fat',
      name: 'Fat',
      percentage:
        (total.fat /
          (total.calories + total.carbs + total.fat + total.protein)) *
        100,
      value: total.fat,
      unit: 'g',
      color: '#80CAFF',
    },
  ];

  const [chartData, setChartData] = useState([]);
  const [chartUnit, setChartUnit] = useState('kcal');
  const [currentTab, setCurrentTab] = useState(1); // Default to Calories tab

  useEffect(() => {
    fetchDataForTab(currentTab, selectedOption).then((result: any) => {
      setChartData(result.data);
      setChartUnit(result.unit);
    });
  }, [currentTab, foods, selectedOption]); // Re-fetch when currentTab, foods, or selectedOption changes

  const handleTabChange = (newTabValue: any) => {
    setCurrentTab(newTabValue);
  };

  const handleOptionChange = (option: 'Total' | 'Average') => {
    setSelectedOption(option);
  };

  return (
    <View
      style={{
        borderRadius: 10,
        paddingVertical: verticalScale(10),
        gap: verticalScale(10),
      }}>
      <CustomLineChart
        data={chartData}
        unit={chartUnit}
        onTabChange={handleTabChange}
        onOptionChange={handleOptionChange}
        tabs={[
          {label: 'Calories', value: 1},
          {label: 'Fat', value: 2},
          {label: 'Protein', value: 3},
          {label: 'Carbs', value: 4},
        ]}
        initialTabValue={currentTab}
        setStoreMuscle={() => {}}
        storeMuscle={() => {}}
      />
      <MacronutrientChart data={macroData} />
    </View>
  );
};

export default NutritionTab;

const styles = StyleSheet.create({});
