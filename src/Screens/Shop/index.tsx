import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React, { FC, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShopScreenProps } from "../../Typings/route";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale, wp } from "../../Utilities/Metrics";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import { CustomText } from "../../Components/CustomText";
import { useAppDispatch, useAppSelector } from "../../Redux/store";
import {
  setIsFilterVisible,
  setIsSideDrawerVisible,
} from "../../Redux/slices/modalSlice";
import { resetFilters } from "../../Redux/slices/filterSlice";
import SideDrawer from "../../Components/Modals/SideDrawer";
import Footer from "../../Components/Footer";
import FilterShortBy from "../../Components/Modals/FilterShortBy";
import { useIsFocused } from "@react-navigation/native";
import {
  KeyboardAvoidingContainer,
  KeyboardAvoidingContainerRef,
} from "../../Components/KeyboardAvoidingComponent";
import { fetchCollectionProducts } from "../../Services/requestHandlers";
import { Node } from "../../Services/ApiResponseTypes/Collection_List";

const Shop: FC<ShopScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const scrollContainerRef = useRef<KeyboardAvoidingContainerRef>(null);
  const [collectionProducts, setCollectionProducts] = useState<Node[]>([]);
  const [filteredAndSortedProducts, setFilteredAndSortedProducts] = useState<
    Node[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Get collection handle from route params
  const { collectionHandle = "hijabs-3", collectionTitle } = route.params || {};

  // Get filter and sort state from Redux
  const { selectedFilters, selectedSort, isApplied } = useAppSelector(
    (state) => state.filter
  );

  const handleMenuPress = () => {
    dispatch(setIsSideDrawerVisible(true));
  };

  const handleFilterPress = () => {
    dispatch(setIsFilterVisible(true));
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <CustomIcon
          Icon={ICONS.MenuIcon}
          width={20}
          height={20}
          onPress={handleMenuPress}
        />
        <CustomText
          fontFamily="medium"
          fontSize={16}
          color={COLORS.black}
          style={{ width: "70%", textAlign: "center" }}
        >
          {collectionTitle || "Shop Hijab"}
        </CustomText>
        <View style={styles.headerRightIcons}>
          <CustomIcon
            Icon={ICONS.BlackFilter}
            width={20}
            height={20}
            onPress={handleFilterPress}
          />
        </View>
      </View>
    );
  };

  const renderHijaabProduct = ({ item }: { item: Node }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate("singleProduct", {
          productId: item.id,
          productTitle: item.title,
        });
      }}
    >
      <Image
        source={{
          uri: item.images?.edges?.[0]?.node?.url,
        }}
        style={styles.recommendedImage}
        resizeMode="cover"
      />
      <View style={{ gap: verticalScale(3) }}>
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
          From{" "}
          {
            item.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.price?.amount
          }{" "}
          {
            item.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.price?.currencyCode
          }
        </CustomText>
      </View>
    </TouchableOpacity>
  );

  // Local filtering and sorting logic
  useEffect(() => {
    let filteredProducts = [...collectionProducts];

    // Apply filters
    if (isApplied && Object.keys(selectedFilters).length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        let matchesAllFilters = true;

        // Check each selected filter
        Object.entries(selectedFilters).forEach(([category, value]) => {
          if (category === "Availability") {
            const isAvailable = product.availableForSale;
            const expected = value === "Available";
            if (isAvailable !== expected) matchesAllFilters = false;
          } else {
            // Assume other filters are in variant options
            const variantOptions =
              product.variants?.edges?.[0]?.node?.selectedOptions || [];
            let optionName: string;
            switch (category) {
              case "Choose Style":
                optionName = "Style";
                break;
              case "Plain Or Print":
                optionName = "Pattern";
                break;
              case "Color":
                optionName = "Color";
                break;
              case "Fabric":
                optionName = "Fabric";
                break;
              default:
                optionName = category;
            }
            const matchesOption = variantOptions.some(
              (opt) =>
                opt.name === optionName &&
                opt.value ===
                  (typeof value === "string"
                    ? value.replace(/ \(\d+\)/, "")
                    : value) // Type guard for value
            );
            if (!matchesOption) matchesAllFilters = false;
          }
        });

        return matchesAllFilters;
      });
    }

    // Apply sorting
    let sortedProducts = [...filteredProducts];
    switch (selectedSort) {
      case "Relevance":
        // No change (use default order)
        break;
      case "Title: A-Z":
        sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "Title: Z-A":
        sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "Price: Low to High":
        sortedProducts.sort((a, b) => {
          const priceA = parseFloat(
            a.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.price?.amount || "0"
          );
          const priceB = parseFloat(
            b.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.price?.amount || "0"
          );
          return priceA - priceB;
        });
        break;
      case "Price: High to Low":
        sortedProducts.sort((a, b) => {
          const priceA = parseFloat(
            a.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.price?.amount || "0"
          );
          const priceB = parseFloat(
            b.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.price?.amount || "0"
          );
          return priceB - priceA;
        });
        break;
      case "Date: Old to New":
        sortedProducts.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.publishedAt || "").getTime();
          const dateB = new Date(b.updatedAt || b.publishedAt || "").getTime();
          return dateA - dateB;
        });
        break;
      case "Date: New to Old":
        sortedProducts.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.publishedAt || "").getTime();
          const dateB = new Date(b.updatedAt || b.publishedAt || "").getTime();
          return dateB - dateA;
        });
        break;
      case "Discount: High to Low":
        sortedProducts.sort((a, b) => {
          const priceA = parseFloat(
            a.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.price?.amount || "0"
          );
          const priceB = parseFloat(
            b.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.price?.amount || "0"
          );
          const compareAtPriceA = parseFloat(
            a.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.compareAtPrice?.amount || priceA.toString()
          );
          const compareAtPriceB = parseFloat(
            b.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
              ?.compareAtPrice?.amount || priceB.toString()
          );
          const discountA = compareAtPriceA - priceA;
          const discountB = compareAtPriceB - priceB;
          return discountB - discountA;
        });
        break;
      case "Best Selling":
        break;
    }

    setFilteredAndSortedProducts(sortedProducts);
  }, [collectionProducts, selectedFilters, selectedSort, isApplied]);

  useEffect(() => {
    if (isFocused && scrollContainerRef.current) {
      scrollContainerRef.current.scrollToTop();

      const isReturningToScreen = true;

      if (isReturningToScreen) {
        dispatch(resetFilters());

        loadProducts();
      }
    }
  }, [isFocused]);

  // Separate the loadProducts function
  const loadProducts = async () => {
    if (!collectionHandle) return;

    setLoading(true);
    try {
      const response = await fetchCollectionProducts(collectionHandle);
      if (
        response.success &&
        response.data?.collectionByHandle?.products?.edges
      ) {
        const products = response.data.collectionByHandle.products.edges.map(
          (edge) => edge.node
        );
        setCollectionProducts(products);
        setFilteredAndSortedProducts(products);
      } else {
        console.error("GraphQL Errors:", response.errors);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load when component mounts
  useEffect(() => {
    loadProducts();
  }, [collectionHandle]);

  return (
    <View style={styles.container}>
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={styles.safeAreaCont}
      >
        <View style={styles.innerContainer}>{renderHeader()}</View>
        <KeyboardAvoidingContainer ref={scrollContainerRef} bounce={false}>
          <View style={{ paddingHorizontal: horizontalScale(20) }}>
            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.black} />
              </View>
            ) : (
              <FlatList
                data={filteredAndSortedProducts}
                renderItem={renderHijaabProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                bounces={false}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: verticalScale(10),
                }}
                contentContainerStyle={{
                  paddingTop: verticalScale(10),
                }}
              />
            )}
          </View>
          <SideDrawer />
          <FilterShortBy />
          <Footer />
        </KeyboardAvoidingContainer>
      </SafeAreaView>
    </View>
  );
};

export default Shop;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
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
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(10),
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    width: wp(43),
  },
  recommendedImage: {
    width: "100%",
    height: verticalScale(220),
  },
  mt6: {
    marginTop: verticalScale(10),
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: verticalScale(300),
  },
});
