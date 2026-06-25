import {useNavigation} from '@react-navigation/native';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Image,
  ImageBackground,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ICONS from '../../../Assets/Icons';
import CustomIcon from '../../../Components/CustomIcon';
import {CustomText} from '../../../Components/CustomText';
import PrimaryButton from '../../../Components/PrimaryButton';
import {setLogMealActiveIndex} from '../../../Redux/slices/initialSlice';
import {useAppDispatch, useAppSelector} from '../../../Redux/store';
import MealPlanData, {
  Ingredients,
  MealsONly,
} from '../../../Seeds/MealPlansData';
import COLORS from '../../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../../Utilities/Metrics';
import {removeQuickMeals} from '../../../Redux/slices/QuickMeals';
import {
  setIngredients,
  updateIngredientPercentage,
} from '../../../Redux/slices/macroSlice';

interface IngredientItemProps {
  item: any; // Define a more specific type for your ingredient item if available
  isSelected: boolean;
  onPress: (title: string) => void;
  onPercentageChange: (id: string, direction: 'increase' | 'decrease') => void;
  setScrollEnabled: (enabled: boolean) => void;
}

// Helper function to get the percentage display values
const getPercentageValues = (percentage?: number) => {
  const step = 10;
  const safePercentage = typeof percentage === 'number' ? percentage : 100; // default 100
  const currentDisplay = Math.round(safePercentage / step) * step;

  return {
    lower: Math.max(0, currentDisplay - step),
    current: currentDisplay,
    upper: Math.min(200, currentDisplay + step),
  };
};

