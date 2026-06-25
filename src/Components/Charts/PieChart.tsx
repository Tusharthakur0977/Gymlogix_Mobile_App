import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {PieChart} from 'react-native-gifted-charts';
import COLORS from '../../Utilities/Colors'; // Adjust the import based on your project structure
import {horizontalScale, verticalScale, wp} from '../../Utilities/Metrics'; // Adjust the import based on your project structure
import {CustomText} from '../CustomText'; // Assuming you have this component

// Define the structure for each nutrient data point
export interface NutrientData {
  id: string; // e.g., 'carbs', 'protein', 'fat', 'calories' (if needed)
  name: string; // e.g., 'Carbs', 'Proteins', 'Fat', 'Calories'
  percentage: number; // Percentage value for the chart slice
  value: number; // Absolute value (e.g., grams or kcal)
  unit: string; // e.g., 'g', 'kcal'
  color: string; // Color for the chart slice and legend item
}

// Define the props for the MacronutrientChart component
interface MacronutrientChartProps {
  data: NutrientData[];
  radius?: number;
  innerRadius?: number;
  percentageTextSize?: number;
  percentageTextColor?: string;
}

const MacronutrientChart: FC<MacronutrientChartProps> = ({
  data = [], // Default to empty array
  radius = wp(35), // Default radius using screen percentage
  innerRadius = wp(18), // Default inner radius for donut shape
  percentageTextSize = 14,
  percentageTextColor = COLORS.black, // Default text color on slices
}) => {
  const pieChartData = data
    .filter(item => item.percentage > 0)
    .map(item => {
      const formatted = Number(item.percentage.toFixed(1)); // keep 1 decimal place
      return {
        value: formatted,
        text: `${formatted}%`,
        color: item.color,
        shiftTextX: item.percentage < 10 ? horizontalScale(-2) : 0,
      };
    });

  // Find the 'Calories' data for potential display, if included in data array
  const calorieData = data.find(item => item.id === 'calories');

  // Data for the legend/summary section (can include items not in the pie chart, like total calories)
  const legendData = data; // Use the full data for the legend

  return (
    <View style={styles.container}>
      <CustomText
        fontFamily="bold"
        fontSize={20}
        style={{
          marginBottom: verticalScale(10),
          textAlign: 'left',
          alignSelf: 'flex-start',
        }}>
        Daily average
      </CustomText>
      <View style={styles.chartContainer}>
        {pieChartData.length > 0 ? (
          <PieChart
            data={pieChartData}
            donut
            showText // Show percentage text on slices
            textColor={percentageTextColor}
            radius={radius}
            innerRadius={innerRadius}
            textSize={percentageTextSize}
            // Optional: Add a label in the center if needed
            centerLabelComponent={() => <View style={styles.centerLabel} />}
            gradientCenterColor="transparent"
          />
        ) : (
          <View
            style={[
              styles.chartPlaceholder,
              {height: radius * 2, width: radius * 2},
            ]}>
            <CustomText
              color={COLORS.whiteTail}
              style={{
                textAlign: 'center',
              }}>
              No data to display chart
            </CustomText>
          </View>
        )}
      </View>

      {/* Legend / Summary Section */}
      <View style={styles.legendContainer}>
        {legendData.map(item => (
          <View
            key={item.id}
            style={[styles.legendItem, {backgroundColor: item.color}]}>
            <CustomText
              style={styles.legendLabel}
              fontFamily="medium"
              fontSize={12}>
              {item.name}
            </CustomText>
            <CustomText
              style={styles.legendValue}
              fontFamily="bold"
              fontSize={14}>
              {item.value.toFixed(0)}
              {/* {` ${item.unit}`} // Optionally display unit here */}
            </CustomText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MacronutrientChart;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.brown || '#222', // Match the background from the image
    paddingVertical: verticalScale(20),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 15,
  },
  chartContainer: {
    marginBottom: verticalScale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lighterBrown || '#555', // Placeholder background
    borderRadius: wp(35), // Make it circular matching radius
  },
  centerLabel: {
    // Styles for the optional center label
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.brown,
    height: wp(36),
    width: wp(36),
    borderRadius: 100,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Distribute items evenly
    flexWrap: 'wrap', // Allow wrapping on smaller screens if needed
    width: '100%', // Take full width of container
    paddingHorizontal: horizontalScale(5),
  },
  legendItem: {
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(12),
    minWidth: horizontalScale(70), // Ensure minimum width for items
    margin: horizontalScale(5), // Add spacing between legend items
    // Add shadow or elevation for depth if desired
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  legendLabel: {
    color: COLORS.black, // Adjust text color for contrast on colored backgrounds
    marginBottom: verticalScale(2),
  },
  legendValue: {
    color: COLORS.black, // Adjust text color
  },
});
