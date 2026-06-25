import React, { useState } from "react";
import { Image, Modal, TouchableOpacity, View } from "react-native";
import WebView from "react-native-webview";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ICONS from "../Assets/Icons";
import { setIsCountryPickerVisible } from "../Redux/slices/modalSlice";
import { useAppSelector } from "../Redux/store";
import COLORS from "../Utilities/Colors";
import { horizontalScale, verticalScale } from "../Utilities/Metrics";
import CustomIcon from "./CustomIcon";
import { CustomText } from "./CustomText";
import { MainStackParams } from "../Typings/route";

const footerSections = [
  {
    title: "SERVICES",
    subItems: ["FAQ", "Find A Store"],
  },
  {
    title: "SHOPPING GUIDE",
    subItems: [
      "The Complete Hijab Design Style Guide",
      "How to Buy",
      "Payment Options",
      "Shipping & Delivery",
      "Track Your Order",
      "Returns & Exchange Policy",
    ],
  },
  {
    title: "BOKITTA",
    subItems: [
      "Our Story",
      "Our Patents",
      "Loyalty Program",
      "Startup program",
      "Affiliates program",
      "Refer a Friend",
      "Blog & Fashion Tips",
    ],
  },
  {
    title: "LEGAL",
    subItems: ["Terms of Service", "Privacy & Cookies", "Refund policy"],
  },
];

const Footer = () => {
  const dispatch = useDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const isCountryPickerVisible = useAppSelector(
    (state) => state.modals.isCountryPickerVisible
  );
  const { selectedCountry } = useAppSelector((state) => state.footer);

  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  // Add this state to track the current WebView content
  const [webViewContent, setWebViewContent] = useState({
    title: "",
    url: "",
  });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      if (prev[title]) {
        return { [title]: false };
      }
      return { [title]: true };
    });
  };

  const getFlagUrl = (code: string) =>
    `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  const handleNavigation = (subItem: string) => {
    switch (subItem) {
      case "FAQ":
        navigation.navigate("faqScreen");
        break;
      case "Find A Store":
        navigation.navigate("findAStore");
        break;
      case "The Complete Hijab Design Style Guide":
        navigation.navigate("hijabDesign");
        break;
      case "How to Buy":
        navigation.navigate("howToBuy");
        break;
      case "Payment Options":
        navigation.navigate("paymentOption");
        break;
      case "Terms of Service":
        navigation.navigate("termsOfServices");
        break;
      case "Privacy & Cookies":
        navigation.navigate("privacyCookies");
        break;
      case "Refund policy":
        navigation.navigate("refundPolicy");
        break;
      default:
        setIsWebViewVisible(true);
    }
  };

  return (
    <View
      style={{
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(50),
        paddingHorizontal: horizontalScale(20),
        backgroundColor: COLORS.Offwhite,
      }}
    >
      {/* Menu Sections */}
      {footerSections.map((section) => (
        <View key={section.title}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 5,
            }}
            activeOpacity={0.8}
            onPress={() => toggleSection(section.title)}
          >
            <CustomText
              fontFamily="medium"
              fontSize={12}
              style={{ fontWeight: "400", letterSpacing: 2 }}
              color={COLORS.black}
            >
              {section.title}
            </CustomText>
            <CustomIcon
              Icon={
                expandedSections[section.title]
                  ? ICONS.DropUpIcon
                  : ICONS.DropDownIcon
              }
              height={18}
              width={18}
            />
          </TouchableOpacity>
          {/* Sub-items (visible when expanded) */}
          {expandedSections[section.title] && (
            <View
              style={{ paddingLeft: horizontalScale(10), paddingVertical: 5 }}
            >
              {section.subItems.map((subItem, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => handleNavigation(subItem)}
                >
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    style={{ marginVertical: 7 }}
                    color={COLORS.midnightgrey}
                  >
                    {subItem}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Country and Social Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 30,
        }}
      >
        {/* Country Selector */}
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          activeOpacity={0.8}
          onPress={() => dispatch(setIsCountryPickerVisible(true))}
        >
          <Image
            source={{ uri: getFlagUrl(selectedCountry.countryCode) }}
            style={{ width: 28, height: 20, marginRight: 10, borderRadius: 3 }}
            resizeMode="contain"
          />
          <CustomText
            fontFamily="medium"
            fontSize={12}
            style={{ fontWeight: "400" }}
            color={COLORS.black}
          >
            {selectedCountry.code}
          </CustomText>
          <CustomIcon
            Icon={
              isCountryPickerVisible ? ICONS.DropUpIcon : ICONS.DropDownIcon
            }
            width={18}
            height={18}
          />
        </TouchableOpacity>

        {/* Social Icons */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: horizontalScale(5),
          }}
        >
          <CustomIcon Icon={ICONS.FacebookIcon} height={20} width={20} />
          <CustomIcon Icon={ICONS.XIcon} height={20} width={20} />
          <CustomIcon Icon={ICONS.PlayIcon} height={20} width={20} />
          <CustomIcon Icon={ICONS.PinterestIcon} height={20} width={20} />
          <CustomIcon Icon={ICONS.InstagramIcon} height={20} width={20} />
        </View>
      </View>

      {/* WebView Modal for FAQ */}
      <Modal
        visible={isWebViewVisible}
        animationType="slide"
        onRequestClose={() => setIsWebViewVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{
              padding: 10,
              alignItems: "center",
              backgroundColor: COLORS.Offwhite,
            }}
            onPress={() => setIsWebViewVisible(false)}
          >
            <CustomText fontFamily="medium" fontSize={16} color={COLORS.black}>
              Close
            </CustomText>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Footer;
