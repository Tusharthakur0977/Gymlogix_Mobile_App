import { useIsFocused } from "@react-navigation/native";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
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
import Header from "../../Components/Header";
import {
  KeyboardAvoidingContainer,
  KeyboardAvoidingContainerRef,
} from "../../Components/KeyboardAvoidingComponent";
import { HomeScreenProps } from "../../Typings/route";
import COLORS from "../../Utilities/Colors";
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from "../../Utilities/Metrics";
import {
  fetchRecommendedProducts,
  fetchCollectionProducts,
  fetchCollectionsList,
} from "../../Services/requestHandlers";
import { ProductRecommendation } from "../../Services/ApiResponseTypes/Reccomended_Products";
import { Node as ProductNode } from "../../Services/ApiResponseTypes/Collection_Product_List";
import { Node as CollectionNode } from "../../Services/ApiResponseTypes/Collection_List";
import { useAppSelector } from "../../Redux/store";

// Define the collection handles we want to display
const BANNER_COLLECTION_HANDLE = "mothers-day";
const FEATURED_COLLECTION_HANDLES = [
  "umrah-hajj-essentials-1",
  "prints",
  "accessories",
  "monogram",
  "clearance",
  "palestine-1",
];

// Remove the hardcoded promotionalSections array
// const promotionalSections = [
//   {
//     id: "1",
//     title: "Gift Ideas",
//     image: IMAGES.GiftIdeas,
//   },
//   ...
// ];const promotionalSections = [
//   {
//     id: "1",
//     title: "Gift Ideas",
//     image: IMAGES.GiftIdeas,
//   },
//   {
//     id: "2",
//     title: "BASIC Instant Hijabs.",
//     image: IMAGES.splash,
//   },
//   {
//     id: "3",
//     title: "Clearance",
//     image: IMAGES.ClearanceImg,
//   },
//   {
//     id: "4",
//     title: "The Monogram Collection",
//     image: IMAGES.MonogramImg,
//   },
//   {
//     id: "5",
//     title: "100% Donated to Palestine",
//     image: IMAGES.Palestineimg,
//   },
//   {
//     id: "6",
//     title: "Classic Prints",
//     image: IMAGES.ClassicPrints,
//   },
// ];

const styleOptions = [
  { id: "1", name: "Loose Freestyle", image: IMAGES.GirlImage },
  { id: "2", name: "Voila", image: IMAGES.GirlImage },
  { id: "3", name: "Chic", image: IMAGES.GirlImage },
  { id: "4", name: "Freestyle", image: IMAGES.GirlImage },
];

