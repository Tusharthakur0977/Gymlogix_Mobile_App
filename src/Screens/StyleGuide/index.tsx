import React, { FC, useEffect, useRef } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale, wp } from "../../Utilities/Metrics";
import { StyleGuideScreenProps } from "../../Typings/route";
import Header from "../../Components/Header";
import { CustomText } from "../../Components/CustomText";
import IMAGES from "../../Assets/Images";
import Footer from "../../Components/Footer";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import CustomButton from "../../Components/CustomButton";
import { useIsFocused } from "@react-navigation/native";
import {
  KeyboardAvoidingContainer,
  KeyboardAvoidingContainerRef,
} from "../../Components/KeyboardAvoidingComponent";

// Sample data for the FlatList
const hijabData = [
  {
    id: "1",
    title: "Voila Mini",
    description: "No Chest Coverage",
    details: ["Face Size: 55cm to 65cm", "45cm from Chin to Chest"],
    image: IMAGES.BukketHats,
  },
  {
    id: "2",
    title: "Voila",
    description: "Little Chest Coverage",
    details: ["Face Size: 55cm to 65cm", "45cm from Chin to Chest"],
    image: IMAGES.BokittaImg1,
  },
  {
    id: "3",
    title: "Voila Maxi",
    description: "Medium Chest Coverage",
    details: ["Face Size: 55cm to 65cm", "45cm from Chin to Chest"],
    image: IMAGES.BokittaImg6,
  },
];
const ChicHijabData = [
  {
    id: "1",
    title: "Chic Mini",
    description: "Little Chest Coverage",
    details: ["Face Size = 53cm to 65cm", "50cm from Chin to Chest"],
    image: IMAGES.GirlImage,
  },
  {
    id: "2",
    title: "Chic",
    description: "Medium Chest Coverage",
    details: ["Face Size = 55cm to 65cm", "65cm from Chin to Chest"],
    image: IMAGES.BokittaImg8,
  },
  {
    id: "3",
    title: "Chic Maxi",
    description: "Full Chest Coverage",
    details: ["Face Size = 55cm to 65cm", "75cm from Chin to Chest"],
    image: IMAGES.BokittaImg7,
  },
];

const TajData = [
  {
    id: "1",
    title: "Taj",
    description: "Covers Above the Chest",
    details: ["Length = 55cm", "Face Size = 55cm to 62cm"],
    image: IMAGES.PromotionalImg,
  },
  {
    id: "2",
    title: "Chic",
    description: "Full Chest Coverage",
    details: ["Length = 66cm", "Face Size = 55cm to 65cm"],
    image: IMAGES.BokittaImg2,
  },
];
//freestyleSection Data
const freestyleSection = [
  {
    id: "1",
    title: "2-in-1 Matching B-Inner",
    image: IMAGES.PinkHijaab,
  },
  {
    id: "2",
    title: "2-in-1 Matching X-Inner",
    image: IMAGES.imgae5,
  },
];