const IngredientItem: FC<IngredientItemProps> = ({
  item,
  isSelected,
  onPress,
  onPercentageChange,
  setScrollEnabled,
}) => {
  const {lower, current, upper} = getPercentageValues(item.percentage);

  // PanResponder for swipe gestures on the percentage display itself
  const panResponder = useRef(
    PanResponder.create({
      // We want to become the responder if the user starts a move,
      // but primarily if it's a vertical swipe on the percentage display area.
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only activate if the gesture is primarily vertical and significant enough
        // and we are NOT just tapping (i.e., we are actually moving)
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 5
        );
      },
      onPanResponderGrant: () => {
        // Disable parent FlatList scroll when a swipe gesture starts on our percentage control
        setScrollEnabled(false);
      },
      onPanResponderMove: (evt, gestureState) => {
        // You can add visual feedback here if desired during the swipe
      },
      onPanResponderRelease: (evt, gestureState) => {
        const swipeThreshold = 20; // Pixels
        if (gestureState.dy < -swipeThreshold) {
          // Swiping up to increase
          onPercentageChange(item.id, 'increase');
        } else if (gestureState.dy > swipeThreshold) {
          // Swiping down to decrease
          onPercentageChange(item.id, 'decrease');
        }
        // Re-enable parent FlatList scroll when the swipe gesture ends
        setScrollEnabled(true);
      },
      onPanResponderTerminate: () => {
        // Re-enable in case of getSingleMeal?.description (e.g., call, notification)
        setScrollEnabled(true);
      },
      // EnsuregetSingleMeal?.coverImage?.uri become active
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // Crucial: Capture the touch if it's a potential vertical swipe *before* the FlatList gets it
        return getSingleMeal?.instructions(
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
            Math.abs(gestureState.dy) > 5,
        );
      },
    }),
  ).current;

  return (
    <TouchableOpacity
      onLongPress={() => onPress(item.title)}
      activeOpacity={0.7}
      style={[
        styles.ingredientItem,
        isSelected && styles.selectedIngredientItem,
      ]}>
      <Image
        source={{
          uri: item.image,
        }}
        style={styles.ingredientImage}
      />
      <View style={styles.ingredientDetails}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <CustomText color={COLORS.yellow} fontFamily="medium" fontSize={12}>
              {item.title}
            </CustomText>
            <CustomText color={COLORS.white} fontFamily="medium" fontSize={12}>
              {item.quantity}
            </CustomText>
          </View>
          <View style={styles.percentageControlHorizontal}>
            {/* Decrease Button (-) */}
            <TouchableOpacity
              onPress={() => onPercentageChange(item.id, 'decrease')}
              style={styles.percentageButton}>
              <CustomText style={styles.percentageButtonText}>-</CustomText>
            </TouchableOpacity>

            {/* Percentage Display */}
            <View style={styles.percentageDisplay}>
              {/* <CustomText fontSize={10} fontFamily="medium">
            {`${lower}%`}
          </CustomText> */}
              {/* <View style={styles.percentageSeparator} /> */}
              <CustomText fontSize={10} fontFamily="medium">
                {`${current}%`}
              </CustomText>
              {/* <View style={styles.percentageSeparator} /> */}
              {/* <CustomText fontSize={10} fontFamily="medium">
            {`${upper}%`}
          </CustomText> */}
            </View>

            {/* Increase Button (+) */}
            <TouchableOpacity
              onPress={() => onPercentageChange(item.id, 'increase')}
              style={styles.percentageButton}>
              <CustomText style={styles.percentageButtonText}>+</CustomText>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.caloriesContainer}>
          {['calories', 'fat', 'protein', 'carbs'].map(
            (_: string, index: number) => (
              <View style={styles.caloriesItem} key={index.toString()}>
                <CustomText fontSize={10} fontFamily="medium">
                  {_}
                </CustomText>
                <CustomText
                  fontSize={11}
                  fontFamily="medium"
                  style={styles.caloriesValue}
                  color={COLORS.whiteTail}>
                  {item.calories[index]}
                </CustomText>
              </View>
            ),
          )}
        </View>
      </View>

      {/* <Animated.View style={styles.percentageControl}>
        <TouchableOpacity
          onPress={() => onPercentageChange(item.id, "increase")}
        >
          <CustomIcon Icon={ICONS.ArrowUpIcon} height={20} width={20} />
        </TouchableOpacity>

        <View
          {...panResponder.panHandlers}
          style={{ alignItems: "center", gap: verticalScale(2) }}
        >
          <CustomText fontSize={10} fontFamily="medium">
            {`${lower}%`}
          </CustomText>
          <View
            style={{
              width: 20,
              height: 1,
              backgroundColor: COLORS.white,
            }}
          />
          <CustomText fontSize={10} fontFamily="medium">
            {`${current}%`}
          </CustomText>
          <View
            style={{
              width: 20,
              height: 1,
              backgroundColor: COLORS.white,
            }}
          />
          <CustomText fontSize={10} fontFamily="medium">
            {`${upper}%`}
          </CustomText>
        </View>
        <TouchableOpacity
          onPress={() => onPercentageChange(item.id, "decrease")}
        >
          <CustomIcon Icon={ICONS.ArrowDownIcon} height={20} width={20} />
        </TouchableOpacity>
      </Animated.View> */}
    </TouchableOpacity>
  );
};