// Main Home Component
const Home: FC<HomeScreenProps> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const scrollContainerRef = useRef<KeyboardAvoidingContainerRef>(null);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<
    ProductRecommendation[]
  >([]);
  const [styleOptions, setStyleOptions] = useState<ProductNode[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [bannerCollection, setBannerCollection] =
    useState<CollectionNode | null>(null);
  const [featuredCollections, setFeaturedCollections] = useState<
    CollectionNode[]
  >([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await fetchRecommendedProducts();
        if (response.success && response.data?.productRecommendations) {
          setRecommendedProducts(response.data.productRecommendations);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();

    const loadStyleOptions = async () => {
      setStylesLoading(true);
      try {
        // Use "hijab-styles" or another appropriate collection
        const response = await fetchCollectionProducts("hijabs-3");

        if (
          response.success &&
          response.data?.collectionByHandle?.products?.edges
        ) {
          // Extract nodes from edges
          const allProducts =
            response.data.collectionByHandle.products.edges.map(
              (edge) => edge.node
            );

          // Create a map to track unique variant titles
          const uniqueVariantTitles = new Map();

          // Filter products to keep only those with unique variant titles
          const uniqueProducts = allProducts.filter((product) => {
            // Get variant title
            const variantTitle =
              product.variants.edges.length > 0
                ? product.variants.edges[0].node.title
                : product.title;

            // If we haven't seen this variant title before, keep it
            if (!uniqueVariantTitles.has(variantTitle)) {
              uniqueVariantTitles.set(variantTitle, true);
              return true;
            }

            // Otherwise, filter it out
            return false;
          });

          console.log(
            `Filtered from ${allProducts.length} to ${uniqueProducts.length} unique styles`
          );
          setStyleOptions(uniqueProducts.slice(0, 10));
        } else {
          console.error("GraphQL Errors:", response.errors);
          setStyleOptions([]);
        }
      } catch (error) {
        console.error("Error loading style options:", error);
        setStyleOptions([]);
      } finally {
        setStylesLoading(false);
      }
    };

    loadStyleOptions();

    // Load collections for banner and featured sections
    const loadCollections = async () => {
      setCollectionsLoading(true);
      try {
        const response = await fetchCollectionsList();

        if (response.success && response.data?.collections?.nodes) {
          const allCollections = response.data.collections.nodes;

          // Log all collections for debugging
          console.log(
            "All collections:",
            allCollections.map((c) => ({
              handle: c.handle,
              title: c.title,
              hasImage: !!c.image,
              imageUrl: c.image?.originalSrc || "No image",
            }))
          );

          // Find the banner collection (mothers-day)
          const bannerColl = allCollections.find(
            (collection) => collection.handle === BANNER_COLLECTION_HANDLE
          );
          if (bannerColl) {
            setBannerCollection(bannerColl);
          }

          // Find the featured collections by handle
          const featured = FEATURED_COLLECTION_HANDLES.map((handle) => {
            const collection = allCollections.find((c) => c.handle === handle);
            if (!collection) {
              console.warn(`Collection with handle "${handle}" not found`);
            }
            return collection;
          }).filter(Boolean) as CollectionNode[];

          console.log(
            `Found ${featured.length} of ${FEATURED_COLLECTION_HANDLES.length} featured collections`
          );
          setFeaturedCollections(featured);
        }
      } catch (error) {
        console.error("Error loading collections:", error);
      } finally {
        setCollectionsLoading(false);
      }
    };

    loadCollections();
  }, []);

  const renderStyleCard = ({ item }: { item: ProductNode }) => {
    // Get the variant title if available
    const variantTitle =
      item.variants.edges.length > 0
        ? item.variants.edges[0].node.title
        : item.title;

    // Get the first image URL if available
    const imageUrl =
      item.images.edges.length > 0
        ? item.images.edges[0].node.url
        : IMAGES.BokittaImg1;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate("singleProduct", {
            productId: item.id,
            productTitle: item.title,
          });
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.cardTitleContainer}>
          <CustomText
            fontFamily="medium"
            fontSize={12}
            color={COLORS.black}
            style={styles.cardTitle}
            numberOfLines={2}
          >
            {variantTitle}
          </CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  // Hijab Description Component
  const HijabDescription = () => {
    const title = "Empowering Women, Empowering Modesty.";
    const description =
      "At Bokitta, we design premium ready-to-wear hijabs that celebrate every woman’s journey. Made with high-quality, breathable fabrics like Lenzing jersey, chiffon, and feather-light modal, our hijabs provide unmatched comfort and effortless elegance for all-day wear. Thoughtfully designed to flatter all face shapes, they are perfect for women from all walks of life. Confident, timeless, and effortlessly feminine, Bokitta is here to help you look and feel your best every single day. Discover the perfect hijab for your lifestyle today.";

    return (
      <View style={styles.Descriptionsection}>
        <CustomText
          fontFamily="black"
          fontSize={16}
          color={COLORS.black}
          style={[styles.text, { width: "80%" }]}
        >
          {title}
        </CustomText>
        <CustomText
          fontFamily="regular"
          fontSize={12}
          color={COLORS.Grey}
          style={[styles.text, { lineHeight: 20 }]}
        >
          {description}
        </CustomText>
      </View>
    );
  };

  // New Subscription Section Component (Based on the Image)
  // const SubscriptionSection = () => {
  //   return (
  //     <View style={styles.subscriptionSection}>
  //       <CustomText
  //         fontFamily="bold"
  //         fontSize={12}
  //         color={COLORS.white}
  //         style={styles.subscriptionTitle}
  //       >
  //         BECOME AN INSIDER!
  //       </CustomText>
  //       <CustomText
  //         fontFamily="regular"
  //         fontSize={12}
  //         color={COLORS.white}
  //         style={styles.subscriptionDescription}
  //       >
  //         Subscribe to get special offers, free giveaways, and
  //         once-in-a-lifetime deals.
  //       </CustomText>
  //       <View style={styles.subscriptionForm}>
  //         <TextInput
  //           style={styles.emailInput}
  //           value={email}
  //           onChangeText={(text) => setEmail(text.trimStart())}
  //           placeholder="Email"
  //           placeholderTextColor={COLORS.Grey}
  //           keyboardType="email-address"
  //         />

  //         <TouchableOpacity style={styles.subscribeButton} activeOpacity={0.8}>
  //           <CustomText
  //             fontFamily="medium"
  //             fontSize={14}
  //             color={COLORS.white}
  //             style={styles.subscribeButtonText}
  //           >
  //             Subscribe
  //           </CustomText>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // };

  const renderPromotionalSection = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.itemContainer, { gap: verticalScale(10) }]}
      activeOpacity={0.8}
    >
      <Image
        source={item.image}
        style={styles.recommendedImage}
        resizeMode="cover"
      />
      <CustomText
        fontSize={12}
        fontFamily="regular"
        color={COLORS.black}
        style={{ textAlign: "center" }}
      >
        {item.title}
      </CustomText>
    </TouchableOpacity>
  );

  // Render Recommended Product
  const renderRecommendedProduct = ({
    item,
  }: {
    item: ProductRecommendation;
  }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        navigation.navigate("singleProduct", {
          productId: item.id,
          productTitle: item.title,
        });
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: item.images.edges[0]?.node.url,
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
        From {item.priceRange.minVariantPrice.amount}{" "}
        {item.priceRange.minVariantPrice.currencyCode}
      </CustomText>
    </TouchableOpacity>
  );

  const renderCollectionItem = ({ item }: { item: CollectionNode }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { gap: verticalScale(10) }]}
      activeOpacity={0.8}
      onPress={() => {
        // Navigate to the shop screen with this collection
        navigation.navigate("tabs", {
          screen: "shop",
          params: {
            collectionHandle: item.handle,
            collectionTitle: item.title,
          },
        });
      }}
    >
      <Image
        source={{
          uri: item.image?.originalSrc || "https://via.placeholder.com/150",
        }}
        style={styles.recommendedImage}
        resizeMode="cover"
      />
      <CustomText
        fontSize={12}
        fontFamily="regular"
        color={COLORS.black}
        style={{ textAlign: "center" }}
      >
        {item.title}
      </CustomText>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (isFocused && scrollContainerRef.current) {
      // Scroll to top when the screen is focused
      scrollContainerRef.current.scrollToTop();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={styles.safeAreaCont}
        edges={["top", "left", "right"]}
      >
        <Header
          onContinue={() => navigation.navigate("cart", { cartId: "36" })}
          onLogoPress={() => navigation.navigate("home")}
        />
        <KeyboardAvoidingContainer ref={scrollContainerRef}>
          <View style={styles.contentPadding}>
            {/* Banner */}
            <View style={styles.bannerBorder}>
              {collectionsLoading ? (
                <View style={[styles.imageBackground, styles.centerContent]}>
                  <ActivityIndicator size="small" color={COLORS.black} />
                </View>
              ) : (
                <ImageBackground
                  source={
                    bannerCollection?.image?.originalSrc
                      ? { uri: bannerCollection.image.originalSrc }
                      : IMAGES.EidCollection // Fallback image
                  }
                  style={styles.imageBackground}
                  onError={() => {
                    console.warn("Failed to load banner image, using fallback");
                  }}
                >
                  <View style={styles.overlay} />
                  <View style={styles.bannerContent}>
                    <View>
                      <CustomText
                        fontFamily="black"
                        fontSize={18}
                        style={styles.fontBold}
                      >
                        {bannerCollection?.title || "Mother's Day Collection"}
                      </CustomText>
                      <CustomText fontFamily="regular" fontSize={12}>
                        {bannerCollection?.description ||
                          "Celebrate with our special collection"}
                      </CustomText>
                    </View>
                    <TouchableOpacity
                      style={styles.arrowButton}
                      activeOpacity={0.8}
                      onPress={() => {
                        // Navigate to the banner collection
                        navigation.navigate("tabs", {
                          screen: "shop",
                          params: {
                            collectionHandle: BANNER_COLLECTION_HANDLE,
                            collectionTitle:
                              bannerCollection?.title ||
                              "Mother's Day Collection",
                          },
                        });
                      }}
                    >
                      <CustomIcon
                        Icon={ICONS.RightArrowIcon}
                        height={15}
                        width={15}
                      />
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              )}
            </View>

            {/* Promotional Sections (using featured collections) */}
            <View style={{}}>
              {collectionsLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={COLORS.black} />
                </View>
              ) : (
                <FlatList
                  data={featuredCollections}
                  renderItem={({ item }) => {
                    // Log image URL for debugging
                    const imageUrl = item.image?.originalSrc;
                    console.log(
                      `Rendering collection "${item.title}" with image:`,
                      imageUrl || "No image"
                    );

                    // Determine fallback image based on collection handle
                    let fallbackImage = IMAGES.BokittaImg1;
                    if (item.handle === "umrah-hajj-essentials-1")
                      fallbackImage = IMAGES.GiftIdeas;
                    else if (item.handle === "prints")
                      fallbackImage = IMAGES.ClassicPrints;
                    else if (item.handle === "accessories")
                      fallbackImage = IMAGES.GoldAccessories;
                    else if (item.handle === "monogram")
                      fallbackImage = IMAGES.MonogramImg;
                    else if (item.handle === "clearance")
                      fallbackImage = IMAGES.ClearanceImg;
                    else if (item.handle === "palestine-1")
                      fallbackImage = IMAGES.Palestineimg;

                    return (
                      <TouchableOpacity
                        style={[
                          styles.itemContainer,
                          { gap: verticalScale(10) },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          // Navigate to the shop screen with this collection
                          navigation.navigate("tabs", {
                            screen: "shop",
                            params: {
                              collectionHandle: item.handle,
                              collectionTitle: item.title,
                            },
                          });
                        }}
                      >
                        <Image
                          source={imageUrl ? { uri: imageUrl } : fallbackImage}
                          style={styles.recommendedImage}
                          resizeMode="cover"
                          onError={() => {
                            console.warn(
                              `Failed to load image for collection "${item.title}"`
                            );
                          }}
                        />
                        <CustomText
                          fontSize={12}
                          fontFamily="regular"
                          color={COLORS.black}
                          style={{ textAlign: "center" }}
                        >
                          {item.title}
                        </CustomText>
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  columnWrapperStyle={{
                    justifyContent: "space-between",
                    marginBottom: verticalScale(20),
                  }}
                  contentContainerStyle={{
                    paddingTop: verticalScale(20),
                  }}
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
              )}
            </View>

            {/* Style List */}
            <View style={styles.section}>
              <CustomText fontFamily="bold" fontSize={16} color={COLORS.black}>
                Click on the style you are looking for:
              </CustomText>
              {stylesLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color={COLORS.black} />
                </View>
              ) : (
                <FlatList
                  horizontal
                  data={styleOptions}
                  renderItem={renderStyleCard}
                  keyExtractor={(item) => item.id}
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>

            {/* Hijab Description */}
            <HijabDescription />

            {/* Recommended Products */}
            <View style={styles.section}>
              <CustomText fontFamily="bold" fontSize={16} color={COLORS.black}>
                Recommended Products
              </CustomText>
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={COLORS.black} />
                </View>
              ) : (
                <FlatList
                  data={recommendedProducts}
                  renderItem={renderRecommendedProduct}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  columnWrapperStyle={{
                    justifyContent: "space-between",
                    marginBottom: verticalScale(10),
                  }}
                  contentContainerStyle={{
                    paddingBottom: verticalScale(20),
                  }}
                />
              )}
            </View>
          </View>
          {/* New Subscription Section */}
          {/* {SubscriptionSection()} */}
          <Footer />
        </KeyboardAvoidingContainer>
      </SafeAreaView>
    </View>
  );
};

