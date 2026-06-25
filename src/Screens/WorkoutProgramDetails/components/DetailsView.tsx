import {ScrollView, StyleSheet, View} from 'react-native';
import React, {FC} from 'react';
import CustomIcon from '../../../Components/CustomIcon';
import ICONS from '../../../Assets/Icons';
import {CustomText} from '../../../Components/CustomText';
import {horizontalScale, verticalScale} from '../../../Utilities/Metrics';
type DetailData = {
  data: any;
};

const DetailsView: FC<DetailData> = ({data}) => {
  const renderLevelWithStars = () => {
    const level: string = getContent?.allData.content.difficulty.toString();
    const isFilled =
      level === 'beginners' || level === 'beginners'
        ? 1
        : level === 'intermediate'
        ? 2
        : level === 'advance'
        ? 3
        : 0;

    return (
      <View style={styles.levelContainer}>
        <View style={styles.starContainer}>
          {Array.from({length: 3}).map((_, index) => (
            <CustomIcon
              key={index}
              Icon={
                index < isFilled ? ICONS.FilledStarIcon : ICONS.EmptyStarIcon
              }
              height={53}
              width={53}
            />
          ))}
        </View>
        <CustomText fontFamily="bold">
          {getContent?.allData.content.difficulty}
        </CustomText>
      </View>
    );
  };

  const getContent = data;

  return (
    <ScrollView style={styles.detailsContainer}>
      <View style={styles.detailsStatsContainer}>
        <View style={styles.statItem}>
          <CustomIcon Icon={ICONS.EnduranceIcon} height={48} width={48} />
          <CustomText fontSize={14} fontFamily="bold">
            {getContent?.type}
          </CustomText>
        </View>
        <View style={styles.statItem}>
          <CustomIcon Icon={ICONS.GreenCalendarIcon} height={48} width={48} />
          <CustomText fontSize={14} fontFamily="bold">
            {`${getContent?.allData.content.duration} Weeks`}
          </CustomText>
        </View>
        <View style={styles.statItem}>
          <CustomIcon Icon={ICONS.barbellIcon} height={48} width={48} />
          <CustomText fontSize={14} fontFamily="bold">
            {getContent?.allData.content.location}
          </CustomText>
        </View>
        <View style={styles.statItem}>
          <CustomText fontSize={30} fontFamily="bold">
            {getContent?.allData.content.days_per_week}
          </CustomText>
          <CustomText fontSize={14} fontFamily="bold">
            Days
          </CustomText>
        </View>
      </View>

      {renderLevelWithStars()}
      <CustomText fontSize={22} fontFamily="extraBold">
        Details
      </CustomText>
      <CustomText fontSize={14} style={styles.detailsText}>
        {getContent?.allData.content.details}
        {'\n'}
        {'\n'}
      </CustomText>
      <CustomText fontSize={22} fontFamily="extraBold">
        Instructions
      </CustomText>
      <CustomText fontSize={14} style={styles.detailsText}>
        {getContent?.allData.content.instructions}
      </CustomText>
    </ScrollView>
  );
};

export default DetailsView;

const styles = StyleSheet.create({
  detailsContainer: {
    paddingHorizontal: horizontalScale(10),
    gap: verticalScale(10),
  },
  detailsStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: verticalScale(20),
    minHeight: verticalScale(85),
    maxHeight: verticalScale(85),
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelContainer: {
    gap: verticalScale(20),
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    justifyContent: 'center',
  },
  detailsText: {
    lineHeight: 22,
  },
});
