import React, { FC, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Image,
  Platform,
  ImageSourcePropType,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector } from "../../Redux/store";
import { setIsSideDrawerVisible } from "../../Redux/slices/modalSlice";
import { CustomText } from "../CustomText";
import IMAGES from "../../Assets/Images";
import CustomIcon from "../CustomIcon";
import ICONS from "../../Assets/Icons";
import COLORS from "../../Utilities/Colors";
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from "../../Utilities/Metrics";

// Define the type for the navigation prop with proper typing for params
type NavigationProp = {
  navigate: (
    screen: string,
    params?: {
      screen?: string;
      params?: {
        collectionHandle?: string;
        collectionTitle?: string;
        cartId?: string;
      };
      collectionHandle?: string;
      collectionTitle?: string;
    }
  ) => void;
};

// Define the type for the SideDrawer props
type SideDrawerProps = {};

// Define the MenuItem interface with proper typing
interface MenuItem {
  title: string;
  subItems?: string[];
  subCategories?: { title: string; items: string[] }[];
  collections?: string[];
}

// Define the CollectionItem interface with proper image typing
interface CollectionItem {
  id: string;
  title: string;
  image: ImageSourcePropType;
}

// Define the menu items with proper typing
const menuItems: MenuItem[] = [
  {
    title: "New",
    subItems: ["New"],
  },
  {
    title: "Shop Hijabs",
    subCategories: [
      {
        title: "Trending",
        items: [
          "Restocks!",
          "New Arrivals",
          "Mothers Day Gift Ideas",
          "Printed Woven Modal Hijabs",
          "Basic Hijab Sets Under $18",
          "Palestine Prints - 100% Donation",
        ],
      },
      {
        title: "Plain Instants",
        items: [
          "Sports Hijabs",
          "Jersey Hijabs",
          "Modal Hijabs",
          "Satin Hijabs",
          "Gentle Everyday Hijabs",
          "Chiffon Essentials",
          "Ombre Hijabs",
          "Embellished Hijabs",
          "Butti Textured Hijabs",
          "Premium Plain Hijabs",
          "Crepe Hijabs Under $10",
          "Lining Hijab",
          "Slip-On Girls",
        ],
      },
      {
        title: "Printed Instants",
        items: [
          "New Arrival",
          "Best Seller Prints",
          "Premium Prints",
          "Modal Prints",
          "> Shop By Collection",
        ],
      },
      {
        title: "Non-Instant Hijabs",
        items: [
          "Printed Shawls",
          "Solid Color Shawls",
          "Printed Square Scarves",
          "Solid Color Square Scarves",
        ],
      },
    ],
  },
  {
    title: "Collections",
    collections: [
      "Queen Of Hearts",
      "Mother's Day 2025",
      "Jannah",
      "Noor",
      "Ramadan 2025",
      "Abaya",
      "Women's Prayer Sets",
      "Monogram",
      "Bokitta X Hanan's Corner - Coffee Collection",
      "Jersey & Woven Modals",
      "Basics",
      "Palestine",
      "Classics",
      "Ikat",
      "Vintage Fields",
      "Color Couture",
      "Plain Chiffon",
      "Active/Sports",
      "Modal/Jersey Collection",
      ">> View All Collections",
    ],
  },
  {
    title: "Accessories",
    subItems: [
      "Hijab Underscarves & Inner Caps",
      "Magnetic Hijab Pins",
      "Tote Bags",
      "Hijab Tapes",
      "Bucket Hats",
      "Hijab Friendly Masks",
      "Balaclava",
    ],
  },
  {
    title: "Clothing & Prayer Sets",
    subItems: [
      "Modest Dresses & Abayas",
      "Prayer Sets",
      "Tops & Shirts",
      "Pants & Skirts",
      "Outwear",
      "Innerwear & Basics",
    ],
  },
  {
    title: "Sale",
    subItems: ["Offers", "Clearance"],
  },
  {
    title: "Terms Of Use",
    subItems: ["Terms of Service", "Privacy & Cookies", "Refund Policy"],
  },
];