export default Home;

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  safeAreaCont: {
    flex: 1,
    paddingTop: verticalScale(10),
    gap: verticalScale(20),
  },
  contentPadding: {
    paddingHorizontal: horizontalScale(20),
  },
  bannerBorder: {
    borderTopWidth: 2,
    borderColor: COLORS.MediumGrey,
  },
  imageBackground: {
    width: "100%",
    height: hp(18),
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  bannerContent: {
    margin: horizontalScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrowButton: {
    backgroundColor: COLORS.DarkBrown,
    height: 24,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: verticalScale(20),
    gap: verticalScale(10),
  },
  card: {
    marginRight: horizontalScale(10),
    gap: verticalScale(5),
  },
  image: {
    width: horizontalScale(100),
    height: verticalScale(130),
  },
  Descriptionsection: {
    marginTop: verticalScale(20),
    marginHorizontal: horizontalScale(5),
    gap: verticalScale(5),
    alignItems: "center",
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    width: wp(43),
    overflow: "hidden",
  },
  recommendedImage: {
    width: "100%",
    height: verticalScale(210),
  },
  mt6: {
    marginTop: verticalScale(6),
  },
  fontBold: {
    fontWeight: "700",
  },
  text: {
    textAlign: "center",
  },
  // New Subscription Section Styles
  subscriptionSection: {
    backgroundColor: COLORS.black,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(30),
    alignItems: "center",
  },
  subscriptionTitle: {
    marginBottom: verticalScale(8),
    letterSpacing: 2,
  },
  subscriptionDescription: {
    textAlign: "center",
    marginBottom: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    letterSpacing: 2,
  },
  subscriptionForm: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emailInput: {
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(10),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: COLORS.checkgrey,
    width: wp(50),
    fontSize: 12,
    color: COLORS.checkgrey,
  },
  subscribeButton: {
    backgroundColor: COLORS.DarkBrown,
    borderWidth: 1,
    borderColor: COLORS.DarkBrown,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
  },
  subscribeButtonText: {
    textAlign: "center",
  },
  loaderContainer: {
    height: verticalScale(200),
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitleContainer: {
    width: horizontalScale(100),
    alignItems: "center",
  },
  cardTitle: {
    textAlign: "center",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: verticalScale(20),
    alignItems: "center",
  },
});
