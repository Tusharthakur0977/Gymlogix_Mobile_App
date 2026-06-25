import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import ICONS from '../../../Assets/Icons';
import CustomIcon from '../../../Components/CustomIcon';
import {CustomText} from '../../../Components/CustomText';
import {setWorkoutData} from '../../../Redux/slices/newWorkoutSlice';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import COLORS from '../../../Utilities/Colors';
import {verticalScale} from '../../../Utilities/Metrics';

const Step6: FC<{}> = () => {
  const dispatch = useAppDispatch();
  const {workoutData} = useAppSelector(state => state.newWorkout);

  // Function to map the rating to a difficulty level
  const getDifficultyLevel = (rating: number) => {
    if (rating <= 1) return 'Beginner';
    if (rating <= 2) return 'Intermediate';
    return 'Advanced';
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: verticalScale(20),
      }}>
      <CustomText color={COLORS.yellow} fontFamily="italicBold">
        Difficulty of your program
      </CustomText>
      <StarRating
        rating={workoutData.difficulty}
        onChange={rating => {
          const fixedRating = Math.round(rating);
          dispatch(
            setWorkoutData({
              ...workoutData,
              difficulty: fixedRating,
            }),
          );
        }}
        maxStars={3}
        starSize={53}
        color={COLORS.yellow}
        emptyColor={COLORS.whiteTail}
        enableHalfStar={true}
        StarIconComponent={({type, size}) => {
          const Icon =
            type === 'full' || type === 'half'
              ? ICONS.FilledStarIcon
              : ICONS.EmptyStarIcon;

          return <CustomIcon Icon={Icon} height={size} width={size} />;
        }}
      />
      <CustomText fontFamily="bold" color={COLORS.white}>
        {getDifficultyLevel(workoutData.difficulty)}
      </CustomText>
    </View>
  );
};

export default Step6;

const styles = StyleSheet.create({});
