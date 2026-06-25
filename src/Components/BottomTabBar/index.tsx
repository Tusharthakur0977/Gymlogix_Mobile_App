import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React, {FC, useCallback, useRef} from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import {useAppSelector} from '../../Redux/store';
import COLORS from '../../Utilities/Colors';
import {
  horizontalScale,
  isAndroid,
  verticalScale,
} from '../../Utilities/Metrics';
import CustomIcon from '../CustomIcon';
import {CustomText} from '../CustomText';

type Tab = {
  name: string;
  icon: any;
  activIcon: any;
  route: string;
};

const tabs: Tab[] = [
  {
    name: 'HOME',
    icon: ICONS.HomeTabIcon,
    activIcon: ICONS.HomeTabIcon,
    route: 'HOME',
  },
  {
    name: 'PLAN',
    icon: ICONS.PlanTabIcon,
    activIcon: ICONS.PlanTabIcon,
    route: 'PLAN',
  },
  {
    name: 'STATS',
    icon: ICONS.StatsTabIcon,
    activIcon: ICONS.StatsTabIcon,
    route: 'STATS',
  },
  {
    name: 'INSIGHT',
    icon: ICONS.InsightTabIcon,
    activIcon: ICONS.InsightTabIcon,
    route: 'INSIGHT',
  },

  {
    name: 'SETTINGS',
    icon: ICONS.SettingsTabIcon,
    activIcon: ICONS.SettingsTabIcon,
    route: 'SETTINGS',
  },
];

const BottomTabBar: FC<BottomTabBarProps> = props => {
  const insets = useSafeAreaInsets();
  const {state, navigation, descriptors} = props;
  const currentRoute = state.routes[state.index].name;

  const {homeActiveIndex} = useAppSelector(state => state.initial);

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handleTabPress = useCallback(
    (tab: Tab) => {
      if (currentRoute !== tab.route) {
        navigation.navigate(tab.route as never);
      }
    },
    [navigation, currentRoute],
  );

  const renderTab = useCallback(
    ({item, index}: {item: Tab; index: number}) => {
      const isActive = currentRoute === item.route;

      return (
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress(item)}
          activeOpacity={0.7}>
          <CustomIcon
            Icon={isActive ? item.activIcon : item.icon}
            height={30}
            width={30}
          />
          <CustomText
            fontSize={8}
            fontWeight={isActive ? '500' : '400'}
            color={COLORS.white}>
            {item.name}
          </CustomText>
          <View
            style={{
              width: 30,
              height: 5,
              backgroundColor: isActive ? COLORS.yellow : COLORS.black,
              borderRadius: 5,
              marginTop: 8,
            }}></View>
        </TouchableOpacity>
      );
    },
    [handleTabPress, currentRoute, scaleValue],
  );

  if (homeActiveIndex !== 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabWrapper}>
        <FlatList
          data={tabs}
          renderItem={renderTab}
          keyExtractor={item => item.route}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.tabBar, {}]}
          contentContainerStyle={styles.tabContent}
        />
      </View>
    </View>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(15),
  },
  tabWrapper: {
    flex: 1,
    marginHorizontal: horizontalScale(10),
  },
  tabBar: {
    paddingTop: verticalScale(5),
    paddingBottom: isAndroid ? verticalScale(0) : verticalScale(5),
  },
  tabContent: {
    flexGrow: 1,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    zIndex: 99,
    gap: verticalScale(5),
  },

  middleButton: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 30,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001, // Ensure it’s above the tab bar
    boxShadow: '0px 4px 12px 0px #FF003B80',
  },
});
