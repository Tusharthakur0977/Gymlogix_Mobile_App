import React, { FC, RefObject, useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  FlatListProps,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ICONS from "../../../Assets/Icons";
import CustomIcon from "../../../Components/CustomIcon";
import { CustomText } from "../../../Components/CustomText";
import { setWorkoutData } from "../../../Redux/slices/newWorkoutSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/store";
import COLORS from "../../../Utilities/Colors";
import { horizontalScale, verticalScale, wp } from "../../../Utilities/Metrics";

// Define the AnimatedFlatList type with proper ref and props
interface AnimatedFlatListProps
  extends Animated.AnimatedProps<FlatListProps<number>> {
  ref?: RefObject<FlatList<number>>;
}

// Create animated version of FlatList with proper typing
const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList
) as React.ComponentType<AnimatedFlatListProps>;

const Step5: FC<{}> = () => {
  const dispatch = useAppDispatch();
  const { workoutData } = useAppSelector((state) => state.newWorkout);
  const durations: number[] = [8, 9, 10, 11, 12, 13];
  const flatListRef = useRef<FlatList<number>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const itemWidth = wp(20);
  const spacing = horizontalScale(20);
  const containerWidth = wp(65);

  const handleDurationPress = (duration: number) => {
    dispatch(
      setWorkoutData({
        ...workoutData,
        durationInWeeks: duration,
      })
    );
  };

  const renderItem = ({ item, index }: { item: number; index: number }) => {
    const inputRange = [
      (index - 1) * (itemWidth + spacing),
      index * (itemWidth + spacing),
      (index + 1) * (itemWidth + spacing),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1.1, 0.8], // Scale up the focused item
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        key={item.toString()}
        onPress={() => handleDurationPress(item)}
        style={[
          styles.durationItem,
          {
            width: itemWidth,
            transform: [{ scale: scale }],
            opacity: workoutData.durationInWeeks === item ? 1 : 0.6,
          },
        ]}
      >
        <CustomIcon
          Icon={ICONS.GreenCalendarIcon}
          height={verticalScale(48)}
          width={verticalScale(56)}
        />
        <CustomText
          color={COLORS.whiteTail}
          fontSize={14}
          fontFamily="bold"
          style={{ marginTop: verticalScale(10) }}
        >
          {item} Weeks
        </CustomText>
      </TouchableOpacity>
    );
  };

  // Scroll to the selected duration when the component mounts
  useEffect(() => {
    if (flatListRef.current && workoutData.durationInWeeks) {
      const selectedIndex = durations.indexOf(workoutData.durationInWeeks);
      if (selectedIndex !== -1) {
        const offset = selectedIndex * (itemWidth + spacing);
        flatListRef.current.scrollToOffset({
          offset,
          animated: true,
        });
      }
    }
  }, [workoutData.durationInWeeks]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-evenly",
        alignItems: "center",
        gap: verticalScale(20),
      }}
    >
      <View style={{ alignItems: "center", gap: verticalScale(10) }}>
        <CustomText color={COLORS.yellow} fontFamily="italicBold">
          Number of days in a week
        </CustomText>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: horizontalScale(80),
          }}
        >
          <TouchableOpacity
            onPress={() => {
              dispatch(
                setWorkoutData({
                  ...workoutData,
                  daysInWeek: Math.max(1, workoutData.daysInWeek - 1), // Ensure it doesn't go below 1
                })
              );
            }}
          >
            <CustomText
              fontSize={40}
              color={COLORS.whiteTail}
              fontFamily="bold"
              style={{ textAlign: "center" }}
            >
              -
            </CustomText>
          </TouchableOpacity>
          <CustomText
            fontSize={40}
            color={COLORS.whiteTail}
            fontFamily="bold"
            style={{ textAlign: "center" }}
          >
            {workoutData.daysInWeek}
          </CustomText>
          <TouchableOpacity
            onPress={() => {
              dispatch(
                setWorkoutData({
                  ...workoutData,
                  daysInWeek: Math.min(7, workoutData.daysInWeek + 1), // Ensure it doesn't go above 7
                })
              );
            }}
          >
            <CustomText
              fontSize={40}
              color={COLORS.whiteTail}
              fontFamily="bold"
              style={{ textAlign: "center" }}
            >
              +
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ alignItems: "center", gap: verticalScale(20) }}>
        <CustomText color={COLORS.yellow} fontFamily="italicBold">
          Duration of the program
        </CustomText>

        <View
          style={{
            width: containerWidth,
            alignItems: "center",
            borderTopColor: COLORS.whiteTail,
            borderTopWidth: 0.5,
            borderBottomColor: COLORS.whiteTail,
            borderBottomWidth: 0.5,
            paddingVertical: verticalScale(20),
          }}
        >
          <AnimatedFlatList
            ref={flatListRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={durations}
            renderItem={renderItem}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={{
              paddingHorizontal: (containerWidth - itemWidth) / 2, // Center the first item
            }}
            snapToInterval={itemWidth + spacing}
            decelerationRate="normal"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / (itemWidth + spacing));
              if (durations[index] !== workoutData.durationInWeeks) {
                dispatch(
                  setWorkoutData({
                    ...workoutData,
                    durationInWeeks: durations[index],
                  })
                );
              }
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default Step5;

const styles = StyleSheet.create({
  durationItem: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: verticalScale(20),
    marginHorizontal: horizontalScale(10),
    height: verticalScale(80),
  },
});