const StyleGuide: FC<StyleGuideScreenProps> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const scrollContainerRef = useRef<KeyboardAvoidingContainerRef>(null);

  // Render each item in the FlatList
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.textContainer}>
        <CustomText fontFamily="medium" fontSize={16} color={COLORS.black}>
          {item.title}
        </CustomText>
        <CustomText fontFamily="medium" fontSize={12} color={COLORS.black}>
          {item.description}
        </CustomText>
        {item.details.map((detail: string, index: number) => (
          <CustomText
            key={index}
            fontFamily="regular"
            fontSize={10}
            color={COLORS.DarkGrey}
          >
            • {detail}
          </CustomText>
        ))}
      </View>
    </View>
  );

  const renderTajItems = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.textContainer}>
        <CustomText fontFamily="medium" fontSize={16} color={COLORS.black}>
          {item.title}
        </CustomText>
        <CustomText fontFamily="medium" fontSize={12} color={COLORS.black}>
          {item.description}
        </CustomText>
        {item.details.map((detail: string, index: number) => (
          <CustomText
            key={index}
            fontFamily="regular"
            fontSize={10}
            color={COLORS.DarkGrey}
          >
            • {detail}
          </CustomText>
        ))}
      </View>
    </View>
  );

  const renderFreestyleSection = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.freeStyleContainer, { gap: verticalScale(10) }]}
      activeOpacity={0.8}
    >
      <Image
        source={item.image}
        style={styles.recommendedImage}
        resizeMode="cover"
      />
      <CustomText fontSize={12} fontFamily="regular" color={COLORS.black}>
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
        edges={["top", "left", "right"]}
        style={styles.safeAreaCont}
      >
        <Header
          onContinue={() => navigation.navigate("cart", { cartId: "36" })}
          onLogoPress={() => navigation.navigate("home")}
        />
        {/* Use KeyboardAvoidingContainer to wrap the entire content */}
        <KeyboardAvoidingContainer
          ref={scrollContainerRef}
          bounce={false}
          style={styles.scrollContent}
        >
          <View style={styles.content}>
            {/* Top Heading Section */}
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.black}>
              Find Your Perfect Fit
            </CustomText>

            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.black}
              style={styles.description}
            >
              Discover the unique styles of Bokitta's ready-to-wear hijabs —
              designed for comfort, elegance, and ease.
            </CustomText>

            <View
              style={[styles.OuterContainer, { marginTop: verticalScale(20) }]}
            >
              {/* VOILA Section */}
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                VOILA
              </CustomText>
              {/* Bullet Points */}
              <View style={styles.bulletContainer}>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Designed for a semi-instant wrap-around effect.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Pre-sewn with built-in inner cap — no pins needed.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Gives you full coverage with a graceful, modern silhouette.
                  </CustomText>
                </View>
              </View>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                <Image
                  source={IMAGES.VoltaImage}
                  style={styles.imageLeft}
                  resizeMode="contain"
                />
                <Image
                  source={IMAGES.imgae5}
                  style={styles.imageRight}
                  resizeMode="cover"
                />
              </View>
              {/* VOILA Is Available in 3 Lengths */}
              <View>
                <CustomText
                  fontFamily="medium"
                  fontSize={16}
                  color={COLORS.black}
                  style={styles.voilaLengthsText}
                >
                  VOILA Is Available in 3 Lengths
                </CustomText>

                {/* FlatList */}
                <FlatList
                  data={hijabData}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.list}
                  scrollEnabled={false}
                />
              </View>
              <View>
                <CustomText
                  fontFamily="regular"
                  fontSize={16}
                  color={COLORS.black}
                  style={{ textAlign: "center" }}
                >
                  Voila Hijab Tutorial
                </CustomText>
                <ImageBackground
                  source={IMAGES.PromotionalImg}
                  style={{
                    width: "100%",
                    height: horizontalScale(151),
                    justifyContent: "center",
                    alignItems: "center",
                    marginVertical: verticalScale(10),
                  }}
                >
                  <CustomIcon
                    Icon={ICONS.YouTubePlayIcon}
                    height={25}
                    width={35}
                  />
                </ImageBackground>
              </View>
              <CustomButton
                label={"Shop Voila Now"}
                onPress={() => {}}
                containerStyle={{ marginTop: verticalScale(10) }}
              />
            </View>

            <View style={styles.OuterContainer}>
              {/* Chic Section */}
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                Chic
              </CustomText>
              {/* Bullet Points */}
              <View style={styles.bulletContainer}>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Features a structured, face-framing look with clean lines.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Comes pre-sewn with a built-in inner for easy wear.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Ideal for both formal occasions and professional settings.
                  </CustomText>
                </View>
              </View>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                <Image
                  source={IMAGES.ChicSeries}
                  style={styles.imageLeft}
                  resizeMode="contain"
                />
                <Image
                  source={IMAGES.imgae6}
                  style={styles.imageRight}
                  resizeMode="cover"
                />
              </View>
              {/* VOILA Is Available in 3 Lengths */}
              <View>
                <CustomText
                  fontFamily="medium"
                  fontSize={16}
                  color={COLORS.black}
                  style={styles.voilaLengthsText}
                >
                  VOILA Is Available in 3 Lengths
                </CustomText>

                {/* FlatList */}
                <FlatList
                  data={ChicHijabData}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.list}
                  scrollEnabled={false}
                />
              </View>
              <CustomButton
                label={"Shop Chic Now"}
                onPress={() => {}}
                containerStyle={{ marginTop: verticalScale(10) }}
              />
            </View>
            <View style={styles.OuterContainer}>
              {/* Freestyle Section */}
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                Freestyle
              </CustomText>
              {/* Bullet Points */}
              <View style={styles.bulletContainer}>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    A classic rectangular scarf with a matching inner cap.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Unstitched and totally customizable to your style.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Perfect for hijabis who love to experiment with different
                    wraps and looks.
                  </CustomText>
                </View>
              </View>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                <Image
                  source={IMAGES.imgae}
                  style={styles.imageLeft}
                  resizeMode="contain"
                />
                <Image
                  source={IMAGES.freeStyle}
                  style={styles.imageRight}
                  resizeMode="cover"
                />
              </View>
              <View style={{ paddingTop: verticalScale(20) }}>
                <CustomText
                  fontFamily="regular"
                  fontSize={16}
                  color={COLORS.black}
                >
                  Comes with
                </CustomText>
                <FlatList
                  data={freestyleSection}
                  renderItem={renderFreestyleSection}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  columnWrapperStyle={{
                    justifyContent: "space-between",
                    marginBottom: verticalScale(20),
                  }}
                  contentContainerStyle={{
                    paddingTop: verticalScale(10),
                  }}
                />
              </View>

              <View>
                <CustomText
                  fontFamily="regular"
                  fontSize={16}
                  color={COLORS.black}
                  style={{ textAlign: "center" }}
                >
                  Freestyle Hijab Tutorial
                </CustomText>
                <ImageBackground
                  source={IMAGES.PromotionalImg}
                  style={{
                    width: "100%",
                    height: horizontalScale(151),
                    justifyContent: "center",
                    alignItems: "center",
                    marginVertical: verticalScale(10),
                  }}
                >
                  <CustomIcon
                    Icon={ICONS.YouTubePlayIcon}
                    height={25}
                    width={35}
                  />
                </ImageBackground>
              </View>
              <CustomButton
                label={"Shop Freestyle Now"}
                onPress={() => {}}
                containerStyle={{ marginTop: verticalScale(10) }}
              />
            </View>
            <View style={styles.OuterContainer}>
              {/* Carré Section */}
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                Carré
              </CustomText>
              {/* Bullet Points */}
              <View style={styles.bulletContainer}>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Designed in a square shape, inspired by Parisian style.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Pre-sewn for quick and polished wear — no pins needed.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Offers a modern, modest look with just the right amount of
                    structure.
                  </CustomText>
                </View>
              </View>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                <Image
                  source={IMAGES.Carre}
                  style={styles.imageLeft}
                  resizeMode="contain"
                />
                <Image
                  source={IMAGES.image7}
                  style={styles.imageRight}
                  resizeMode="cover"
                />
              </View>
              <CustomButton
                label={"Shop Carré Now"}
                onPress={() => {}}
                containerStyle={{ marginTop: verticalScale(20) }}
              />
            </View>
            <View style={styles.OuterContainer}>
              {/* Posh Section */}
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                Posh
              </CustomText>
              {/* Bullet Points */}
              <View style={styles.bulletContainer}>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Crafted from luxurious fabric for a sleek, sophisticated
                    look.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Comes pre-sewn with an integrated inner cap for easy, secure
                    wear.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Ideal for special events or when you want to add an extra
                    touch of class.
                  </CustomText>
                </View>
              </View>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                <Image
                  source={IMAGES.PoshStructure}
                  style={styles.imageLeft}
                  resizeMode="contain"
                />
                <Image
                  source={IMAGES.image8}
                  style={styles.imageRight}
                  resizeMode="cover"
                />
              </View>
              <CustomButton
                label={"Shop Posh Now"}
                onPress={() => {}}
                containerStyle={{ marginTop: verticalScale(20) }}
              />
            </View>
            <View style={styles.OuterContainer}>
              {/* Vogue Section */}
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                Vogue
              </CustomText>
              {/* Bullet Points */}
              <View style={styles.bulletContainer}>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Luxurious draping that adds volume and style with ease.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Pre-sewn design with a built-in inner for quick and
                    comfortable wear.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Perfect for those who love a high-fashion look that still
                    offers full coverage.
                  </CustomText>
                </View>
              </View>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                <Image
                  source={IMAGES.VogueType}
                  style={styles.imageLeft}
                  resizeMode="contain"
                />
                <Image
                  source={IMAGES.image9}
                  style={styles.imageRight}
                  resizeMode="cover"
                />
              </View>
              <CustomButton
                label={"Shop Vogue Now"}
                onPress={() => {}}
                containerStyle={{ marginTop: verticalScale(20) }}
              />
            </View>
            <View style={styles.OuterContainer}>
              {/* Taj Section */}
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                Taj
              </CustomText>
              {/* Bullet Points */}
              <View style={styles.bulletContainer}>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Pre-sewn design with a built-in inner cap for effortless
                    wear.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Features unique draping that frames the face beautifully.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Perfect for formal events or when you want to feel like
                    royalty every day.
                  </CustomText>
                </View>
              </View>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                <Image
                  source={IMAGES.TajType}
                  style={styles.imageLeft}
                  resizeMode="contain"
                />
                <Image
                  source={IMAGES.image10}
                  style={styles.imageRight}
                  resizeMode="cover"
                />
              </View>
              {/* Taj Is Available in 2 Lengths */}
              <View>
                <CustomText
                  fontFamily="medium"
                  fontSize={16}
                  color={COLORS.black}
                  style={styles.voilaLengthsText}
                >
                  Taj Is Available in 2 Lengths
                </CustomText>

                {/* FlatList */}
                <FlatList
                  data={TajData}
                  renderItem={renderTajItems}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.list}
                  scrollEnabled={false}
                />
              </View>
              <CustomButton
                label={"Shop Taj Now"}
                onPress={() => {}}
                containerStyle={{ marginTop: verticalScale(20) }}
              />
            </View>
            <View style={styles.OuterContainer}>
              {/* Jolie Section */}
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                Jolie
              </CustomText>
              {/* Bullet Points */}
              <View style={styles.bulletContainer}>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Features lightweight, breathable fabric for all-day comfort.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Pre-sewn with a built-in inner cap for easy wear without
                    pins.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Perfect for a casual yet refined look, ideal for everyday
                    wear.
                  </CustomText>
                </View>
              </View>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                <Image
                  source={IMAGES.JoriaType}
                  style={styles.imageLeft}
                  resizeMode="contain"
                />
                <Image
                  source={IMAGES.image11}
                  style={styles.imageRight}
                  resizeMode="cover"
                />
              </View>
              <CustomButton
                label={"Shop Jolie Now"}
                onPress={() => {}}
                containerStyle={{ marginTop: verticalScale(20) }}
              />
            </View>
            <View style={styles.OuterContainer}>
              {/* Capshawl Section */}
              <CustomText
                fontFamily="medium"
                fontSize={16}
                color={COLORS.black}
              >
                Capshawl
              </CustomText>
              {/* Bullet Points */}
              <View style={styles.bulletContainer}>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Combines a built-in inner cap with a detached shawl layer.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Lets you wrap and style freely while keeping your hijab
                    secure.
                  </CustomText>
                </View>
                <View style={styles.bulletRow}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    •
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    Great for those who want flexibility with the ease of a
                    ready-to-wear base.
                  </CustomText>
                </View>
              </View>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                <Image
                  source={IMAGES.CapShawlType}
                  style={styles.imageLeft}
                  resizeMode="contain"
                />
                <Image
                  source={IMAGES.image12}
                  style={styles.imageRight}
                  resizeMode="cover"
                />
              </View>
              <CustomButton
                label={"Shop Capshawl Now"}
                onPress={() => {}}
                containerStyle={{ marginTop: verticalScale(20) }}
              />
            </View>
          </View>
          <Footer />
        </KeyboardAvoidingContainer>
      </SafeAreaView>
    </View>
  );
};

