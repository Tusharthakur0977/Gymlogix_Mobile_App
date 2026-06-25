import {useNavigation} from '@react-navigation/native';
import React, {FC, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import {useAppSelector} from '../../Redux/store';
import NutritionProgramData, {
  NutritionPlanItem,
} from '../../Seeds/NutritionPrograms';
import bulkingPrograms, {
  ActivePlanListItem,
  myMealsList,
} from '../../Seeds/Plans';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics';

type NutritionProgramDetailsProps = {
  onPressBack: () => void;
};

const NutritionProgramDetails: FC<NutritionProgramDetailsProps> = ({
  onPressBack,
}) => {
  const navigation = useNavigation<any>();
  const {currentProgramId} = useAppSelector(state => state.initial);
  const {myMealsList} = useAppSelector(state => state.myMeals);
  const {planData} = useAppSelector(state => state.planData);

  const filteredMeals =
    myMealsList?.filter(meal => meal.userId === currentProgramId) || [];

  const DATA = [
    {
      title: 'Meal 1',
      data: filteredMeals.slice(0, 3),
    },
    {
      title: 'Meal 2',
      data: filteredMeals.slice(3, 6),
    },
    {
      title: 'Meal 3',
      data: filteredMeals.slice(6, 9),
    },
    // {
    //   title: 'Meal 4',
    //   data: filteredMeals.slice(9, 12),
    // },
  ];

  const flatListRefs = DATA.map(() => useRef<FlatList>(null));
  const [currentProgramDetails, setCurrentProgramDetails] = useState<
    null | ActivePlanListItem[]
  >(null);
  const [activeProgramTab, setActiveProgramTab] = useState<'Meals' | 'Details'>(
    'Meals',
  );

  const TabOptions: Array<'Meals' | 'Details'> = ['Meals', 'Details'];

  const scrollToIndex = (sectionIndex: number, itemIndex: number) => {
    const flatListRef = flatListRefs[sectionIndex].current;

    if (
      flatListRef &&
      itemIndex >= 0 &&
      itemIndex < DATA[sectionIndex].data.length
    ) {
      flatListRef.scrollToIndex({index: itemIndex, animated: true});
    }
  };

  const renderCaloriesList = () => {
    const calorieData = [
      {
        label: 'Meals / Day',
        value: currentProgramDetails?.allData?.content.meals_per_day,
      },
      {
        label: 'Carbs',
        value: currentProgramDetails?.allData?.content.carbs_per_day,
      },
      {
        label: 'Fat',
        value: currentProgramDetails?.allData?.content.fats_per_day,
      },
      {
        label: 'Protein',
        value: currentProgramDetails?.allData?.content.protien_per_day,
      },
      {
        label: 'Calories',
        value: currentProgramDetails?.allData?.content.calories_per_day,
      },
    ];
    return (
      <View style={styles.caloriesContainer}>
        {calorieData.map((item, index) => (
          <View style={styles.caloriesItem} key={index.toString()}>
            <CustomText fontSize={10} fontFamily="medium">
              {item.label}
            </CustomText>
            <CustomText
              fontSize={12}
              fontFamily="medium"
              style={styles.caloriesValue}>
              {item.value ?? '-'}
            </CustomText>
          </View>
        ))}
      </View>
    );
  };

  const renderMealsList = () => {
    return (
      <ScrollView
        style={styles.mealsListContainer}
        contentContainerStyle={{
          paddingBottom: verticalScale(10),
        }}>
        {DATA.map((section, sectionIndex) => (
          <View
            key={sectionIndex.toString()}
            style={styles.mealSectionContainer}>
            <View style={styles.sectionHeader}>
              <CustomText fontFamily="italicBold" fontSize={24}>
                {section?.title}
              </CustomText>
            </View>

            <FlatList
              ref={flatListRefs[sectionIndex]}
              data={section.data}
              keyExtractor={(item, index) => item + index}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({item, index}) => {
                return (
                  <View style={styles.item}>
                    <View style={styles.mealItemContainer}>
                      <CustomIcon
                        Icon={ICONS.SlideleftArrowIcon}
                        height={20}
                        width={20}
                        onPress={() => scrollToIndex(sectionIndex, index - 1)}
                      />
                      <Pressable
                        onPress={() => {
                          navigation.navigate('mealDetails', {
                            mealId: item.id,
                            isFromMyMeal: false,
                          });
                        }}>
                        <ImageBackground
                          source={{
                            uri: item.coverImage.uri,
                          }}
                          style={styles.mealImage}
                          imageStyle={styles.mealImageStyle}>
                          <View style={styles.mealImageContent}>
                            <View style={styles.mealTitleContainer}>
                              <View style={styles.mealIndicator} />
                              <CustomText
                                fontSize={24}
                                fontFamily="bold"
                                style={styles.mealTitle}>
                                {item?.title}
                              </CustomText>
                            </View>
                            <View style={styles.mealStatsContainer}>
                              {Object.entries(item.macros).map(([key, val]) => (
                                <View
                                  key={index.toString()}
                                  style={styles.mealStatItem}>
                                  <CustomText fontSize={10} fontFamily="bold">
                                    {key}
                                  </CustomText>
                                  <CustomText fontSize={12} fontFamily="medium">
                                    {val}
                                  </CustomText>
                                </View>
                              ))}
                            </View>
                          </View>
                        </ImageBackground>
                      </Pressable>
                      <CustomIcon
                        Icon={ICONS.SlideRightArrowIcon}
                        height={20}
                        width={20}
                        onPress={() => scrollToIndex(sectionIndex, index + 1)}
                      />
                    </View>
                    {sectionIndex < DATA.length - 1 && (
                      <View style={styles.mealDivider} />
                    )}
                  </View>
                );
              }}
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  useEffect(() => {
    const foundProgram = planData?.find(
      item => item.allData?.plan_id === currentProgramId,
    );
    setCurrentProgramDetails(foundProgram ?? null);
  }, [currentProgramId]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: currentProgramDetails?.coverImage,
        }}
        style={styles.coverImage}
        imageStyle={styles.coverImageStyle}>
        <LinearGradient
          colors={['rgba(0,0,0,0)', '#1F1A16']}
          style={styles.gradient}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}>
          <View style={styles.headerContainer}>
            <CustomIcon onPress={onPressBack} Icon={ICONS.BackArrow} />
            <View style={styles.headerTextContainer}>
              <View style={styles.tagContainer}>
                {currentProgramDetails?.tags.map((tag, index) => (
                  <CustomText
                    key={index}
                    style={styles.tag}
                    fontFamily="italicBold"
                    fontSize={12}
                    color={COLORS.black}>
                    {tag}
                  </CustomText>
                ))}
              </View>
              <CustomText fontFamily="bold">
                {currentProgramDetails?.[0]?.title}
              </CustomText>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.tabContainer}>
        {TabOptions.map((tab: 'Details' | 'Meals', index: number) => {
          const isSelected = activeProgramTab === tab;
          return (
            <Pressable
              key={index}
              onPress={() => setActiveProgramTab(tab)}
              style={[
                styles.tabButton,
                {backgroundColor: isSelected ? COLORS.yellow : 'transparent'},
              ]}>
              <CustomText>{tab}</CustomText>
            </Pressable>
          );
        })}
      </View>

      {activeProgramTab === 'Meals' && (
        <View style={styles.mealsTabContainer}>
          {renderCaloriesList()}
          {renderMealsList()}
        </View>
      )}

      {activeProgramTab === 'Details' && (
        <ScrollView contentContainerStyle={styles.detailsContainer}>
          <CustomText fontSize={22} fontFamily="extraBold">
            Details
          </CustomText>
          <CustomText fontSize={14} style={styles.detailsText}>
            {currentProgramDetails?.allData?.content.description ||
              `Juicy, tender salmon fillet seasoned with a zesty lemon-herb marinade, grilled to perfection. Served on a bed of fluffy quinoa mixed with fresh cherry tomatoes, crisp cucumbers, chopped parsley, and a drizzle of olive oil. Accompanied by a side of roasted asparagus for a light, healthy, and flavorful meal. Perfect for a refreshing post-workout dinner or a wholesome lunch!`}
          </CustomText>
          <CustomText
            fontSize={22}
            fontFamily="extraBold"
            style={styles.sectionTitle}>
            Instructions
          </CustomText>
          <CustomText fontSize={14} style={styles.detailsText}>
            {currentProgramDetails?.allData?.content.description ||
              `Juicy, tender salmon fillet seasoned with a zesty lemon-herb marinade, grilled to perfection. Served on a bed of fluffy quinoa mixed with fresh cherry tomatoes, crisp cucumbers, chopped parsley, and a drizzle of olive oil. Accompanied by a side of roasted asparagus for a light, healthy, and flavorful meal. Perfect for a refreshing post-workout dinner or a wholesome lunch!`}
          </CustomText>
          <CustomText
            fontSize={22}
            fontFamily="extraBold"
            style={styles.sectionTitle}>
            Related Training plans
          </CustomText>
          <Pressable style={styles.trainingPlanContainer}>
            <Image
              source={{uri: bulkingPrograms[6].image}}
              style={styles.trainingPlanImage}
            />
            <View style={styles.trainingPlanTextContainer}>
              <CustomText fontFamily="bold">Training Plan</CustomText>
              <CustomText fontFamily="italic">Name of training Plan</CustomText>
            </View>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
};

export default NutritionProgramDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBrown,
  },
  coverImage: {
    height: hp(20),
    justifyContent: 'flex-end',
  },
  coverImageStyle: {
    borderRadius: 10,
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: verticalScale(10),
    paddingVertical: verticalScale(20),
    paddingHorizontal: verticalScale(10),
  },
  headerTextContainer: {
    gap: verticalScale(5),
  },
  tagContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
    marginTop: 5,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(30),
    marginVertical: verticalScale(20),
  },
  tabButton: {
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(30),
    paddingVertical: verticalScale(10),
    borderRadius: 10,
  },
  mealsTabContainer: {
    alignItems: 'center',
    gap: verticalScale(20),
    flex: 1,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(10),
    borderBottomColor: COLORS.whiteTail,
    borderBottomWidth: 1,
    width: '90%',
    paddingVertical: verticalScale(10),
  },
  caloriesItem: {
    alignItems: 'center',
  },
  caloriesValue: {
    backgroundColor: COLORS.lighterBrown,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.brown,
  },
  mealsListContainer: {
    width: '100%',
  },
  mealSectionContainer: {
    marginBottom: verticalScale(0),
  },
  sectionHeader: {
    width: '100%',
    backgroundColor: COLORS.brown,
    alignItems: 'center',
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(8),
  },
  item: {
    width: wp(100),
    alignItems: 'center',
    gap: verticalScale(10),
  },
  mealItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: horizontalScale(10),
  },
  mealImage: {
    height: hp(20),
    width: wp(85),
  },
  mealImageStyle: {
    height: hp(20),
    width: wp(85),
    borderRadius: 10,
  },
  mealImageContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: horizontalScale(5),
  },
  mealIndicator: {
    height: 10,
    width: 10,
    backgroundColor: 'red',
    borderRadius: 100,
    top: 10,
  },
  mealTitle: {
    flex: 1,
  },
  mealStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(10),
  },
  mealStatItem: {
    alignItems: 'center',
    backgroundColor: COLORS.brown,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.brown,
    gap: verticalScale(5),
  },
  mealDivider: {
    height: verticalScale(20),
    width: 2,
    backgroundColor: COLORS.whiteTail,
  },
  detailsContainer: {
    paddingHorizontal: horizontalScale(10),
    gap: verticalScale(10),
    paddingBottom: verticalScale(10),
  },
  detailsText: {
    lineHeight: 22,
  },
  sectionTitle: {
    marginTop: verticalScale(10),
  },
  trainingPlanContainer: {
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 10,
    gap: horizontalScale(20),
    backgroundColor: COLORS.brown,
  },
  trainingPlanImage: {
    height: hp(12),
    width: wp(40),
  },
  trainingPlanTextContainer: {
    paddingVertical: verticalScale(10),
    gap: verticalScale(15),
    flex: 1,
  },
});
