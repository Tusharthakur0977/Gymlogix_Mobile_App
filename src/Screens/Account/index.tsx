import React, { FC, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccountScreenProps } from "../../Typings/route";
import COLORS from "../../Utilities/Colors";
import { horizontalScale, verticalScale } from "../../Utilities/Metrics";
import Header from "../../Components/Header";
import CustomButton from "../../Components/CustomButton";
import { CustomText } from "../../Components/CustomText";
import CustomIcon from "../../Components/CustomIcon";
import ICONS from "../../Assets/Icons";
import { useDispatch } from "react-redux";
import { setIsAddAddressVisible } from "../../Redux/slices/modalSlice";
import AddAddressModal from "../../Components/Modals/AddAddress";
import { KeyboardAvoidingContainer } from "../../Components/KeyboardAvoidingComponent";
import Toast from "react-native-toast-message";
import { deleteLocalStorageData } from "../../Utilities/Helpers";
import STORAGE_KEYS from "../../Services/StorageKeys";
import { useAppDispatch } from "../../Redux/store";
import { clearCartData } from "../../Redux/slices/cartSlice";

const Account: FC<AccountScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleAddAddress = () => {
    dispatch(setIsAddAddressVisible(true));
  };

  const handleLogout = async () => {
    try {
      // Clear all auth-related data from storage
      await deleteLocalStorageData(STORAGE_KEYS.accessToken);
      await deleteLocalStorageData(STORAGE_KEYS.email);
      await deleteLocalStorageData(STORAGE_KEYS.cartId);

      // Clear cart data from Redux
      dispatch(clearCartData());

      // Show success message
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "You have been successfully logged out",
      });

      // Navigate to login screen
      navigation.navigate("login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
        <KeyboardAvoidingContainer>
          {/* Profile Section */}
          <View style={styles.section}>
            <CustomText
              fontFamily="regular"
              fontSize={16}
              color={COLORS.black}
              style={styles.heading}
            >
              Profile
            </CustomText>
            <View style={styles.card}>
              <TextInput
                placeholder="First name"
                placeholderTextColor={COLORS.midnightgrey}
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
              />
              <TextInput
                placeholder="Last Name"
                placeholderTextColor={COLORS.midnightgrey}
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
              />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor={COLORS.midnightgrey}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
              <CustomText
                fontFamily="regular"
                fontSize={10}
                color={COLORS.midnightgrey}
              >
                Email used for login can't be changed
              </CustomText>
            </View>
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <CustomText
                fontFamily="regular"
                fontSize={16}
                color={COLORS.black}
                style={styles.heading}
              >
                Addresses
              </CustomText>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{ paddingBottom: 10 }}
                onPress={handleAddAddress}
              >
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.black}
                >
                  + Add New
                </CustomText>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <CustomText
                  fontFamily="regular"
                  fontSize={10}
                  color={COLORS.midnightgrey}
                >
                  Default Address
                </CustomText>
                <CustomIcon Icon={ICONS.EditIcon} height={16} width={16} />
              </View>
              <CustomText
                fontFamily="medium"
                fontSize={12}
                color={COLORS.black}
              >
                Full Name
              </CustomText>
              <CustomText
                fontFamily="medium"
                fontSize={12}
                color={COLORS.black}
              >
                Address
              </CustomText>
              <CustomText
                fontFamily="medium"
                fontSize={12}
                color={COLORS.black}
              >
                Pin Code, Apartment, suite, etc, City, State
              </CustomText>
              <CustomText
                fontFamily="medium"
                fontSize={12}
                color={COLORS.black}
              >
                Phone Number
              </CustomText>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <CustomButton label="Logout" onPress={handleLogout} />
            <CustomText
              fontFamily="regular"
              fontSize={12}
              color={COLORS.DarkBrown}
              style={{ textAlign: "center" }}
            >
              Delete account?
            </CustomText>
          </View>
          <AddAddressModal onClose={() => {}} onSave={() => {}} />
        </KeyboardAvoidingContainer>
      </SafeAreaView>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeAreaCont: {
    flex: 1,
    paddingTop: verticalScale(10),
  },
  section: {
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(20),
  },
  heading: {
    marginBottom: verticalScale(10),
  },
  card: {
    padding: horizontalScale(15),
    gap: verticalScale(10),
    borderWidth: 1,
    borderColor: COLORS.offGrey,
  },
  input: {
    backgroundColor: COLORS.offGrey,
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(10),
    fontSize: 12,
    color: COLORS.DarkGrey,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  defaultLabel: {
    fontSize: 12,
    color: COLORS.Grey,
  },
  footer: {
    marginTop: "auto",
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(20),
    gap: verticalScale(10),
  },
  scrollContent: {
    flexGrow: 1,
  },
});
