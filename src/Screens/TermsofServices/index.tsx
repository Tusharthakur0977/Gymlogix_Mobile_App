import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import React, { FC, useEffect, useState } from "react";
import { TermsOfServicesProps } from "../../Typings/route";
import { CustomText } from "../../Components/CustomText";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../Utilities/Metrics";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import { fetchShopPolicies } from "../../Services/requestHandlers";
import { ShopPoliciesApiResponse } from "../../Services/ApiResponseTypes/Shop_Policies";
import HTML from "react-native-render-html";

const TermsOfServices: FC<TermsOfServicesProps> = ({ navigation }) => {
  const [policies, setPolicies] = useState<ShopPoliciesApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        const response = await fetchShopPolicies();
        if (response.success) {
          setPolicies(response.data.shop);
        }
      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomIcon
          Icon={ICONS.BackArrowIcon}
          width={24}
          height={24}
          onPress={() => navigation.goBack()}
        />
        <CustomText
          fontFamily="medium"
          fontSize={16}
          color={COLORS.black}
          style={{ flex: 1, textAlign: "center" }}
        >
          Terms of Service
        </CustomText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.black} />
          </View>
        ) : policies?.termsOfService ? (
          <HTML
            source={{ html: policies.termsOfService.body }}
            contentWidth={horizontalScale(320)}
            tagsStyles={{
              h1: {
                fontFamily: "medium",
                fontSize: 20,
                color: COLORS.black,
                marginVertical: verticalScale(10),
              },
              h2: {
                fontFamily: "medium",
                fontSize: 18,
                color: COLORS.black,
                marginVertical: verticalScale(8),
              },
              h3: {
                fontFamily: "medium",
                fontSize: 16,
                color: COLORS.black,
                marginVertical: verticalScale(6),
              },
              p: {
                fontFamily: "regular",
                fontSize: 14,
                color: COLORS.Grey,
                lineHeight: 22,
                marginVertical: verticalScale(4),
              },
              ul: {
                marginVertical: verticalScale(4),
              },
              li: {
                fontFamily: "regular",
                fontSize: 14,
                color: COLORS.Grey,
                lineHeight: 22,
              },
            }}
            ignoredDomTags={["font", "img"]} // Ignore unsupported tags like font or images
          />
        ) : (
          <CustomText
            fontFamily="regular"
            fontSize={14}
            color={COLORS.Grey}
            style={{ textAlign: "center", marginTop: verticalScale(20) }}
          >
            Terms of Service not available.
          </CustomText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfServices;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  content: {
    flex: 1,
    padding: horizontalScale(20),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: verticalScale(300),
  },
});