const MealLogmenu = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {logMealActiveIndex} = useAppSelector(state => state.initial);
  const {planData} = useAppSelector(state => state.planData);
  const {myMealsList} = useAppSelector(state => state.myMeals);
  const {ingreidnetList} = useAppSelector(state => state.ingredients);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [ingredientsData, setIngredientsData] = useState([...Ingredients]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const {ingredients} = useAppSelector(state => state.macros);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const {meals} = useAppSelector(state => state.quickMeals);
  const {source} = useAppSelector(state => state.quickMeals);

  useEffect(() => {
    if (meals?.length > 0) {
      // meals should already have id, title, calories, etc.
      // add default percentage if missing
      const mappedMeals = meals.map(m => ({
        ...m,
        percentage: m.percentage ?? 100,
      }));
      dispatch(setIngredients(mappedMeals));
    }
  }, [meals, dispatch]);

  const handleIngredientPress = useCallback((title: string) => {
    setSelectedIngredients(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title],
    );
  }, []);

  // const handlePercentageChange = useCallback(
  //   (id: string, direction: 'increase' | 'decrease') => {
  //     setIngredientsData(prev =>
  //       prev.map(item => {
  //         if (String(item.id) === String(id)) {
  //           const currentPercentage =
  //             item.percentage !== undefined ? item.percentage : 100;
  //           const newPercentage =
  //             direction === 'increase'
  //               ? Math.min(200, currentPercentage + 10)
  //               : Math.max(0, currentPercentage - 10);
  //           return {...item, percentage: newPercentage};
  //         }
  //         return item;
  //       }),
  //     );
  //   },
  //   [],
  // );

  const handleDeleteSelected = () => {
    if (selectedIngredients.length === 0) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      dispatch(removeQuickMeals(selectedIngredients));
      setSelectedIngredients([]);
      fadeAnim.setValue(1);
    });
  };

  const handlePercentageChange = useCallback(
    (id: string, direction: 'increase' | 'decrease') => {
      dispatch(updateIngredientPercentage({id, direction}));
    },
    [dispatch],
  );

  const flatListRefs = Array.from({length: 3}).map(() =>
    useRef<FlatList>(null),
  );
  const mainFlatListRef = useRef<FlatList>(null); // Ref for main FlatList

  const topTabsData = [
    {
      label: 'By Plan',
      value: 1,
      onClick: () => dispatch(setLogMealActiveIndex(1)),
    },
    {
      label: 'By Meal',
      value: 2,
      onClick: () => dispatch(setLogMealActiveIndex(2)),
    },
    {
      label: 'Quick',
      value: 3,
      onClick: () => dispatch(setLogMealActiveIndex(3)),
    },
  ];

  const scrollToIndex = (sectionIndex: number, itemIndex: number) => {
    const flatListRef = flatListRefs[sectionIndex].current;

    if (
      flatListRef &&
      itemIndex >= 0 &&
      itemIndex < MealPlanData[sectionIndex].meals.length
    ) {
      flatListRef.scrollToIndex({index: itemIndex, animated: true});
    }
  };

  const renderTopTabs = () => {
    return (
      <View
        style={[
          styles.topTabsContainer,
          logMealActiveIndex === 3 && {
            borderBottomColor: COLORS.white,
            borderBottomWidth: 0.6,
            paddingBottom: verticalScale(10),
          },
        ]}>
        {topTabsData.map(tab => (
          <Pressable
            key={tab.value}
            style={[
              styles.tab,
              logMealActiveIndex === tab.value && styles.activeTab,
            ]}
            onPress={tab.onClick}>
            <CustomText
              fontSize={13}
              fontFamily="medium"
              color={COLORS.whiteTail}>
              {tab.label}
            </CustomText>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderNestedItem = ({item, index}: any) => {
    const isSelected = selectedPlan === item?.allData?.content?.plan_id;

    const calorieData = [
      {
        label: 'Carbs',
        value: item?.allData?.content.carbs_per_day || '-',
      },
      {
        label: 'Fat',
        value: item?.allData?.content.fats_per_day || '-',
      },
      {
        label: 'Protein',
        value: item?.allData?.content.protien_per_day || '-',
      },
      {
        label: 'Calories',
        value: item?.allData?.content.calories_per_day || '-',
      },
    ];

    return (
      <View
        style={{
          gap: verticalScale(10),
        }}>
        <Pressable
          style={[
            styles.nestedItem,
            {
              backgroundColor: isSelected ? COLORS.skinColor : COLORS.brown,
            },
          ]}
          onPress={() => {
            if (isSelected) {
              setSelectedPlan(null);
              setSelectedIndex(null);
            } else {
              setSelectedPlan(item?.allData?.content?.plan_id);
              setSelectedIndex(index); // Store the index of the clicked item
            }
          }}>
          <Image
            source={{uri: item.coverImage}}
            style={{height: 98, width: 148, borderRadius: 5}}
          />
          <View
            style={{
              flex: 1,
              padding: verticalScale(10),
              justifyContent: 'space-between',
            }}>
            <CustomText fontFamily="bold">{item.title}</CustomText>
            <View style={styles.tagContainer}>
              {calorieData.map((nutrient, idx) => (
                <CustomText
                  key={idx}
                  style={styles.tag}
                  fontFamily="italicBold"
                  fontSize={10}
                  color={COLORS.black}>
                  {` ${nutrient.value}`}
                </CustomText>
              ))}
            </View>
          </View>
        </Pressable>
        {isSelected && (
          <ScrollView
            style={{
              maxHeight: hp(30),
            }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}>
            {item?.allData?.content?.meals.map(
              (section: any, sectionIndex: number) => {
                const optionsLength = section?.options?.length ?? 0;

                // Find the actual meal data from myMealsList
                const actualMeal = myMealsList.find(
                  m => m.id === section.meal_id,
                );

                // If no matching meal found, skip
                if (!actualMeal) return null;
                return (
                  <View
                    key={sectionIndex.toString()}
                    style={styles.mealSectionContainer}>
                    <View style={styles.sectionHeader}>
                      <CustomText fontFamily="italicBold" fontSize={24}>
                        {section.filters?.[0] || `Meal ${sectionIndex + 1}`}
                      </CustomText>
                    </View>

                    <FlatList
                      ref={flatListRefs[sectionIndex]}
                      data={[actualMeal]}
                      keyExtractor={(mealItem, idx) =>
                        mealItem.id.toString() + idx
                      }
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      renderItem={({item: mealItem, index: idx}) => {
                        return (
                          <View style={styles.item}>
                            <View style={styles.mealItemContainer}>
                              <CustomIcon
                                Icon={ICONS.SlideleftArrowIcon}
                                height={20}
                                width={20}
                                onPress={() =>
                                  scrollToIndex(sectionIndex, index - 1)
                                }
                              />
                              <Pressable
                                onPress={() => {
                                  navigation.navigate('logMeal', {
                                    mealId: mealItem.id,
                                  });
                                }}>
                                <ImageBackground
                                  source={{
                                    uri: mealItem.coverImage?.uri,
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
                                        {mealItem.title}
                                      </CustomText>
                                    </View>
                                    <View style={styles.mealStatsContainer}>
                                      {Object.entries(mealItem.macros).map(
                                        ([key, val], idx2) => (
                                          <View
                                            key={idx2.toString()}
                                            style={styles.mealStatItem}>
                                            <CustomText
                                              fontSize={8}
                                              fontFamily="bold">
                                              {key}
                                            </CustomText>
                                            <CustomText
                                              fontSize={10}
                                              fontFamily="medium">
                                              {val}
                                            </CustomText>
                                          </View>
                                        ),
                                      )}
                                    </View>
                                  </View>
                                </ImageBackground>
                              </Pressable>
                              <CustomIcon
                                Icon={ICONS.SlideRightArrowIcon}
                                height={20}
                                width={20}
                                onPress={() => {
                                  if (index < optionsLength - 1) {
                                    scrollToIndex(sectionIndex, index + 1);
                                  }
                                }}
                              />
                            </View>
                            {sectionIndex < MealPlanData.length - 1 && (
                              <View style={styles.mealDivider} />
                            )}
                          </View>
                        );
                      }}
                    />
                  </View>
                );
              },
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderPlanList = () => {
    const isActivatedPlan = planData
      ?.filter(item => item.type === 'food')
      .map(item => item);

    return (
      <FlatList
        ref={mainFlatListRef}
        // data={MealPlanData}
        data={isActivatedPlan}
        renderItem={renderNestedItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{gap: verticalScale(15)}}
      />
    );
  };

  const renderMealList = () => {
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <FlatList
          data={myMealsList}
          renderItem={({item}) => (
            <Pressable
              onPress={() => {
                navigation.navigate('logMeal', {
                  mealId: item.id,
                });
              }}>
              <ImageBackground
                source={{
                  uri: item.coverImage?.uri,
                }}
                style={{height: hp(25), width: wp(85)}}
                imageStyle={{
                  height: hp(25),
                  width: wp(85),
                  borderRadius: 10,
                }}>
                <View style={styles.mealImageContent}>
                  <View style={styles.mealTitleContainer}>
                    <CustomText
                      fontSize={22}
                      fontFamily="bold"
                      style={styles.mealTitle}>
                      {item.title}
                    </CustomText>
                  </View>
                  <View style={styles.mealStatsContainer}>
                    {Object.entries(item.macros).map(([key, val], index) => (
                      <View key={index} style={styles.mealStatItem}>
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
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{gap: verticalScale(20)}}
        />
      </View>
    );
  };

  const renderQuickTab = () => {
    return (
      <View
        style={{
          flex: 1,
        }}>
        <FlatList
          data={meals}
          contentContainerStyle={{
            gap: verticalScale(10),
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <IngredientItem
              item={item}
              isSelected={selectedIngredients.includes(item.title)}
              onPress={handleIngredientPress}
              onPercentageChange={handlePercentageChange}
              setScrollEnabled={setIsScrollEnabled}
            />
          )}
          scrollEnabled={isScrollEnabled}
          keyExtractor={item => item.id.toString()}
          ListFooterComponent={() => (
            <PrimaryButton
              onPress={() => {
                navigation.navigate('ingredientList', {
                  isFrom: 'addNewMeal',
                });
              }}
              isFullWidth={false}
              style={styles.addIngredientsButton}
              textSize={10}
              title="Add ingredients"
            />
          )}
          ListEmptyComponent={
            <View style={styles.listEmptyContainer}>
              <CustomText>Add new Ingredients to your meal</CustomText>
            </View>
          }
        />
        <View style={{alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: COLORS.brown,
              width: wp(100),
              paddingVertical: verticalScale(10),
            }}>
            <PrimaryButton title="Log Meal" onPress={() => {}} />
            <PrimaryButton
              title="Save Meal"
              onPress={() => {}}
              style={{backgroundColor: 'transparent'}}
            />
          </View>
        </View>
      </View>
      // <View style={{flex: 1, gap: verticalScale(10)}}>
      //   <View style={{flex: 1}}>
      //     <View
      //       style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      //       <CustomText>Add new Ingredients to your meal</CustomText>
      //     </View>
      //     <PrimaryButton
      //       onPress={() => {
      //         navigation.navigate('ingredientList', {
      //           isFrom: 'addNewMeal',
      //         });
      //       }}
      //       isFullWidth={false}
      //       style={styles.addIngredientsButton}
      //       textSize={10}
      //       title="Add ingredients"
      //     />
      //   </View>
      //   <View
      //     style={{
      //       backgroundColor: COLORS.brown,
      //       width: wp(100),
      //       paddingVertical: verticalScale(10),
      //     }}>
      //     <PrimaryButton title="Log Meal" onPress={() => {}} />
      //     <PrimaryButton
      //       title="Save Meal"
      //       onPress={() => {}}
      //       style={{backgroundColor: 'transparent'}}
      //     />
      //   </View>
      // </View>
    );
  };

  const renderView = () => {
    switch (logMealActiveIndex) {
      case 1:
        return renderPlanList();
      case 2:
        return renderMealList();
      case 3:
        return renderQuickTab();
    }
  };

  // Effect to scroll to the clicked item or the next item when an item is expanded
  useEffect(() => {
    if (selectedPlan && mainFlatListRef.current && selectedIndex !== null) {
      const targetIndex = Math.min(selectedIndex, MealPlanData.length - 1); // Scroll to the next item, or the last item if there is no next item
      mainFlatListRef.current.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0,
      });
    }
  }, [selectedPlan, selectedIndex]);

  return (
    <View style={styles.main}>
      {selectedIngredients.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            // borderBottomColor: COLORS.white,
            // borderBottomWidth: 1,
            width: wp(100),
            paddingBottom: verticalScale(10),
            paddingHorizontal: horizontalScale(10),
          }}>
          {selectedIngredients.length > 0 && (
            <View style={{flexDirection: 'row', gap: horizontalScale(10)}}>
              <TouchableOpacity
                onPress={handleDeleteSelected}
                style={styles.actionButton}>
                <CustomIcon Icon={ICONS.DeleteIcon} height={15} width={15} />
                <CustomText fontSize={7}>Delete</CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <CustomIcon Icon={ICONS.CopyIcon} height={15} width={15} />
                <CustomText fontSize={7}>Copy</CustomText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      {renderTopTabs()}
      {renderView()}
    </View>
  );
};

export default MealLogmenu;

const styles = StyleSheet.create({
  main: {
    paddingHorizontal: horizontalScale(10),
    flex: 1,
    gap: verticalScale(20),
  },
  topTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  tab: {
    paddingVertical: verticalScale(8),
    borderRadius: 10,
    width: wp(30),
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.yellow,
  },
  nestedItem: {
    flexDirection: 'row',
    gap: horizontalScale(10),
    borderRadius: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
  },
  tag: {
    backgroundColor: COLORS.whiteGreenish,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(8),
    borderRadius: 5,
  },
  mealItem: {
    padding: verticalScale(10),
    backgroundColor: COLORS.darkBrown,
    borderRadius: 10,
    marginTop: verticalScale(5),
  },
  mealOption: {
    padding: verticalScale(5),
    marginRight: horizontalScale(10),
    backgroundColor: COLORS.lightBrown,
    borderRadius: 5,
    alignItems: 'center',
  },

  mealsListContainer: {
    width: '100%',
  },
  mealSectionContainer: {
    marginBottom: verticalScale(0),
  },
  sectionHeader: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(8),
  },
  item: {
    width: wp(95),
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
    width: wp(75),
  },
  mealImageStyle: {
    height: hp(20),
    width: wp(75),
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
    paddingVertical: verticalScale(2),
    paddingHorizontal: horizontalScale(7),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4C3F3A',
    gap: verticalScale(5),
  },
  mealDivider: {
    height: verticalScale(20),
    width: 2,
    backgroundColor: COLORS.whiteTail,
  },
  addIngredientsButton: {
    width: 'auto',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(12),
    borderRadius: verticalScale(10),
    alignSelf: 'flex-end',
    marginBottom: verticalScale(10),
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: verticalScale(10),
    borderColor: COLORS.whiteTail,
    backgroundColor: COLORS.lightBrown,
    // width: wp(95),
  },
  selectedIngredientItem: {
    backgroundColor: COLORS.skinColor,
  },
  ingredientImage: {
    height: '100%',
    width: wp(22),
    borderRadius: 10,
    resizeMode: 'cover',
  },
  ingredientDetails: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    justifyContent: 'space-between',
    flex: 1,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: horizontalScale(10),
  },
  caloriesItem: {
    alignItems: 'center',
    minWidth: horizontalScale(30),
  },
  caloriesValue: {
    backgroundColor: COLORS.brown,
    paddingVertical: verticalScale(2),
    paddingHorizontal: horizontalScale(4),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.brown,
    width: '100%',
    textAlign: 'center',
  },
  actionButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.whiteTail,
    borderRadius: 100,
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  // addIngredientsButton: {
  //   width: 'auto',
  //   paddingVertical: verticalScale(8),
  //   paddingHorizontal: horizontalScale(12),
  //   borderRadius: verticalScale(5),
  // },
  percentageControlHorizontal: {
    flexDirection: 'row', // Arrange items horizontally
    alignItems: 'center',
    justifyContent: 'space-around', // Distribute space
    paddingHorizontal: horizontalScale(5),
    minWidth: horizontalScale(100), // Adjust width as needed
  },
  percentageButton: {
    backgroundColor: COLORS.brown, // Or any color you prefer for the buttons
    borderRadius: 5,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  percentageDisplay: {
    alignItems: 'center',
    gap: verticalScale(2),
    marginHorizontal: horizontalScale(5), // Space between buttons and display
  },

  listEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(15),
  },
});