export default StyleGuide;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeAreaCont: {
    flex: 1,
    paddingTop: verticalScale(10),
    gap: verticalScale(20),
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(5),
  },
  description: {
    marginTop: verticalScale(3),
    lineHeight: 18,
    width: "95%",
  },
  OuterContainer: {
    backgroundColor: COLORS.offGrey,
    padding: horizontalScale(16),
    marginVertical: verticalScale(10),
  },
  bulletContainer: {
    marginTop: verticalScale(12),
    gap: verticalScale(8),
    paddingLeft: horizontalScale(6),
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: horizontalScale(6),
  },
  imagesContainer: {
    flexDirection: "row",
    marginTop: verticalScale(10),
    alignItems: "flex-start",
    justifyContent: "space-between",
    position: "relative",
  },
  imageLeft: {
    width: horizontalScale(140),
    height: verticalScale(188),
    backgroundColor: COLORS.white,
    zIndex: 2,
    marginRight: horizontalScale(-20),
    marginTop: verticalScale(7),
  },
  imageRight: {
    width: horizontalScale(182),
    height: verticalScale(202),
    zIndex: 1,
    marginRight: horizontalScale(10),
  },
  voilaLengthsText: {
    marginTop: verticalScale(20),
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(5),
  },
  image: {
    width: 117,
    height: 118,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    gap: verticalScale(5),
  },
  title: {
    fontFamily: "medium",
    fontSize: 16,
    color: COLORS.black,
  },
  list: {
    paddingBottom: verticalScale(10),
  },
  recommendedImage: {
    width: "90%",
    height: verticalScale(185),
  },
  freeStyleContainer: {
    width: wp(43),
    overflow: "hidden",
  },
});
