import React, { FC, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartProps } from "../../Typings/route";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../Utilities/Metrics";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import { CustomText } from "../../Components/CustomText";
import CustomButton from "../../Components/CustomButton";
import IMAGES from "../../Assets/Images";
import {
  CheckoutCompletedEvent,
  useShopifyCheckoutSheet,
} from "@shopify/checkout-sheet-kit";
import {
  getLocalStorageData,
  storeLocalStorageData,
} from "../../Utilities/Helpers";
import STORAGE_KEYS from "../../Services/StorageKeys";
import { useIsFocused } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../Redux/store";
import {
  setCartData,
  setCartId,
  setIsLoading,
} from "../../Redux/slices/cartSlice";
import {
  fetchCart,
  updateCart,
  removeCart,
} from "../../Services/requestHandlers";

const Cart: FC<CartProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { cartData, cartItems, cartId, isLoading } = useAppSelector(
    (state) => state.cart
  );
  const [isChecked, setIsChecked] = useState(false);
  const isFocused = useIsFocused();
  const ShopifyCheckout = useShopifyCheckoutSheet();

  const increaseQty = async (index: number) => {
    if (!cartData || !cartData.lines.edges[index] || !cartId) return;

    try {
      const lineId = cartData.lines.edges[index].node.id;
      const newQty = cartData.lines.edges[index].node.quantity + 1;

      const variables = {
        cartId,
        lines: [
          {
            id: lineId,
            quantity: newQty,
          },
        ],
      };

      const response = await updateCart(cartId, lineId, newQty);

      if (response?.data?.cartLinesUpdate?.cart) {
        await fetchCartDataHandler(false); // Refresh cart data
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    } finally {
    }
  };

  const decreaseQty = async (index: number) => {
    if (!cartData || !cartData.lines.edges[index] || !cartId) return;

    try {
      const lineId = cartData.lines.edges[index].node.id;
      const currentQty = cartData.lines.edges[index].node.quantity;

      if (currentQty <= 1) {
        // Remove item from cart when quantity reaches 0
        const response = await removeCart(cartId, [lineId]);

        if (response?.data?.cartLinesRemove?.cart) {
          await fetchCartDataHandler(); // Refresh cart data
        }
      } else {
        // Decrease quantity by 1
        const newQty = currentQty - 1;
        const response = await updateCart(cartId, lineId, newQty);

        if (response?.data?.cartLinesUpdate?.cart) {
          await fetchCartDataHandler(false); // Refresh cart data
        }
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  const fetchCartDataHandler = async (shouldDispatchLoading = true) => {
    if (shouldDispatchLoading) {
      dispatch(setIsLoading(true));
    }
    try {
      const storedCartId = await getLocalStorageData(STORAGE_KEYS.cartId);

      if (!storedCartId) {
        dispatch(setIsLoading(false));
        return;
      }

      dispatch(setCartId(storedCartId));
      const response = await fetchCart(storedCartId);

      if (response.data.cart) {
        dispatch(setCartData(response.data.cart));
      }
    } catch (err) {
      console.error("Error fetching cart data:", err);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <CustomIcon
        Icon={ICONS.BackArrowIcon}
        width={24}
        height={24}
        onPress={() => navigation.goBack()}
      />
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.node.merchandise.product.images.edges[0].node.url }}
        style={styles.image}
      />
      <View style={{ flex: 1, paddingVertical: 10 }}>
        <View style={styles.itemHeader}>
          <CustomText
            fontFamily="medium"
            fontSize={12}
            numberOfLines={1}
            color={COLORS.black}
          >
            {item.node.merchandise.product.title}
          </CustomText>

          <CustomText
            color={COLORS.Grey}
            fontSize={12}
            style={{ marginTop: 2 }}
          >
            From £{item.node.merchandise.price.amount}
          </CustomText>
        </View>

        <View style={styles.qtyControls}>
          <CustomText color={COLORS.Grey} fontSize={10}>
            Quantity
          </CustomText>
          <View style={styles.qtyWrapper}>
            <TouchableOpacity
              onPress={() => decreaseQty(index)}
              style={styles.qtyBtn}
              activeOpacity={0.7}
            >
              <CustomText fontSize={12} color={COLORS.Grey}>
                -
              </CustomText>
            </TouchableOpacity>
            <CustomText fontSize={12} color={COLORS.Grey}>
              {item.node.quantity}
            </CustomText>
            <TouchableOpacity
              onPress={() => increaseQty(index)}
              style={styles.qtyBtn}
              activeOpacity={0.7}
            >
              <CustomText fontSize={12} color={COLORS.Grey}>
                +
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <View style={styles.totalRow}>
        <CustomText fontSize={12} color={COLORS.Grey}>
          Total
        </CustomText>
        <CustomText
          fontFamily="regular"
          fontSize={16}
          color={COLORS.black}
          style={{ fontWeight: "700" }}
        >
          ${cartData?.estimatedCost?.subtotalAmount?.amount}
        </CustomText>
      </View>
    </View>
  );

  useEffect(() => {
    if (isFocused) {
      fetchCartDataHandler();
    }
  }, [isFocused]);

  useEffect(() => {
    const close = ShopifyCheckout.addEventListener("close", () => {
      // Do something on checkout close
      console.log("CLOSE");
    });

    const completed = ShopifyCheckout.addEventListener(
      "completed",
      async (_event: CheckoutCompletedEvent) => {
        console.log("CHECKOUT COMPLETED");
      }
    );

    const error = ShopifyCheckout.addEventListener("error", (error: any) => {
      // Do something on checkout error
      console.log(error.message, "ERROR");
    });

    return () => {
      // It is important to clear the subscription on unmount to prevent memory leaks
      close?.remove();
      completed?.remove();
      error?.remove();
    };
  }, [ShopifyCheckout]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.black} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={styles.safeAreaCont}
      >
        <View style={styles.innerContainer}>{renderHeader()}</View>

        <View style={styles.topRow}>
          <CustomText fontFamily="regular" fontSize={16} color={COLORS.black}>
            Cart
          </CustomText>
          <CustomText fontFamily="medium" fontSize={12} color={COLORS.Grey}>
            {cartData?.lines.edges.length} Items
          </CustomText>
        </View>

        <FlatList
          data={cartData?.lines.edges}
          renderItem={renderItem}
          keyExtractor={(item) => item.node.id}
          contentContainerStyle={styles.flatListContent}
          ListFooterComponent={renderFooter}
        />

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsChecked(!isChecked)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isChecked ? COLORS.checkgrey : COLORS.white,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              {isChecked && (
                <CustomIcon Icon={ICONS.CheckIcon} height={12} width={12} />
              )}
            </View>

            <CustomText fontSize={12} color={COLORS.Grey}>
              I agree with the{" "}
              <CustomText
                fontSize={12}
                color={COLORS.Grey}
                style={{ textDecorationLine: "underline" }}
              >
                terms, conditions, refund and privacy policy
              </CustomText>
            </CustomText>
          </TouchableOpacity>
        </View>

        <CustomButton
          label="Checkout"
          disabled={!isChecked || !cartData?.lines.edges.length}
          onPress={() => {
            if (cartData?.checkoutUrl) {
              ShopifyCheckout.present(cartData.checkoutUrl);
            }
          }}
          containerStyle={{ marginBottom: verticalScale(20) }}
        />
      </SafeAreaView>
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeAreaCont: {
    flex: 1,
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
  },
  innerContainer: {
    marginBottom: verticalScale(20),
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(15),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flatListContent: {
    gap: verticalScale(15),
    paddingVertical: verticalScale(20),
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    gap: horizontalScale(10),
    alignItems: "flex-start",
  },
  image: {
    width: 74,
    height: 84,
    resizeMode: "cover",
  },
  itemHeader: {
    gap: verticalScale(2),
  },
  qtyControls: {
    marginTop: verticalScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyWrapper: {
    flexDirection: "row",
    backgroundColor: COLORS.offGrey,
    alignItems: "center",
    paddingHorizontal: horizontalScale(3),
    minWidth: 65,
    justifyContent: "space-between",
  },
  qtyBtn: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  footerContainer: {
    marginTop: verticalScale(10),
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  bottomSection: {
    paddingVertical: verticalScale(20),
    gap: verticalScale(15),
    width: "85%",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.checkgrey,
  },
});