// Define the collections with proper typing
const collections: CollectionItem[] = [
  {
    id: "1",
    title: "Queen of Hearts",
    image: IMAGES.NewCollection1,
  },
  {
    id: "2",
    title: "Plain Chiffon",
    image: IMAGES.NewCollection2,
  },
  {
    id: "3",
    title: "Jannah",
    image: IMAGES.NewCollection3,
  },
];

// Define a mapping for Clothing & Prayer Sets items to their collection handles
const clothingCollectionHandles: { [key: string]: string } = {
  "Modest Dresses & Abayas": "abaya",
  "Prayer Sets": "prayer-sets",
  "Tops & Shirts": "tops-shirts",
  "Pants & Skirts": "pants",
  Outwear: "outwear",
  "Innerwear & Basics": "innerwear",
};

// Define a mapping for Accessories items to their collection handles
const accessoriesCollectionHandles: { [key: string]: string } = {
  "Hijab Underscarves & Inner Caps": "inners",
  "Magnetic Hijab Pins": "stylers",
  "Tote Bags": "tote-bags",
  "Hijab Tapes": "tapes",
  "Bucket Hats": "bucket-hat",
  "Hijab Friendly Masks": "face-masks",
  Balaclava: "balaclava",
};

// Define mappings for Shop Hijabs subcategories to their collection handles
const trendingCollectionHandles: { [key: string]: string } = {
  "Restocks!": "restocks",
  "New Arrivals": "new-printed-hijabs",
  "Mothers Day Gift Ideas": "mothers2025",
  "Printed Woven Modal Hijabs": "modal",
  "Basic Hijab Sets Under $18": "basics-1",
  "Palestine Prints - 100% Donation": "palestine-1",
};

const plainInstantsCollectionHandles: { [key: string]: string } = {
  "Sports Hijabs": "active-sports",
  "Jersey Hijabs": "jersey-plain",
  "Modal Hijabs": "modal-plain",
  "Satin Hijabs": "satin",
  "Gentle Everyday Hijabs": "basics-1",
  "Chiffon Essentials": "plain-crinkled-without-shawl",
  "Ombre Hijabs": "gardients",
  "Embellished Hijabs": "crystal-embellished",
  "Butti Textured Hijabs": "textured-butti",
  "Premium Plain Hijabs": "evening",
  "Crepe Hijabs Under $10": "essentials",
  "Lining Hijab": "inners",
  "Slip-On Girls": "slipon",
};

const printedInstantsCollectionHandles: { [key: string]: string } = {
  "New Arrival": "new-printed-hijabs",
  "Best Seller Prints": "best-seller-printed",
  "Premium Prints": "premium-prints",
  "Modal Prints": "modal",
  "> Shop By Collection": "collections",
};

const nonInstantHijabsCollectionHandles: { [key: string]: string } = {
  "Printed Shawls": "shawls-print",
  "Solid Color Shawls": "shawl-plain",
  "Printed Square Scarves": "square-print",
  "Solid Color Square Scarves": "square-plain",
};

