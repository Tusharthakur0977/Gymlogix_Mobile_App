import React, {FC, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {CustomText} from '../../Components/CustomText';
import {
  setActivePlanIndex,
  setCurrentprogramId,
} from '../../Redux/slices/initialSlice';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import {ActivePlanListItem} from '../../Seeds/Plans';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics';
import {fetchData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';
import {getLocalStorageData} from '../../Utilities/Storage';
import STORAGE_KEYS from '../../Utilities/Constants';
import {setUserData} from '../../Redux/slices/UserSlice';
import {UserResponse} from '../../Typings/ApiResponse/UserResponse';

export const ActivePlanListCard: FC<ActivePlanListItem> = props => {
  return (
    <Pressable onPress={props.onPress} style={styles.card}>
      <Image source={{uri: props.coverImage}} style={styles.image} />
      <View style={styles.cardContent}>
        <CustomText fontFamily="bold" style={styles.title}>
          {props.title}
        </CustomText>
        <View style={styles.tagContainer}>
          {props.tags.map((tag, index) => (
            <CustomText
              key={index}
              style={styles.tag}
              fontFamily="italicBold"
              fontSize={10}
              color={COLORS.black}>
              {tag}
            </CustomText>
          ))}
        </View>
      </View>
    </Pressable>
  );
};

type ActivePlanListProps = {
  actviePlanList: ActivePlanListItem[];
};

const ActivePlanList: FC<ActivePlanListProps> = ({}) => {
  const dispatch = useAppDispatch();
  const {planData} = useAppSelector(state => state.planData);
  const {userData} = useAppSelector(state => state.userData);
  const [isLoading, setisLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const getToken = await getLocalStorageData(STORAGE_KEYS.token);
      setisLoading(true);
      try {
        if (getToken) {
          const response = await fetchData<UserResponse>(ENDPOINTS.getUser);
          dispatch(setUserData(response.data.user));
        }
      } catch (error) {
        console.log(error, 'Something went wrong');
      } finally {
        setisLoading(false);
      }
    };
    fetchUser();
  }, []);

  const activatePlanIds = (userData?.activated_plan || []).map(
    (id: string | number) => Number(id),
  );

  const filterPlans = planData?.filter(item =>
    activatePlanIds.includes(Number(item.allData?.plan_id)),
  );

  const convertData = filterPlans?.map(item => ({
    id: item.id ?? '',
    planId: item.planId,
    coverImage: item.allData?.image_url
      ? item.allData?.image_url
      : item.coverImage
      ? item.coverImage!
      : 'https://images.unsplash.com/photo-1599058917212-d750089bc07e',
    title: item.allData?.name || 'Name',
    tags:
      (item.tags !== undefined && item.tags.length > 1
        ? item.tags
        : item.allData?.content.tags
        ? item.allData?.content.tags
        : item.allData?.tags) ?? [],
    type: item.allData?.type as 'workout' | 'food',
    allData: item.allData,
  }));

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.darkBrown,
        }}>
        <ActivityIndicator color={COLORS.yellow} size={30} />
      </View>
    );
  }

  return (
    <View
      style={{
        paddingHorizontal: horizontalScale(10),
        paddingTop: verticalScale(10),
        backgroundColor: COLORS.darkBrown,
        flex: convertData && convertData?.length > 0 ? 1 : 1,
        justifyContent:
          convertData && convertData?.length > 0 ? 'flex-start' : 'center',
      }}>
      {convertData && convertData?.length > 0 ? (
        <FlatList
          data={convertData}
          renderItem={({item}) => (
            <ActivePlanListCard
              {...item}
              key={item.id}
              onPress={() => {
                dispatch(setCurrentprogramId(item.allData?.plan_id));
                dispatch(
                  setActivePlanIndex(item.allData?.type === 'workout' ? 1 : 2),
                );
              }}
            />
          )}
          keyExtractor={item => item.planId || item.allData?.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: verticalScale(80),
          }}
        />
      ) : (
        <View
          style={{
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <CustomText color={COLORS.yellow} fontSize={18} fontFamily="bold">
            No Active Plan Found
          </CustomText>
        </View>
      )}
    </View>
  );
};

export default ActivePlanList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.lightBrown,
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    gap: horizontalScale(10),
    overflow: 'hidden',
  },
  image: {
    width: wp(35),
    maxHeight: '100%',
    minHeight: hp(13),
  },
  cardContent: {
    gap: verticalScale(20),
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
  },
  title: {
    shadowColor: '#00000040', // Corrected box shadow equivalent
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: horizontalScale(5),
    marginTop: 5,
  },
  tag: {
    backgroundColor: COLORS.whiteGreenish,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(8),
    borderRadius: 5,
  },
});
