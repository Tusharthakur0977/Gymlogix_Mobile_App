import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { horizontalScale, verticalScale } from "../Utilities/Metrics";
import CustomIcon from "./CustomIcon";
import ICONS from "../Assets/Icons";
import IMAGES from "../Assets/Images";
import { useDispatch } from "react-redux";
import { setIsSideDrawerVisible } from "../Redux/slices/modalSlice";
import SideDrawer from "./Modals/SideDrawer";
import { useAppSelector } from "../Redux/store";
import { CustomText } from "./CustomText";
import COLORS from "../Utilities/Colors";
import CartIconWithBadge from "./CartIconWithBadge";
interface HeaderProps {
  onContinue: () => void;
  onLogoPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ onContinue, onLogoPress }) => {
  const dispatch = useDispatch();

  const { cartData, cartItems, cartId, isLoading } = useAppSelector(
    (state) => state.cart
  );

  const handleMenuPress = () => {
    dispatch(setIsSideDrawerVisible(true));
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <CustomIcon
        Icon={ICONS.MenuIcon}
        width={20}
        height={20}
        onPress={handleMenuPress}
      />
      <TouchableOpacity onPress={onLogoPress} activeOpacity={0.8}>
        <Image source={IMAGES.LogoImage} style={{ width: 99, height: 12 }} />
      </TouchableOpacity>

      {/* <View>
        <CustomText
          fontFamily="medium"
          fontSize={10}
          color={COLORS.black}
          style={{ position: "absolute", top: -3, right: -3 }}
        >
          {cartData?.lines.edges.length}
        </CustomText>
        <CustomIcon
          Icon={ICONS.CartIcon}
          width={20}
          height={20}
          onPress={onContinue}
        />
      </View> */}
      <CartIconWithBadge />
    </View>
  );

  return (
    <View>
      <View style={styles.innerContainer}>{renderHeader()}</View>
      <SideDrawer />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  innerContainer: {
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(10),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
