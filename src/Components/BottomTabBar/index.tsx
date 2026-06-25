import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { FC, useCallback, useRef, useState, useEffect } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ICONS from "../../Assets/Icons";
import COLORS from "../../Utilities/Colors";
import {
  horizontalScale,
  isAndroid,
  verticalScale,
} from "../../Utilities/Metrics";
import { CustomText } from "../CustomText";
import CustomIcon from "../CustomIcon";

type Tab = {
  name: string;
  icon: any;
  activIcon: any;
  route: string;
};

const tabs: Tab[] = [
  {
    name: "Home",
    icon: ICONS.HomeIcon,
    activIcon: ICONS.SelectedHomeIcon,
    route: "home",
  },
  {
    name: "Shop",
    icon: ICONS.ShopIcon,
    activIcon: ICONS.SelectedShopIcon,
    route: "shop",
  },
  {
    name: "Search",
    icon: ICONS.SearchIcon,
    activIcon: ICONS.SelectedSearchIcon,
    route: "search",
  },
  {
    name: "Style Guide",
    icon: ICONS.StyleGuideIcon,
    activIcon: ICONS.SelectedSGIcon,
    route: "styleGuide",
  },
  {
    name: "Account",
    icon: ICONS.AccountIcon,
    activIcon: ICONS.SelectedAccountIcon,
    route: "account",
  },
];

const BottomTabBar: FC<BottomTabBarProps> = (props) => {
  const insets = useSafeAreaInsets();
  const { state, navigation } = props;
  const currentRoute = state.routes[state.index].name;

  const [isKeyboard, setIsKeyboard] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboard(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboard(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleTabPress = useCallback(
    (tab: Tab) => {
      if (currentRoute !== tab.route) {
        navigation.navigate(tab.route as never);
      }
    },
    [navigation, currentRoute]
  );

  const renderTab = useCallback(
    ({ item }: { item: Tab }) => {
      const isActive = currentRoute === item.route;
      return (
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress(item)}
          activeOpacity={0.7}
        >
          <CustomIcon
            Icon={isActive ? item.activIcon : item.icon}
            height={20}
            width={20}
          />
          <CustomText
            fontSize={10}
            color={isActive ? COLORS.DarkBrown : COLORS.DarkGrey}
            style={
              isActive
                ? {
                    textDecorationLine: "underline",
                    textDecorationColor: COLORS.DarkBrown,
                  }
                : undefined
            }
          >
            {item.name}
          </CustomText>
        </TouchableOpacity>
      );
    },
    [handleTabPress, currentRoute]
  );

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderTopWidth: 2,
        borderColor: COLORS.MediumGrey,
      }}
    >
      <View style={styles.container}>
        <View style={styles.tabWrapper}>
          <FlatList
            data={tabs}
            renderItem={renderTab}
            keyExtractor={(item) => item.route}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabBar}
            contentContainerStyle={styles.tabContent}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(15),
    borderTopLeftRadius: verticalScale(20),
    borderTopRightRadius: verticalScale(20),
  },
  tabWrapper: {
    flex: 1,
    marginHorizontal: horizontalScale(10),
  },
  tabBar: {
    paddingBottom: isAndroid ? verticalScale(0) : verticalScale(5),
  },
  tabContent: {
    flexGrow: 1,
    justifyContent: "space-around",
  },
  tab: {
    alignItems: "center",
    justifyContent: "flex-end",
    alignSelf: "center",
    zIndex: 99,
    gap: verticalScale(5),
  },
});

export default BottomTabBar;
