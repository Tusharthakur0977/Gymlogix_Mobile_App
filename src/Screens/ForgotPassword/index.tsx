import {
  ImageBackground,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import React, { FC, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../../Assets/Images";
import { ForgotPasswordProps } from "../../Typings/route";
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
import { forgotPasswordApi } from "../../Services/requestHandlers";

const ForgotPassword: FC<ForgotPasswordProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isValidEmail = (email: string) => {
    return email.includes("@") && email.includes(".") && email.length > 5;
  };

  const handlePasswordRecovery = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Missing Email",
        text2: "Please enter your email address.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address (e.g., user@example.com).",
      });
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await forgotPasswordApi(email);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Recovery Email Sent",
          text2: "Check your email to reset your password.",
        });
      }
      setTimeout(() => {
        navigation.navigate("updatePassword");
      }, 1500);
    } catch (error) {
      console.error("Password recovery error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={IMAGES.MonogramImg}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 30}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <CustomIcon Icon={ICONS.BackArrowIcon} height={20} width={20} />
              </TouchableOpacity>

              {/* Card */}
              <View style={styles.card}>
                <CustomText
                  fontFamily="bold"
                  fontSize={24}
                  color={COLORS.black}
                  style={styles.title}
                >
                  Forgot Password
                </CustomText>
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.Grey}
                  style={styles.subtitle}
                >
                  Enter your email to reset your password.
                </CustomText>

                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => setEmail(text.trimStart())}
                  placeholder="Email"
                  placeholderTextColor={COLORS.Grey}
                  keyboardType="email-address"
                  returnKeyType="done"
                  autoCapitalize="none"
                  onSubmitEditing={handlePasswordRecovery}
                />

                <CustomButton
                  label="Continue"
                  onPress={handlePasswordRecovery}
                  loading={loading}
                />
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundImage: {
    flex: 1,
    width: wp(100),
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: COLORS.white,
    padding: horizontalScale(6),
    borderRadius: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(30),
    paddingHorizontal: horizontalScale(20),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    marginBottom: verticalScale(10),
  },
  subtitle: {
    marginBottom: verticalScale(20),
  },
  input: {
    width: "100%",
    backgroundColor: COLORS.lightGrey,
    padding: verticalScale(15),
    marginBottom: verticalScale(20),
    fontSize: 16,
    color: COLORS.black,
  },
});
