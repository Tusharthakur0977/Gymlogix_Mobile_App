import React, { FC, useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ICONS from "../../Assets/Icons";
import IMAGES from "../../Assets/Images";
import CustomIcon from "../../Components/CustomIcon";
import { CustomText } from "../../Components/CustomText";
import Footer from "../../Components/Footer";
import { Node } from "../../Services/ApiResponseTypes/Collection_List";
import { fetchCollectionsList } from "../../Services/requestHandlers";
import { CollectionProps } from "../../Typings/route";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../Utilities/Metrics";
import CartIconWithBadge from "../../Components/CartIconWithBadge";

// Define collection handle to fallback image mapping
const COLLECTION_FALLBACK_IMAGES: { [key: string]: any } = {
  "umrah-hajj-essentials-1": IMAGES.GiftIdeas,
  prints: IMAGES.ClassicPrints,
  accessories: IMAGES.GoldAccessories,
  monogram: IMAGES.MonogramImg,
  clearance: IMAGES.ClearanceImg,
  "palestine-1": IMAGES.Palestineimg,
  "hijabs-3": IMAGES.BokittaImg1,
  // Add more mappings as needed
};

const Collection: FC<CollectionProps> = ({ navigation }) => {
  const [collectionList, setCollectionList] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const handleHijaabCollectionPress = () => {
    Linking.openURL("https://bokitta.in/");
  };

  const loadCollections = useCallback(
    async (cursor: string | null = null) => {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        // Initial load with 250 items, then paginate with 50 at a time
        const itemsPerPage = initialLoadComplete ? 50 : 250;
        const response = await fetchCollectionsList(itemsPerPage, cursor);

        if (response.success) {
          const newCollections = response.data.collections.nodes;

          // Log all collections for debugging
          console.log(
            `Loaded ${newCollections.length} collections${
              cursor ? " (pagination)" : " (initial)"
            }`,
            newCollections.map((c) => ({
              handle: c.handle,
              title: c.title,
              hasImage: !!c.image,
            }))
          );

          if (cursor) {
            // Append new collections to existing list
            setCollectionList((prev) => [...prev, ...newCollections]);
          } else {
            // Replace existing collections
            setCollectionList(newCollections);
            setInitialLoadComplete(true);
          }

          // Update pagination info
          if (response.data.collections.pageInfo) {
            setHasNextPage(response.data.collections.pageInfo.hasNextPage);
            setEndCursor(response.data.collections.pageInfo.endCursor);
          } else {
            setHasNextPage(false);
          }
        } else {
          console.error("GraphQL Errors:", response.errors);
        }
      } catch (error) {
        console.error("Error loading collections:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [initialLoadComplete]
  );

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore && endCursor) {
      loadCollections(endCursor);
    }
  };

  const renderPrintedCollections = ({ item }: { item: Node }) => {
    // Get fallback image based on collection handle
    const fallbackImage =
      COLLECTION_FALLBACK_IMAGES[item.handle] || IMAGES.BokittaImg8;

    // Check if image URL exists and is valid
    const hasValidImage =
      !!item.image?.originalSrc && item.image.originalSrc.startsWith("http");

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => {
          // Navigate to the shop screen with collection parameters
          navigation.navigate("tabs", {
            screen: "shop",
            params: {
              collectionId: item.id,
              collectionHandle: item.handle,
              collectionTitle: item.title,
            },
          });
        }}
      >
        <Image
          source={
            hasValidImage ? { uri: item.image!.originalSrc } : fallbackImage
          }
          style={styles.image}
          resizeMode="cover"
          onError={(e) => {
            console.warn(
              `Failed to load image for collection "${item.title}"`,
              e.nativeEvent.error
            );
          }}
        />
        <CustomText
          fontSize={12}
          fontFamily="regular"
          color={COLORS.black}
          numberOfLines={2}
          style={styles.title}
        >
          {item.title}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.black} />
      </View>
    );
  };

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <CustomIcon
        Icon={ICONS.BackArrowIcon}
        width={24}
        height={24}
        onPress={() => {
          navigation.goBack();
        }}
      />
      <Image source={IMAGES.LogoImage} style={{ width: 99, height: 12 }} />
      <View style={styles.headerRightIcons}>
        <CartIconWithBadge />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
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
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View
            style={{
              paddingHorizontal: horizontalScale(20),
              paddingVertical: verticalScale(10),
            }}
          >
            <CustomText
              fontFamily="regular"
              fontSize={16}
              color={COLORS.black}
              style={{ marginBottom: verticalScale(10) }}
            >
              Exclusive Printed Collections{" "}
              {collectionList.length > 0 ? `(${collectionList.length})` : ""}
            </CustomText>
            <View>
              <FlatList
                data={collectionList}
                renderItem={renderPrintedCollections}
                keyExtractor={(item) => item.id}
                numColumns={3}
                bounces={false}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: verticalScale(10),
                }}
                contentContainerStyle={{
                  paddingTop: verticalScale(10),
                }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <CustomText
                      fontFamily="regular"
                      fontSize={14}
                      color={COLORS.Grey}
                    >
                      No collections available
                    </CustomText>
                  </View>
                }
              />
            </View>
            <View style={{ marginTop: verticalScale(10) }}>
              <CustomText
                fontFamily="black"
                fontSize={16}
                color={COLORS.black}
                style={{ textAlign: "center" }}
              >
                Explore vibrant hijab colors and styles
              </CustomText>
              <CustomText
                fontFamily="regular"
                fontSize={12}
                color={COLORS.Grey}
                style={{
                  lineHeight: 20,
                  textAlign: "center",
                  marginTop: verticalScale(10),
                }}
              >
                Enter a world where style meets tradition with our{" "}
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.black}
                  style={{ textDecorationLine: "underline" }}
                  onPress={handleHijaabCollectionPress}
                >
                  diverse collection of hijab colors and designs
                </CustomText>
                <CustomText color={COLORS.black}>.</CustomText> Our carefully
                curated range delivers everything from soft jersey materials to
                luxurious georgettes, each piece promising comfort and elegance.
                Whether you are searching for a subtle shade for everyday wear
                or a vibrant tone for a particular occasion, our palette
                accommodates every mood and personality.
              </CustomText>
              <CustomText
                fontFamily="regular"
                fontSize={12}
                color={COLORS.Grey}
                style={{
                  lineHeight: 20,
                  textAlign: "center",
                  marginTop: verticalScale(10),
                }}
              >
                With our extensive selection of{" "}
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.black}
                  style={{ textDecorationLine: "underline" }}
                  onPress={handleHijaabCollectionPress}
                >
                  Muslim head Scarf
                </CustomText>
                , Embrace the versatility of our hijabs, from the practicality
                of one-piece bonnets to the sophisticated drapes of Shaylas. We
                craft each hijab to provide not only coverage but also a
                statement of style and identity.
              </CustomText>
              <CustomText
                fontFamily="regular"
                fontSize={12}
                color={COLORS.Grey}
                style={{
                  lineHeight: 20,
                  textAlign: "center",
                  marginTop: verticalScale(10),
                }}
              >
                Our collection transcends traditional boundaries, inviting women
                of all backgrounds to explore the elegance of hijabs. Discover
                your perfect match with us, and express yourself with confidence
                and grace.
              </CustomText>
            </View>
          </View>
          <Footer />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Collection;

const styles = StyleSheet.create({
  innerContainer: {
    paddingHorizontal: horizontalScale(20),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: verticalScale(10),
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeAreaCont: {
    flex: 1,
    paddingTop: verticalScale(10),
  },
  itemContainer: {
    alignItems: "center",
    width: horizontalScale(103),
  },
  image: {
    width: horizontalScale(103),
    height: verticalScale(120),
  },
  title: {
    marginTop: verticalScale(10),
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: verticalScale(300),
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: horizontalScale(10),
  },
  footerLoader: {
    paddingVertical: verticalScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: verticalScale(20),
  },
});