// Define the SideDrawer component with proper typing
const SideDrawer: FC<SideDrawerProps> = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const isSideDrawerVisible = useAppSelector(
    (state) => state.modals.isSideDrawerVisible
  );
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});

  const closeDrawer = (): void => {
    dispatch(setIsSideDrawerVisible(false));
  };

  const openDrawer = (): void => {
    dispatch(setIsSideDrawerVisible(true));
  };

  const toggleDropdown = (item: string): void => {
    setExpandedItems((prev) => {
      const isCurrentlyExpanded = prev[item];
      return isCurrentlyExpanded ? {} : { [item]: true };
    });
  };

  useEffect(() => {
    if (isSideDrawerVisible === true) {
      setExpandedItems({});
    }
  }, [isSideDrawerVisible]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (
      _e: GestureResponderEvent,
      gestureState: PanResponderGestureState
    ) => gestureState.dx > 20 && gestureState.moveX < 40,
    onPanResponderRelease: () => {
      openDrawer();
    },
  });

  const handleNavigation = (title: string, collectionHandle?: string): void => {
    closeDrawer();

    if (title === "Shop Hijabs") {
      // Navigate to the main shop screen
      navigation.navigate("shop");
    } else if (title === "Collections") {
      // Navigate to the collections screen
      navigation.navigate("collection");
    } else if (title === "New") {
      // Navigate to new arrivals
      navigation.navigate("tabs", {
        screen: "shop",
        params: {
          collectionHandle: "new-arrivals",
          collectionTitle: "New Arrivals",
        },
      });
    } else if (title === "Terms of Service") {
      // Navigate to Terms of Service screen
      navigation.navigate("termsOfServices");
    } else if (title === "Privacy & Cookies") {
      // Navigate to Privacy & Cookies screen
      navigation.navigate("privacyCookies");
    } else if (title === "Refund Policy") {
      // Navigate to Refund Policy screen
      navigation.navigate("refundPolicy");
    } else if (title === "Offers") {
      // Navigate to sale collection
      navigation.navigate("tabs", {
        screen: "shop",
        params: {
          collectionHandle: "sale",
          collectionTitle: "Sale Items",
        },
      });
    } else if (title === "Clearance") {
      // Navigate to clearance collection
      navigation.navigate("tabs", {
        screen: "shop",
        params: {
          collectionHandle: "clearance",
          collectionTitle: "Clearance Items",
        },
      });
    } else if (title === "Clothing & Prayer Sets") {
      // Navigate to the collection screen with clothing filter
      navigation.navigate("collection", {
        collectionHandle: "clothing",
        collectionTitle: "Clothing & Prayer Sets",
      });
    } else if (title === "Accessories") {
      // Navigate to the collection screen with accessories filter
      navigation.navigate("collection", {
        collectionHandle: "accessories",
        collectionTitle: "Accessories",
      });
    } else if (collectionHandle) {
      // Navigate to shop with the specific collection handle
      console.log("Navigating to shop with params:", {
        collectionHandle,
        collectionTitle: title,
      });

      navigation.navigate("tabs", {
        screen: "shop",
        params: {
          collectionHandle: collectionHandle,
          collectionTitle: title,
        },
      });
    } else {
      // For any other menu items, try to navigate based on the title
      try {
        // Convert title to a potential screen name
        const screenName = title.toLowerCase().replace(/\s+/g, "-");
        console.log("Trying to navigate to screen:", screenName);

        // Try to navigate to a screen with the derived name
        navigation.navigate(screenName);
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback to shop screen if navigation fails
        navigation.navigate("shop");
      }
    }
  };

  const renderSubItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.subItem}
      activeOpacity={0.8}
      onPress={() => {
        // Handle navigation for Terms of Use items
        if (
          item === "Terms of Service" ||
          item === "Privacy & Cookies" ||
          item === "Refund Policy"
        ) {
          handleNavigation(item);
        } else if (item === "Offers" || item === "Clearance") {
          // Handle navigation for Sale items
          handleNavigation(item);
        } else if (clothingCollectionHandles[item]) {
          // Handle navigation for Clothing & Prayer Sets items
          navigation.navigate("tabs", {
            screen: "shop",
            params: {
              collectionHandle: clothingCollectionHandles[item],
              collectionTitle: item,
            },
          });
          closeDrawer();
        } else if (accessoriesCollectionHandles[item]) {
          // Handle navigation for Accessories items
          navigation.navigate("tabs", {
            screen: "shop",
            params: {
              collectionHandle: accessoriesCollectionHandles[item],
              collectionTitle: item,
            },
          });
          closeDrawer();
        } else {
          // For other items, just close the drawer for now
          closeDrawer();
        }
      }}
    >
      <CustomText
        fontFamily="regular"
        fontSize={14}
        color={COLORS.midnightgrey}
      >
        {item}
      </CustomText>
    </TouchableOpacity>
  );

  const renderCollectionItem = ({ item }: { item: CollectionItem }) => (
    <TouchableOpacity
      style={styles.collectionItem}
      activeOpacity={0.8}
      onPress={() => {
        // Navigate to the specific collection when clicked
        const collectionHandle = item.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-");

        console.log("Collection item clicked:", item.title);
        console.log("Navigating with handle:", collectionHandle);

        // Close drawer and navigate to the shop screen with the collection handle
        closeDrawer();
        navigation.navigate("tabs", {
          screen: "shop",
          params: {
            collectionHandle: collectionHandle,
            collectionTitle: item.title,
          },
        });
      }}
    >
      <Image
        source={item.image || IMAGES.LogoImage}
        style={styles.collectionImage}
      />
      <CustomText fontFamily="medium" fontSize={12} color={COLORS.black}>
        {item.title}
      </CustomText>
    </TouchableOpacity>
  );

  const renderSubCategory = ({
    item,
  }: {
    item: { title: string; items: string[] };
  }) => (
    <View style={styles.subCategoryContainer}>
      <CustomText
        fontFamily="bold"
        fontSize={14}
        color={COLORS.black}
        style={{ letterSpacing: 2 }}
      >
        {item.title.toUpperCase()}
      </CustomText>
      {item.items.map((subItem) => (
        <TouchableOpacity
          key={subItem}
          style={styles.subItem}
          activeOpacity={0.8}
          onPress={() => {
            // Special case for "Shop By Collection" - navigate to collections screen
            if (subItem === "> Shop By Collection") {
              navigation.navigate("collection");
              closeDrawer();
              return;
            }

            // Determine which collection handle mapping to use based on the category title
            let collectionHandle = "";

            if (
              item.title === "Trending" &&
              trendingCollectionHandles[subItem]
            ) {
              collectionHandle = trendingCollectionHandles[subItem];
            } else if (
              item.title === "Plain Instants" &&
              plainInstantsCollectionHandles[subItem]
            ) {
              collectionHandle = plainInstantsCollectionHandles[subItem];
            } else if (
              item.title === "Printed Instants" &&
              printedInstantsCollectionHandles[subItem]
            ) {
              collectionHandle = printedInstantsCollectionHandles[subItem];
            } else if (
              item.title === "Non-Instant Hijabs" &&
              nonInstantHijabsCollectionHandles[subItem]
            ) {
              collectionHandle = nonInstantHijabsCollectionHandles[subItem];
            }

            if (collectionHandle) {
              // Navigate to the shop screen with the specific collection handle
              navigation.navigate("tabs", {
                screen: "shop",
                params: {
                  collectionHandle: collectionHandle,
                  collectionTitle: subItem,
                },
              });
              closeDrawer();
            } else {
              // If no specific mapping is found, just close the drawer
              closeDrawer();
            }
          }}
        >
          <CustomText
            fontFamily="regular"
            fontSize={14}
            color={COLORS.midnightgrey}
          >
            {subItem}
          </CustomText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCollectionListItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.subItem}
      activeOpacity={0.8}
      onPress={() => {
        if (item === ">> View All Collections") {
          handleNavigation("Collections");
        } else {
          // Convert collection name to a handle format (lowercase, hyphenated)
          const collectionHandle = item
            .toLowerCase()
            .replace(/[^\w\s]/gi, "")
            .replace(/\s+/g, "-");

          handleNavigation(item, collectionHandle);
        }
      }}
    >
      <CustomText
        fontFamily="regular"
        fontSize={14}
        color={COLORS.midnightgrey}
      >
        {item}
      </CustomText>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const hasSubContent =
      item.subItems ||
      item.subCategories ||
      item.collections ||
      item.title === "New";

    return (
      <View>
        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              borderBottomWidth:
                hasSubContent && expandedItems[item.title] ? 0 : 1,
              borderColor: COLORS.lightGrey,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => {
            if (hasSubContent) {
              // If the item has sub-content, toggle its dropdown
              toggleDropdown(item.title);
            } else {
              // Otherwise, navigate directly
              handleNavigation(item.title);
            }
          }}
        >
          <CustomText fontFamily="medium" fontSize={16} color={COLORS.black}>
            {item.title}
          </CustomText>
          {hasSubContent && (
            <CustomIcon
              Icon={
                expandedItems[item.title]
                  ? ICONS.DropUpIcon
                  : ICONS.DropDownIcon
              }
              height={20}
              width={20}
            />
          )}
        </TouchableOpacity>

        {/* Render appropriate sub-content based on the menu item type */}
        {expandedItems[item.title] && item.title === "New" && (
          <View style={styles.collectionsContainer}>
            <FlatList
              data={collections.slice(0, 3)}
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderCollectionItem}
              contentContainerStyle={{}}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => {
                    console.log("View All Collections clicked");
                    closeDrawer();
                    navigation.navigate("collection");
                  }}
                >
                  <CustomText
                    fontFamily="bold"
                    fontSize={12}
                    color={COLORS.white}
                    style={{ fontWeight: "700" }}
                  >
                    VIEW ALL COLLECTIONS
                  </CustomText>
                  <CustomIcon Icon={ICONS.RightArrow} height={16} width={16} />
                </TouchableOpacity>
              }
            />
          </View>
        )}

        {expandedItems[item.title] && item.subItems && item.title !== "New" && (
          <View style={styles.subItemsContainer}>
            {item.subItems.map((subItem) => (
              <View key={subItem}>{renderSubItem({ item: subItem })}</View>
            ))}
          </View>
        )}

        {expandedItems[item.title] &&
          item.subCategories &&
          item.title === "Shop Hijabs" && (
            <View style={styles.subCategoriesContainer}>
              <FlatList
                data={item.subCategories}
                renderItem={renderSubCategory}
                horizontal
                bounces={false}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(subCat) => subCat.title}
              />
            </View>
          )}

        {expandedItems[item.title] &&
          item.collections &&
          item.title === "Collections" && (
            <View style={styles.collectionsListContainer}>
              <FlatList
                data={item.collections}
                bounces={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={(collection) => collection}
                renderItem={renderCollectionListItem}
              />
            </View>
          )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <Modal
        isVisible={isSideDrawerVisible}
        onBackdropPress={closeDrawer}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        style={styles.modal}
        backdropOpacity={0.2}
      >
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: verticalScale(20),
            }}
          >
            <View style={styles.header}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate("home");
                }}
              >
                <Image
                  source={IMAGES.LogoImage}
                  style={{ width: 99, height: 12 }}
                />
              </TouchableOpacity>
              <CustomIcon
                Icon={ICONS.CrossIcon}
                height={20}
                width={20}
                onPress={closeDrawer}
              />
            </View>

            <FlatList
              data={menuItems}
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.title}
              renderItem={renderMenuItem}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default SideDrawer;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.white,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  subItemsContainer: {
    paddingHorizontal: horizontalScale(10),
  },
  subItem: {
    paddingVertical: 10,
  },
  collectionsContainer: {
    paddingVertical: 10,
  },
  collectionItem: {
    gap: verticalScale(5),
    paddingBottom: verticalScale(10),
  },
  collectionImage: {
    width: wp(90),
    height: hp(16),
    resizeMode: "cover",
  },
  viewAllButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  subCategoriesContainer: {
    paddingVertical: 10,
  },
  subCategoryContainer: {
    flex: 1,
    paddingRight: horizontalScale(15),
    marginBottom: verticalScale(10),
  },
  collectionsListContainer: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: 10,
  },
});
