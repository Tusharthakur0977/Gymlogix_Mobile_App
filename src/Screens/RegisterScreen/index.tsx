import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { FC, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import IMAGES from "../../Assets/Images";
import { RegisterScreenProps } from "../../Typings/route";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from "../../Utilities/Metrics";
import { CustomText } from "../../Components/CustomText";
import COLORS from "../../Utilities/Colors";
import CustomButton from "../../Components/CustomButton";
import Toast from "react-native-toast-message";
import { registerUserApi } from "../../Services/requestHandlers";

const RegisterScreen: FC<RegisterScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Email validation without regex
  const isValidEmail = (email: string) => {
    if (!email) return false;
    return email.includes("@") && email.includes(".") && email.length > 5;
  };

  // Phone validation - allow international format
  const isValidPhone = (phone: string) => {
    // Allow numbers, plus sign at start, and hyphens
    return phone.length >= 10 && /^[+]?\d+(-\d+)*$/.test(phone);
  };

  // Format phone number as user types
  const formatPhoneNumber = (text: string) => {
    // Allow plus sign only at the beginning
    if (text.startsWith("+")) {
      // For international format, just remove non-numeric chars except + and -
      return text.replace(/[^\d+\-]/g, "");
    } else {
      // For regular format, just keep numbers and hyphens
      return text.replace(/[^\d\-]/g, "");
    }
  };

  const handleSignUp = async () => {
    // Validation logic
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all required fields.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }

    if (fullName.length < 2) {
      Toast.show({
        type: "error",
        text1: "Invalid Full Name",
        text2: "Full name must be at least 2 characters long.",
      });
      return;
    }

    if (!isValidPhone(phoneNumber)) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Number",
        text2: "Please enter a valid phone number (at least 10 digits).",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "Passwords do not match.",
      });
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    // Format phone for API - ensure it has a plus if international
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith("+")) {
      // Add country code if not present (assuming US/Canada as default)
      formattedPhone = "+1" + phoneNumber.replace(/\D/g, "");
    }

    const data = {
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ")[1] || "",
      email: email,
      password: password,
      phone: formattedPhone,
      acceptsMarketing: true,
    };

    try {
      const response = await registerUserApi(data);

      if (response.success && response.data?.customerCreate?.customer) {
        Toast.show({
          type: "success",
          text1: "Registration Successful",
        });
        navigation.navigate("login");
      } else {
        const errorMessage =
          response.data?.customerCreate?.customerUserErrors?.[0]?.message ||
          "Registration failed. Please try again.";
        Toast.show({
          type: "error",
          text1: "Registration Error",
          text2: errorMessage,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to register. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={IMAGES.MonogramImg}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === "ios" ? 0 : 0}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
                Register
              </CustomText>
              <CustomText
                fontFamily="regular"
                fontSize={14}
                color={COLORS.Grey}
                style={styles.subtitle}
              >
                Fill in your details to register you account
              </CustomText>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={(text) => setFullName(text.trimStart())}
                placeholder="Full Name"
                placeholderTextColor={COLORS.Grey}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />

              <TextInput
                ref={emailRef}
                style={styles.input}
                value={email}
                onChangeText={(text) => setEmail(text.trimStart())}
                placeholder="Email Address"
                placeholderTextColor={COLORS.Grey}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                autoCapitalize="none"
              />

              <TextInput
                ref={phoneRef}
                style={styles.input}
                value={phoneNumber}
                onChangeText={(text) => {
                  const formattedText = formatPhoneNumber(text);
                  setPhoneNumber(formattedText);
                }}
                placeholder="Phone Number"
                placeholderTextColor={COLORS.Grey}
                keyboardType="phone-pad"
                maxLength={20}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <TextInput
                ref={passwordRef}
                style={styles.input}
                value={password}
                onChangeText={(text) => setPassword(text.trimStart())}
                placeholder="Password"
                placeholderTextColor={COLORS.Grey}
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />

              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                value={confirmPassword}
                onChangeText={(text) => setConfirmPassword(text.trimStart())}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.Grey}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
            </View>

            <View style={styles.actionContainer}>
              <CustomButton
                label="Create Account"
                onPress={handleSignUp}
                loading={loading}
              />

              <View style={styles.loginLinkContainer}>
                <CustomText
                  fontFamily="regular"
                  fontSize={14}
                  color={COLORS.Grey}
                >
                  Already have an account?{" "}
                  <CustomText
                    fontFamily="medium"
                    fontSize={14}
                    color={COLORS.DarkBrown}
                    onPress={() => navigation.navigate("login")}
                  >
                    Login
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

export default RegisterScreen;

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
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollViewContent: {
    flexGrow: 1,
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
  input: {
    width: "100%",
    backgroundColor: COLORS.lightGrey,
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(16),
    fontSize: 16,
    color: COLORS.black,
  },
  actionContainer: {
    marginTop: verticalScale(10),
  },
  loginLinkContainer: {
    alignItems: "center",
    marginTop: verticalScale(25),
  },
});
