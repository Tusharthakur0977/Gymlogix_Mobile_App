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
import IMAGES from "../../Assets/Images";
import { UpdatePasswordProps } from "../../Typings/route";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import { KeyboardAvoidingContainer } from "../../Components/KeyboardAvoidingComponent";
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from "../../Utilities/Metrics";
import { CustomText } from "../../Components/CustomText";
import COLORS from "../../Utilities/Colors";
import CustomButton from "../../Components/CustomButton";

const UpdatePassword: FC<UpdatePasswordProps> = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image */}
      <Image
        source={IMAGES.MonogramImg} // Update this to the correct image source
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <CustomIcon Icon={ICONS.BackArrowIcon} height={20} width={20} />
      </TouchableOpacity>

      <KeyboardAvoidingContainer
        keyboardOffset={Platform.OS === "android" ? 30 : 10}
        scrollEnabled={false}
      >
        <TouchableOpacity
          style={styles.cardContainer}
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
            if (newPasswordRef.current) {
              newPasswordRef.current.blur();
            }
            if (confirmPasswordRef.current) {
              confirmPasswordRef.current.blur();
            }
          }}
        >
          <View style={styles.card}>
            <CustomText
              fontFamily="bold"
              fontSize={24}
              color={COLORS.black}
              style={styles.title}
            >
              Update Password
            </CustomText>
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.Grey}
              style={styles.subtitle}
            >
              Please enter your new password.
            </CustomText>

            {/* New Password Input */}
            <TextInput
              ref={newPasswordRef}
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor={COLORS.Grey}
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />

            {/* Confirm Password Input */}
            <TextInput
              ref={confirmPasswordRef}
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor={COLORS.Grey}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            {/* Update Button */}
            <CustomButton
              label="Update"
              onPress={() => {
                // Add logic to handle password update here
                console.log("Update pressed with newPassword:", newPassword);
              }}
              disabled={
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
            />
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingContainer>
    </SafeAreaView>
  );
};

export default UpdatePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundImage: {
    height: hp(75),
    width: wp(100),
    position: "absolute",
    top: 0,
  },
  backButton: {
    backgroundColor: COLORS.white,
    marginTop: verticalScale(10),
    marginLeft: horizontalScale(20),
    padding: horizontalScale(5),
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(30),
    paddingHorizontal: horizontalScale(20),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
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
