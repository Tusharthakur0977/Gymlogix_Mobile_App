import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React, { FC, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import COLORS from "../../Utilities/Colors";
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from "../../Utilities/Metrics";
import IMAGES from "../../Assets/Images";
import { CustomText } from "../../Components/CustomText";
import CustomButton from "../../Components/CustomButton";
import Footer from "../../Components/Footer";
import {
  addToCart,
  createCart,
  fetchProductDetails,
  fetchRecommendedProducts,
} from "../../Services/requestHandlers";
import {
  Product,
  ProductDetailResponse,
} from "../../Services/ApiResponseTypes/Product_Detail";
import { ProductRecommendation } from "../../Services/ApiResponseTypes/Reccomended_Products";
import {
  getLocalStorageData,
  storeLocalStorageData,
} from "../../Utilities/Helpers";
import STORAGE_KEYS from "../../Services/StorageKeys";
import { useAppDispatch } from "../../Redux/store";
import {
  setCartData,
  setCartId,
  setCartItems,
  setIsLoading,
} from "../../Redux/slices/cartSlice";
import CartIconWithBadge from "../../Components/CartIconWithBadge";
import { CreateCartApiResponse } from "../../Services/ApiResponseTypes/Create_Cart";
import Toast from "react-native-toast-message";

interface SingleProductProps {
  navigation: any;
  route: {
    params: {
      productId: string;
    };
  };
}

const SingleProduct: FC<SingleProductProps> = ({ navigation, route }) => {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<
    ProductRecommendation[]
  >([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);

  console.log(productDetails);

  const addToCartHandler = async () => {
    // Check if user is logged in by checking for access token
    const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);

    console.log(accessToken, "accessToken");

    if (!accessToken) {
      navigation.navigate("login");

      Toast.show({
        type: "info",
        text1: "Please login",
        text2: "You need to login before adding items to cart",
      });

      // Store the current product ID to return after login
      await storeLocalStorageData(STORAGE_KEYS.pendingProductId, productId);
      return;
    }

    // If user is logged in, proceed with add to cart
    setIsAddToCartLoading(true);
    try {
      const cartID = await getLocalStorageData(STORAGE_KEYS.cartId);
      const merchandiseId = productDetails?.variants.edges[0]?.node?.id;

      if (merchandiseId) {
        if (cartID) {
          // Cart exists, add item to it
          const response = await addToCart(cartID, merchandiseId, 1);

          console.log(response, "response");
          if (response.data.cartLinesAdd?.cart.id) {
            navigation.navigate("cart");
          }
        } else {
          // No cart exists, create one
          await createNewCart(merchandiseId);
        }
      }
    } catch (err) {
      console.log(JSON.stringify(err), " err in addToCart");
    } finally {
      setIsAddToCartLoading(false);
    }
  };

  // Helper function to create a new cart and add item
  const createNewCart = async (merchandiseId: string) => {
    try {
      const res = await createCart(merchandiseId, 1);
      console.log(res, "res");

      if (res.data?.cartCreate?.cart.id) {
        const newCartId = res.data.cartCreate.cart.id;

        // Store cart ID
        await storeLocalStorageData(STORAGE_KEYS.cartId, newCartId);
        dispatch(setCartId(newCartId));

        navigation.navigate("cart");

        Toast.show({
          type: "success",
          text1: "Item added to cart",
        });
      }
    } catch (err) {
      console.log(JSON.stringify(err), " err in createCart");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again later.",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // First fetch product details
        const response = await fetchProductDetails(productId);

        if (response.data?.product) {
          setProductDetails(response.data.product);

          // Set selected size
          if (response.data.product.variants.edges.length > 0) {
            setSelectedSize(response.data.product.variants.edges[0].node.title);
          }

          // Set main image
          if (response.data.product.images.edges.length > 0) {
            setMainImage(response.data.product.images.edges[0].node.url);
          }

          try {
            const recommendedResponse = await fetchRecommendedProducts(
              response.data.product.id
            );

            if (
              recommendedResponse.success &&
              recommendedResponse.data?.productRecommendations
            ) {
              setRecommendedProducts(
                recommendedResponse.data.productRecommendations
              );
            }
          } catch (recError) {
            console.error("Error loading recommended products:", recError);
            setRecommendedProducts([]);
          }
        } else {
          console.error(
            "GraphQL Errors:",
            response.errors || "No product data"
          );
        }
      } catch (error) {
        console.error("Error loading product details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <CustomIcon
          Icon={ICONS.BackArrowIcon}
          width={24}
          height={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.buttonContainer}>
          <CustomIcon Icon={ICONS.ShareIcon} width={20} height={20} />
          <CartIconWithBadge />
        </View>
      </View>
    );
  };

  const renderItem = ({
    item,
  }: {
    item: { node: { url: string; altText: string | null } };
  }) => {
    return (
      <TouchableOpacity
        style={styles.previewItem}
        activeOpacity={0.8}
        onPress={() => setMainImage(item.node.url)}
      >
        <Image source={{ uri: item.node.url }} style={styles.previewImage} />
      </TouchableOpacity>
    );
  };

  const renderSizeButton = (size: string) => {
    const isSelected = selectedSize === size;
    return (
      <TouchableOpacity
        key={size}
        onPress={() => setSelectedSize(size)}
        style={[
          styles.sizeButton,
          isSelected ? styles.sizeButtonSelected : styles.sizeButtonUnselected,
        ]}
      >
        <CustomText
          style={{ color: isSelected ? COLORS.white : COLORS.black }}
          fontFamily="medium"
          fontSize={12}
        >
          {size}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const renderMayLike = ({ item }: { item: ProductRecommendation }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("singleProduct", { productId: item.id })
      }
    >
      <Image
        source={{
          uri:
            item.images?.edges?.[0]?.node?.url ||
            "https://via.placeholder.com/300x400",
        }}
        style={styles.recommendedImage}
        resizeMode="cover"
      />
      <CustomText
        fontSize={12}
        fontFamily="regular"
        color={COLORS.black}
        style={styles.mt6}
        numberOfLines={2}
      >
        {item.title}
      </CustomText>
      <CustomText fontSize={12} fontFamily="regular" color={COLORS.Grey}>
        From {item.priceRange?.minVariantPrice?.amount || "0.00"}{" "}
        {item.priceRange?.minVariantPrice?.currencyCode || "USD"}
      </CustomText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <ActivityIndicator size="large" color={COLORS.black} />
      </View>
    );
  }

  if (!productDetails) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <CustomText
          fontFamily="medium"
          fontSize={16}
          color={COLORS.black}
          style={{ textAlign: "center" }}
        >
          Product not found
        </CustomText>
      </View>
    );
  }

  const productTitle = productDetails.title;
  const price =
    productDetails.variants.edges[0]?.node.presentmentPrices.edges[0]?.node
      .price.amount || "0.00";
  const currencyCode =
    productDetails.variants.edges[0]?.node.presentmentPrices.edges[0]?.node
      .price.currencyCode || "USD";
  const sizes = productDetails.variants.edges.map(
    (variant) => variant.node.title
  );
  const fabric =
    productDetails.metafields.edges.find((meta) => meta.node.key === "fabric")
      ?.node.value || "Not specified.";

  console.log(productDetails.metafields.edges);

  return (
    <View style={styles.container}>
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={styles.safeAreaCont}
      >
        <View style={styles.innerContainer}>{renderHeader()}</View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{}}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: mainImage || IMAGES.MaxiSet }}
              style={styles.mainImage}
            />
          </View>
          <FlatList
            data={productDetails.images.edges}
            horizontal={true}
            renderItem={renderItem}
            bounces={false}
            keyExtractor={(item) => item.node.url}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
          <View style={styles.detailsContainer}>
            <View style={styles.productInfo}>
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                {productTitle}
              </CustomText>
              <CustomText
                fontFamily="medium"
                fontSize={14}
                color={COLORS.black}
              >
                {currencyCode} {parseFloat(price).toFixed(2)}
              </CustomText>
            </View>
            <View style={styles.shippingInfo}>
              <View style={styles.infoRow}>
                <CustomIcon Icon={ICONS.WorldwideIcon} height={14} width={14} />
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.Grey}
                >
                  Free worldwide shipping*
                </CustomText>
              </View>
              <View style={styles.infoRow}>
                <CustomIcon Icon={ICONS.GreenDotIcon} height={14} width={14} />
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.Grey}
                >
                  Inventory on the way
                </CustomText>
              </View>
            </View>
            <View style={styles.sizeSection}>
              <CustomText
                fontFamily="regular"
                fontSize={14}
                color={COLORS.black}
              >
                Choose Size:
              </CustomText>
              <ScrollView
                horizontal
                bounces={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sizeScrollContainer}
              >
                {sizes.map(renderSizeButton)}
              </ScrollView>
            </View>
            <CustomButton
              label="Add To Cart"
              onPress={addToCartHandler}
              loading={isAddToCartLoading}
            />
            <View style={styles.descriptionContainer}>
              <CustomText
                fontFamily="regular"
                fontSize={12}
                color={COLORS.Grey}
                style={styles.descriptionText}
              >
                {productDetails.description}
              </CustomText>
              <CustomText
                fontFamily="regular"
                fontSize={12}
                color={COLORS.Grey}
                style={styles.descriptionText}
              >
                Note: The color of the product may slightly differ than the
                photographic image.
              </CustomText>
              <View>
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.black}
                  style={styles.descriptionText}
                >
                  The model is wearing size Medium. The model's height is 167
                  cm.
                </CustomText>
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.black}
                  style={styles.descriptionText}
                >
                  This piece runs short if you are taller, and will look exactly
                  as the model if you are around the same height.
                </CustomText>
              </View>
              <View style={styles.fabricInfo}>
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.black}
                >
                  Fabric:
                </CustomText>
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.Grey}
                >
                  {fabric}
                </CustomText>
              </View>
            </View>
            <View style={styles.sizeChartContainer}>
              <Image source={IMAGES.AbayaTable} style={styles.sizeChartImage} />
              <Image source={IMAGES.DressTable} style={styles.sizeChartImage} />
            </View>
            <View style={styles.demoImagesContainer}>
              <Image source={IMAGES.dressDemo} style={styles.demoImage} />
              <Image source={IMAGES.dressDemo1} style={styles.demoImage} />
            </View>
            {/* Updated Fabric/Care Dropdown with Expanded Content Including Date and Time */}
            <View>
              <TouchableOpacity
                style={styles.fabricCareButton}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.8}
              >
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.midnightgrey}
                >
                  Fabric/Care
                </CustomText>
                <CustomIcon
                  Icon={isExpanded ? ICONS.DropUpIcon : ICONS.DropDownIcon}
                  height={20}
                  width={20}
                />
              </TouchableOpacity>
              {isExpanded && (
                <View
                  style={[
                    styles.descriptionContainer,
                    {
                      paddingHorizontal: horizontalScale(10),
                    },
                  ]}
                >
                  <View style={{ marginBottom: verticalScale(10) }}>
                    <CustomText
                      fontFamily="regular"
                      fontSize={12}
                      color={COLORS.black}
                    >
                      Fabric:
                    </CustomText>
                    <CustomText
                      fontFamily="regular"
                      fontSize={12}
                      color={COLORS.Grey}
                      style={styles.descriptionText}
                    >
                      {fabric}
                    </CustomText>
                  </View>
                  <View style={{ marginBottom: verticalScale(10) }}>
                    <CustomText
                      fontFamily="regular"
                      fontSize={12}
                      color={COLORS.black}
                    >
                      Care Instructions:
                    </CustomText>
                    <CustomText
                      fontFamily="regular"
                      fontSize={12}
                      color={COLORS.Grey}
                      style={styles.descriptionText}
                    >
                      Hand wash only, do not bleach, iron on low heat.
                    </CustomText>
                  </View>
                  <View>
                    <CustomText
                      fontFamily="regular"
                      fontSize={12}
                      color={COLORS.black}
                    >
                      Last Updated:
                    </CustomText>
                    <CustomText
                      fontFamily="regular"
                      fontSize={12}
                      color={COLORS.Grey}
                      style={styles.descriptionText}
                    >
                      01:46 PM IST on Tuesday, May 27, 2025
                    </CustomText>
                  </View>
                </View>
              )}
            </View>
          </View>
          {/* You may also like section */}
          <View
            style={{
              paddingHorizontal: horizontalScale(20),
              gap: verticalScale(10),
              marginBottom: verticalScale(20),
            }}
          >
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.black}>
              You may also like
            </CustomText>

            <FlatList
              data={recommendedProducts}
              renderItem={renderMayLike}
              keyExtractor={(item) => item.id}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </View>
          <Footer />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SingleProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeAreaCont: {
    flex: 1,
    paddingTop: verticalScale(10),
  },
  innerContainer: {
    paddingHorizontal: horizontalScale(20),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: verticalScale(10),
  },
  buttonContainer: {
    flexDirection: "row",
    gap: horizontalScale(10),
  },
  imageContainer: {
    paddingHorizontal: horizontalScale(20),
    marginVertical: verticalScale(10),
  },
  mainImage: {
    width: "100%",
    height: verticalScale(500),
  },
  flatListContent: {
    paddingHorizontal: horizontalScale(8),
  },
  previewItem: {
    width: verticalScale(80),
    height: verticalScale(80),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  previewImage: {
    width: verticalScale(80),
    height: verticalScale(80),
    resizeMode: "contain",
  },
  detailsContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
  },
  productInfo: {
    gap: verticalScale(7),
    borderBottomWidth: 1,
    borderColor: COLORS.lightGrey,
    paddingVertical: verticalScale(10),
  },
  shippingInfo: {
    paddingVertical: verticalScale(10),
    gap: verticalScale(10),
  },
  infoRow: {
    flexDirection: "row",
    gap: horizontalScale(10),
    alignItems: "center",
  },
  sizeSection: {
    paddingVertical: verticalScale(10),
  },
  sizeScrollContainer: {
    flexDirection: "row",
    paddingVertical: verticalScale(10),
  },
  sizeButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(5),
  },
  sizeButtonSelected: {
    backgroundColor: COLORS.black,
  },
  sizeButtonUnselected: {
    backgroundColor: COLORS.white,
  },
  descriptionContainer: {
    paddingVertical: verticalScale(20),
    gap: verticalScale(10),
  },
  descriptionText: {
    lineHeight: 20,
  },
  fabricInfo: {
    flexDirection: "row",
    gap: horizontalScale(5),
  },
  sizeChartContainer: {
    paddingBottom: verticalScale(10),
    gap: verticalScale(10),
  },
  sizeChartImage: {
    width: "100%",
    height: hp(20),
    resizeMode: "contain",
  },
  demoImagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  demoImage: {
    width: "48%",
    height: hp(30),
    resizeMode: "contain",
  },
  fabricCareButton: {
    backgroundColor: COLORS.offGrey,
    padding: verticalScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(20),
    alignItems: "center",
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    width: wp(43),
    marginRight: horizontalScale(10),
    marginBottom: verticalScale(15),
  },
  recommendedImage: {
    width: horizontalScale(160),
    height: verticalScale(210),
  },
  mt6: {
    marginTop: verticalScale(10),
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
