import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {FC, useState} from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {CustomText} from '../../Components/CustomText';
import {useAppSelector} from '../../Redux/store';
import {MyMealsListItem} from '../../Seeds/Plans';
import {BottomTabParams, MainStackParams} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale} from '../../Utilities/Metrics';

type MealPlansListProps = {
  navigation: NativeStackNavigationProp<
    MainStackParams & BottomTabParams,
    'PLAN',
    undefined
  >;
};

const MealPlansList: FC<MealPlansListProps> = ({navigation}) => {
  const {myMealsList} = useAppSelector(state => state.myMeals);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>(
    {},
  );

  const renderItem = ({item}: {item: MyMealsListItem}) => {
    return (
      <Pressable
        onPress={() =>
          navigation.navigate('mealDetails', {
            mealId: item.id,
            isFromMyMeal: item.isPublic,
          })
        }
        style={styles.cardContainer}>
        <ImageBackground
          source={{
            uri: item.coverImage?.uri || item.coverImage,
          }}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
          onLoadStart={() =>
            setImageLoading(prev => ({...prev, [item.id]: true}))
          }
          onLoadEnd={() =>
            setImageLoading(prev => ({...prev, [item.id]: false}))
          }>
          <View style={styles.textOverlay}>
            <CustomText
              fontFamily="bold"
              fontSize={13}
              color={COLORS.white}
              style={styles.title}>
              {item.title}
            </CustomText>
          </View>
        </ImageBackground>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={myMealsList}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()} // Already a string based on type
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        initialNumToRender={6} // Render fewer items initially for performance
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

export default MealPlansList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalScale(10),
    paddingTop: verticalScale(10),
    backgroundColor: COLORS.darkBrown,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    columnGap: verticalScale(15),
  },
  contentContainer: {
    rowGap: verticalScale(15),
    paddingBottom: verticalScale(15),
  },
  cardContainer: {
    flex: 1,
  },
  imageBackground: {
    height: 150,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 10,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -10}, {translateY: -10}],
  },
  textOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: verticalScale(10),
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  title: {
    textAlign: 'center',
  },
});
