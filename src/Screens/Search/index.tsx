import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { FC, useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../Components/Header";
import { SearchScreenProps } from "../../Typings/route";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale, wp } from "../../Utilities/Metrics";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import { CustomText } from "../../Components/CustomText";
import IMAGES from "../../Assets/Images";
import { useIsFocused } from "@react-navigation/native";
import {
  fetchCollectionProducts,
  searchProducts,
} from "../../Services/requestHandlers";
import { Node } from "../../Services/ApiResponseTypes/Search_Product";
import CartIconWithBadge from "../../Components/CartIconWithBadge";

const Search: FC<SearchScreenProps> = ({ navigation, route }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const isFocused = useIsFocused();

  // Default collection handle to show products from when no search is performed
  const defaultCollectionHandle = route.params?.collectionHandle || "prints";
  const defaultCollectionTitle =
    route.params?.collectionTitle || "Featured Products";

  // Handle search function based on query
  const handleSearch = async () => {
    if (!query.trim()) {
      // If query is empty, load products from the default collection
      loadDefaultProducts();
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await searchProducts(query);
      console.log("Search response:", JSON.stringify(response, null, 2));

      if (response.success && response.data?.products?.edges) {
        const products = response.data.products.edges.map((edge) => edge.node);
        setSearchResults(products);
      } else {
        console.error("GraphQL Errors:", response.errors);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products from the default collection
  const loadDefaultProducts = async () => {
    setLoading(true);
    setHasSearched(false);

    try {
      console.log("Loading products from collection:", defaultCollectionHandle);
      const response = await fetchCollectionProducts(defaultCollectionHandle);
      console.log(
        "Collection products response:",
        JSON.stringify(response, null, 2)
      );

      if (
        response.success &&
        response.data?.collectionByHandle?.products?.edges
      ) {
        const products = response.data.collectionByHandle.products.edges.map(
          (edge) => edge.node
        );
        setSearchResults(products);
      } else {
        console.error("GraphQL Errors:", response.errors);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error loading default products:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle text change in search input
  const handleTextChange = (text: string) => {
    setQuery(text.trimStart());

    // If text is cleared, load default products
    if (!text.trim()) {
      loadDefaultProducts();
    }
  };

  // Reset search when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      setQuery("");
      setSearchResults([]);
      setHasSearched(false);
    } else {
      // Load default products when screen is focused
      loadDefaultProducts();
    }
  }, [isFocused, defaultCollectionHandle]);

  const renderSearchResult = ({ item }: { item: Node }) => (
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
          uri:
            item.images?.edges?.[0]?.node?.url ||
            "https://via.placeholder.com/150",
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
      {item.variants?.edges?.[0]?.node?.presentmentPrices?.edges?.[0]?.node
        ?.price && (
        <CustomText fontSize={12} fontFamily="regular" color={COLORS.Grey}>
          From{" "}
          {
            item.variants.edges[0].node.presentmentPrices.edges[0].node.price
              .amount
          }{" "}
          {
            item.variants.edges[0].node.presentmentPrices.edges[0].node.price
              .currencyCode
          }
        </CustomText>
      )}
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {hasSearched ? (
        <>
          <Image
            source={IMAGES.NoResultImage}
            style={styles.noResultImage}
            resizeMode="contain"
          />
          <CustomText
            fontSize={12}
            fontFamily="regular"
            color={COLORS.black}
            style={{ marginTop: verticalScale(10), textAlign: "center" }}
          >
            No products matched your criteria.
          </CustomText>
        </>
      ) : (
        <CustomText
          fontSize={14}
          fontFamily="regular"
          color={COLORS.Grey}
          style={{ textAlign: "center" }}
        >
          Search for products by name, type, or category
        </CustomText>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={styles.safeAreaCont}
      >
        <Header
          onContinue={() => navigation.navigate("cart")}
          onLogoPress={() => navigation.navigate("home")}
          renderCartIcon={() => <CartIconWithBadge />}
        />

        <View style={styles.innerContainer}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Search..."
              placeholderTextColor={COLORS.midnightgrey}
              style={styles.searchInput}
              value={query}
              onChangeText={handleTextChange}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch}>
              <CustomIcon Icon={ICONS.SearchIcon} height={20} width={20} />
            </TouchableOpacity>
          </View>

          {/* Title for default collection products */}
          {!hasSearched && searchResults.length > 0 && (
            <CustomText
              fontSize={16}
              fontFamily="medium"
              color={COLORS.black}
              style={styles.collectionTitle}
            >
              {defaultCollectionTitle}
            </CustomText>
          )}

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.black} />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              numColumns={2}
              bounces={false}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={
                searchResults.length === 0
                  ? styles.emptyListContent
                  : styles.flatListContent
              }
              ListEmptyComponent={renderEmptyComponent}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Search;

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
    flex: 1,
    paddingHorizontal: horizontalScale(16),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.offGrey,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.midnightgrey,
    paddingRight: horizontalScale(10),
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    width: wp(43),
    marginBottom: verticalScale(10),
  },
  recommendedImage: {
    width: "100%",
    height: verticalScale(220),
  },
  mt6: {
    marginTop: verticalScale(10),
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  flatListContent: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
  },
  noResultImage: {
    width: wp(50),
    height: verticalScale(180),
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: verticalScale(100),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  collectionTitle: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(5),
  },
});
