import React, { FC, useState, useRef } from "react";
import {
  Image,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ICONS from "../../Assets/Icons";
import IMAGES from "../../Assets/Images";
import CustomButton from "../../Components/CustomButton";
import CustomIcon from "../../Components/CustomIcon";
import { CustomText } from "../../Components/CustomText";
import { loginCustomer } from "../../Services/requestHandlers";
import STORAGE_KEYS from "../../Services/StorageKeys";
import { LoginProps } from "../../Typings/route";
import COLORS from "../../Utilities/Colors";
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from "../../Utilities/Metrics";
import {
  storeLocalStorageData,
  getLocalStorageData,
} from "../../Utilities/Helpers";
import { useNavigation, useRoute } from "@react-navigation/native";

const Login: FC<LoginProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  // Email validation without regex
  const isValidEmail = (email: string) => {
    if (!email) return false;
    return email.includes("@") && email.includes(".") && email.length > 5;
  };

  // Handle login with API call
  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all fields first.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid email address.",
      });
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await loginCustomer(email, password);

      if (
        response.success &&
        response.data?.customerAccessTokenCreate?.customerAccessToken
          ?.accessToken
      ) {
        // Store the access token using storeLocalStorageData
        await storeLocalStorageData(
          STORAGE_KEYS.accessToken,
          response.data.customerAccessTokenCreate.customerAccessToken
            .accessToken
        );

        await storeLocalStorageData(STORAGE_KEYS.email, email);

        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: "Welcome back!",
        });

        // Check if there's a pending product to add to cart
        const pendingProductId = await getLocalStorageData(
          STORAGE_KEYS.pendingProductId
        );

        if (pendingProductId) {
          // Clear the pending product
          await storeLocalStorageData(STORAGE_KEYS.pendingProductId, "");

          // Navigate to the product page
          setTimeout(() => {
            navigation.navigate("singleProduct", {
              productId: pendingProductId,
            });
          }, 1500);
        } else {
          // Normal navigation
          setTimeout(() => {
            navigation.navigate("tabs", { screen: "home" });
          }, 1500);
        }
      } else {
        const errorMessage =
          response.data?.customerAccessTokenCreate?.userErrors?.[0]?.message ||
          "Invalid email or password. Please try again.";

        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: errorMessage,
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image */}
      <Image
        source={IMAGES.MonogramImg}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === "ios" ? 10 : 20}
        enableResetScrollToCoords={true}
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardOpeningTime={0}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Back Button - Moved outside the scroll content */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <CustomIcon Icon={ICONS.BackArrowIcon} height={20} width={20} />
        </TouchableOpacity>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.headerContainer}>
              <CustomText
                fontFamily="bold"
                fontSize={28}
                color={COLORS.black}
                style={styles.title}
              >
                Login
              </CustomText>
              <CustomText
                fontFamily="regular"
                fontSize={14}
                color={COLORS.Grey}
                style={styles.subtitle}
              >
                Enter your email and password to login
              </CustomText>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text.trimStart());
                  }}
                  placeholder="Enter your email address"
                  placeholderTextColor={COLORS.Grey}
                  keyboardType="email-address"
                  returnKeyType="next"
                  autoCapitalize="none"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text.trimStart());
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.Grey}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordLink}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("forgotPassword")}
              >
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.black}
                >
                  Forgot password?
                </CustomText>
              </TouchableOpacity>
            </View>

            <View style={styles.actionContainer}>
              <CustomButton
                label="Login"
                onPress={handleLogin}
                loading={loading}
              />

              <View style={styles.registerLinkContainer}>
                <CustomText
                  fontFamily="regular"
                  fontSize={14}
                  color={COLORS.Grey}
                >
                  Don't have an account?{" "}
                  <CustomText
                    fontFamily="medium"
                    fontSize={14}
                    color={COLORS.DarkBrown}
                    onPress={() => navigation.navigate("registerScreen")}
                  >
                    Create One
                  </CustomText>
                </CustomText>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundImage: {
    height: hp(50),
    width: wp(100),
    position: "absolute",
    top: 0,
  },
  backButton: {
    backgroundColor: COLORS.white,
    marginTop: Platform.OS === "ios" ? 0 : verticalScale(10),
    marginLeft: horizontalScale(20),
    padding: horizontalScale(10),
    borderRadius: 12,
    alignSelf: "flex-start",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingTop: verticalScale(60), // Add padding to account for the back button
  },
  cardContainer: {
    width: "100%",
    marginTop: hp(20),
  },
  card: {
    backgroundColor: COLORS.white,
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(40),
    paddingHorizontal: horizontalScale(24),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: verticalScale(25),
  },
  title: {
    marginBottom: verticalScale(8),
  },
  subtitle: {
    opacity: 0.8,
  },
  formContainer: {
    marginBottom: verticalScale(25),
  },
  inputWrapper: {
    marginBottom: verticalScale(15),
  },
  inputLabel: {
    marginBottom: verticalScale(5),
    marginLeft: horizontalScale(2),
  },
  input: {
    width: "100%",
    backgroundColor: COLORS.lightGrey,
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(20),
    fontSize: 16,
    color: COLORS.black,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginTop: verticalScale(5),
  },
  actionContainer: {},
  registerLinkContainer: {
    alignItems: "center",
    marginTop: verticalScale(25),
  },
});
