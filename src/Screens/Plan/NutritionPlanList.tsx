import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import {CustomText} from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  setActiveNutritionprogramIndex,
  setCurrentprogramId,
  setCurrentProgramList,
} from '../../Redux/slices/initialSlice';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import NutritionProgramData, {
  NutritionPlanItem,
} from '../../Seeds/NutritionPrograms';
import {myMealsList, MyMealsListItem} from '../../Seeds/Plans';
import {BottomTabParams, MainStackParams} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics';
import NutritionProgramDetails from './NutritionProgramDetails';

export type NutritionPlansListProps = {
  navigation: NativeStackNavigationProp<
    MainStackParams & BottomTabParams,
    'PLAN',
    undefined
  >;
};

const NutritionPlanList: FC<NutritionPlansListProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {activeNutritionprogramIndex, currentProgramList} = useAppSelector(
    state => state.initial,
  );
  const {myMealsList} = useAppSelector(state => state.myMeals);

  const {planData} = useAppSelector(state => state.planData);

  const renderBanner = () => {
    return (
      <Pressable
        onPress={() => {
          navigation.navigate('mealDetails', {
            mealId: myMealsList[0]?.id,
            isFromMyMeal: false,
          });
        }}>
        <ImageBackground
          source={{
            uri: myMealsList[0]?.coverImage?.uri,
          }}
          style={styles.bannerImage}
          imageStyle={styles.bannerImageStyle}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', '#1F1A16']}
            style={styles.gradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}>
            <View style={styles.bannerContent}>
              <CustomText
                fontSize={12}
                fontFamily="light"
                color={COLORS.whiteTail}
                style={styles.recipeTag}>
                Recipe of the day
              </CustomText>
              <CustomText
                fontSize={24}
                fontFamily="bold"
                style={styles.bannerTitle}>
                {myMealsList[0]?.title}
              </CustomText>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Pressable>
    );
  };

  const renderBulkingPrograms = (data: []) => {
    const itemsRender =
      activeNutritionprogramIndex === 0
        ? planData?.filter(item => item.type === 'food').slice(0, 6)
        : data;
    return (
      <View style={styles.sectionContainer}>
        <FlatList
          data={itemsRender}
          numColumns={3}
          contentContainerStyle={styles.bulkingProgramsList}
          columnWrapperStyle={styles.bulkingProgramsColumn}
          renderItem={({item, index}) => {
            return (
              <Pressable
                onPress={() => {
                  dispatch(setCurrentprogramId(item.allData?.plan_id!));
                  dispatch(setActiveNutritionprogramIndex(2));
                }}
                style={styles.bulkingProgramItem}>
                <ImageBackground
                  key={item.id + index.toString()}
                  source={{
                    uri: item.coverImage,
                  }}
                  style={styles.bulkingProgramImage}
                  imageStyle={styles.bulkingProgramImageStyle}
                />
              </Pressable>
            );
          }}
        />
        <PrimaryButton
          isFullWidth
          title="See All"
          onPress={() => {
            dispatch(setActiveNutritionprogramIndex(1));
            dispatch(
              setCurrentProgramList({
                title: 'Bulking programs',
                data: planData?.filter(item => item.type === 'food'),
              }),
            );
          }}
          backgroundColor={COLORS.lightBrown}
          style={styles.seeAllButton}
        />
      </View>
    );
  };

  const renderBulkingMealIdeas = () => {
    return (
      <FlatList
        data={myMealsList}
        horizontal
        renderItem={({item}) => {
          return (
            <Pressable
              onPress={() => {
                navigation.navigate('mealDetails', {
                  mealId: item.id,
                  isFromMyMeal: false,
                });
              }}
              style={styles.mealIdeaItem}>
              <Image
                source={{uri: item.coverImage?.uri}}
                style={styles.mealIdeaImage}
              />
              <CustomText fontFamily="semiBold" style={styles.mealIdeaTitle}>
                {item.title}
              </CustomText>
            </Pressable>
          );
        }}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.mealIdeasList}
      />
    );
  };

  const renderFullWidthPrograms = (data: []) => {
    const itemsRender =
      activeNutritionprogramIndex === 0
        ? planData?.filter(item => item.type === 'food')
        : data;
    return (
      <View style={styles.sectionContainer}>
        {itemsRender &&
          itemsRender.map((item, index) => (
            <Pressable
              key={item.id.toString()}
              onPress={() => {
                dispatch(setActiveNutritionprogramIndex(2));
                dispatch(setCurrentprogramId(item.allData?.plan_id!));
              }}>
              <ImageBackground
                key={item.id + index.toString()}
                source={{
                  uri: item.coverImage,
                }}
                style={styles.fullWidthProgramImage}>
                <View style={styles.fullWidthIMageContainer}>
                  <CustomText fontFamily="bold">{item?.title}</CustomText>
                  <View style={styles.tagContainer}>
                    {item?.tags?.map((tag, index) => (
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
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        {activeNutritionprogramIndex === 0 && (
          <PrimaryButton
            isFullWidth
            title="See All"
            onPress={() => {
              dispatch(setActiveNutritionprogramIndex(1));
              dispatch(
                setCurrentProgramList({
                  title: 'Lose Weight programs',
                  data: planData?.filter(item => item.type === 'food'),
                }),
              );
            }}
            backgroundColor={COLORS.lightBrown}
            style={styles.seeAllButton}
          />
        )}
      </View>
    );
  };

  const renderMainView = () => {
    switch (activeNutritionprogramIndex) {
      case 0:
        return (
          <ScrollView
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollViewContent}
            style={styles.scrollView}>
            <View style={styles.mainViewContainer}>
              {renderBanner()}
              <CustomText
                fontSize={22}
                fontFamily="extraBold"
                style={styles.sectionTitle}>
                Bulking Programs
              </CustomText>
              {renderBulkingPrograms()}
              <CustomText
                fontSize={22}
                fontFamily="extraBold"
                style={styles.sectionTitle}>
                Bulking Meal Ideas
              </CustomText>
              {renderBulkingMealIdeas()}
              <CustomText
                fontSize={22}
                fontFamily="extraBold"
                style={styles.sectionTitle}>
                Lose Weight Programs
              </CustomText>
              {renderFullWidthPrograms(NutritionProgramData.slice(0, 3))}
            </View>
          </ScrollView>
        );
      case 1:
        return (
          <ScrollView
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollViewContent}
            style={styles.scrollView}>
            <View style={styles.fullWidthView}>
              <View style={styles.headerContainer}>
                <TouchableOpacity
                  onPress={() => {
                    dispatch(setActiveNutritionprogramIndex(0));
                  }}>
                  <CustomIcon Icon={ICONS.BackArrow} />
                </TouchableOpacity>
                <CustomText
                  fontSize={22}
                  fontFamily="extraBold"
                  style={styles.headerTitle}>
                  {currentProgramList.title}
                </CustomText>
              </View>
              {renderFullWidthPrograms(currentProgramList.data)}
            </View>
          </ScrollView>
        );
      case 2:
        return (
          <NutritionProgramDetails
            onPressBack={() => dispatch(setActiveNutritionprogramIndex(0))}
          />
        );
      default:
        return null;
    }
  };

  return renderMainView();
};

export default NutritionPlanList;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    gap: verticalScale(30),
    paddingBottom: verticalScale(20),
    backgroundColor: COLORS.darkBrown,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
    marginTop: 5,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.whiteGreenish,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 5,
  },
  bannerImage: {
    height: hp(35),
    justifyContent: 'flex-end',
  },
  bannerImageStyle: {
    borderRadius: 10,
    resizeMode: 'cover',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    gap: verticalScale(10),
    paddingBottom: verticalScale(10),
    paddingHorizontal: verticalScale(10),
  },
  recipeTag: {
    paddingVertical: verticalScale(5),
    paddingHorizontal: verticalScale(10),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
  },
  bannerTitle: {
    width: '85%',
  },
  sectionContainer: {
    gap: verticalScale(15),
    paddingHorizontal: horizontalScale(10),
  },
  bulkingProgramsList: {
    rowGap: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
  },
  bulkingProgramsColumn: {
    gap: horizontalScale(10),
  },
  bulkingProgramItem: {
    flex: 1,
  },
  bulkingProgramImage: {
    borderRadius: 10,
    flex: 1,
    height: hp(12),
    width: '100%',
  },
  bulkingProgramImageStyle: {
    resizeMode: 'cover',
    borderRadius: 10,
  },
  seeAllButton: {
    borderRadius: 100,
  },
  mealIdeasList: {
    paddingBottom: verticalScale(20),
    gap: verticalScale(15),
    paddingHorizontal: horizontalScale(10),
  },
  mealIdeaItem: {
    width: wp(35),
    gap: verticalScale(10),
  },
  mealIdeaImage: {
    height: hp(20),
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  mealIdeaTitle: {
    flex: 1,
  },
  fullWidthProgramImage: {
    height: hp(25),
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  mainViewContainer: {
    gap: verticalScale(30),
  },
  fullWidthView: {
    paddingVertical: verticalScale(10),
    gap: verticalScale(20),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(10),
  },
  sectionTitle: {
    paddingHorizontal: horizontalScale(10),
  },
  headerTitle: {
    paddingHorizontal: horizontalScale(10),
  },
  fullWidthIMageContainer: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
  },
});
