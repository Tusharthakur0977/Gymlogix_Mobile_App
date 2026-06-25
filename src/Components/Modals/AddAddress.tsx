import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CustomText } from "../CustomText";
import CustomIcon from "../CustomIcon";
import COLORS from "../../Utilities/Colors";
import ICONS from "../../Assets/Icons";
import { useAppSelector } from "../../Redux/store";
import { setIsAddAddressVisible } from "../../Redux/slices/modalSlice";
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from "../../Utilities/Metrics";
import { useDispatch } from "react-redux";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { addCustomerAddress } from "../../Services/requestHandlers";
import { getLocalStorageData } from "../../Utilities/Helpers";
import STORAGE_KEYS from "../../Services/StorageKeys";
import Toast from "react-native-toast-message";

const AddAddressModal = ({ isVisible = false, onClose, onSave }) => {
  const dispatch = useDispatch();
  const isAddAddressVisible = useAppSelector(
    (state) => state.modals.isAddAddressVisible
  );

  const [isDefault, setIsDefault] = useState(false);
  const [country, setCountry] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [visible, setVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset form fields when modal is closed
  useEffect(() => {
    if (!isAddAddressVisible) {
      setIsDefault(false);
      setCountry(null);
      setFirstName("");
      setLastName("");
      setAddress("");
      setApartment("");
      setCity("");
      setPostalCode("");
      setPhone("");
      setCountryCode("US");
      setVisible(false);
      setIsChecked(false);
    }
  }, [isAddAddressVisible]);

  const closeModal = () => {
    dispatch(setIsAddAddressVisible(false));
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Toast.show({
        type: "error",
        text1: "First name is required",
      });
      return false;
    }

    if (!lastName.trim()) {
      Toast.show({
        type: "error",
        text1: "Last name is required",
      });
      return false;
    }

    if (!address.trim()) {
      Toast.show({
        type: "error",
        text1: "Address is required",
      });
      return false;
    }

    if (!city.trim()) {
      Toast.show({
        type: "error",
        text1: "City is required",
      });
      return false;
    }

    if (!postalCode.trim()) {
      Toast.show({
        type: "error",
        text1: "Postal code is required",
      });
      return false;
    }

    if (!phone.trim()) {
      Toast.show({
        type: "error",
        text1: "Phone number is required",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get customer access token from storage
      const customerAccessToken = await getLocalStorageData(
        STORAGE_KEYS.accessToken
      );

      if (!customerAccessToken) {
        Toast.show({
          type: "error",
          text1: "Authentication error",
          text2: "Please log in again",
        });
        return;
      }

      const response = await addCustomerAddress(customerAccessToken, {
        firstName,
        lastName,
        address1: address,
        address2: apartment,
        city,
        province: "",
        zip: postalCode,
        country: country?.name || "United States",
        phone,
      });

      if (response.success) {
        console.log("Address added successfully:", response.data);
        Toast.show({
          type: "success",
          text1: "Address added successfully",
        });
        onSave?.();
        closeModal();
      }
    } catch (error) {
      console.error("Error adding address:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
    setVisible(false);
  };

  return (
    // <Modal
    //   isVisible={}
    //   onBackdropPress={closeModal}
    //   style={styles.modal}
    //   backdropColor="black"
    //   backdropOpacity={0.7}
    //   animationIn="fadeIn"
    //   animationOut="fadeOut"
    // >
    //   <View style={styles.container}>
    <Modal
      visible={isAddAddressVisible}
      transparent
      onRequestClose={closeModal}
      animationType="fade"
    >
      <TouchableOpacity
        onPress={closeModal}
        activeOpacity={1}
        style={styles.container}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true} // Capture touch events
          onResponderRelease={(e) => e.stopPropagation()} // Prevent propagation
        >
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <CustomText
                fontFamily="regular"
                fontSize={16}
                color={COLORS.black}
                style={styles.title}
              >
                Add Address
              </CustomText>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isChecked
                          ? COLORS.checkgrey
                          : COLORS.white,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    {isChecked && (
                      <CustomIcon
                        Icon={ICONS.CheckIcon}
                        height={12}
                        width={12}
                      />
                    )}
                  </View>
                </TouchableOpacity>
                <CustomText
                  fontFamily="regular"
                  fontSize={12}
                  color={COLORS.midnightgrey}
                  style={styles.checkboxText}
                >
                  Make this my default address
                </CustomText>
              </View>

              <TouchableOpacity
                style={[
                  styles.countryResion,
                  { borderWidth: 1, borderColor: COLORS.black },
                ]}
                onPress={() => setVisible(true)}
              >
                <View style={{ gap: verticalScale(5) }}>
                  <CustomText
                    fontFamily="regular"
                    fontSize={8}
                    color={COLORS.midnightgrey}
                  >
                    {country?.name || "Country/region"}
                  </CustomText>
                  <CustomText
                    fontFamily="regular"
                    fontSize={12}
                    color={COLORS.black}
                  >
                    {country?.name || "Country"}
                  </CustomText>
                </View>
                <CustomIcon Icon={ICONS.DropDownIcon} height={20} width={20} />
              </TouchableOpacity>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="First name"
                  placeholderTextColor={COLORS.midnightgrey}
                  value={firstName}
                  onChangeText={(text) => setFirstName(text.trimStart())}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Last name"
                  placeholderTextColor={COLORS.midnightgrey}
                  value={lastName}
                  onChangeText={(text) => setLastName(text.trimStart())}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor={COLORS.midnightgrey}
                value={address}
                onChangeText={(text) => setAddress(text.trimStart())}
              />

              <TextInput
                style={styles.input}
                placeholder="Apartment, suite, etc"
                placeholderTextColor={COLORS.midnightgrey}
                value={apartment}
                onChangeText={(text) => setApartment(text.trimStart())}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="City"
                  placeholderTextColor={COLORS.midnightgrey}
                  value={city}
                  onChangeText={(text) => setCity(text.trimStart())}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Postal Code"
                  placeholderTextColor={COLORS.midnightgrey}
                  value={postalCode}
                  onChangeText={(text) => setPostalCode(text.trimStart())}
                />
              </View>

              <View style={styles.phoneContainer}>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone"
                  placeholderTextColor={COLORS.midnightgrey}
                  value={phone}
                  onChangeText={(text) => {
                    if (/^\d{0,10}$/.test(text)) {
                      setPhone(text.trimStart());
                    }
                  }}
                  keyboardType="number-pad"
                />

                <TouchableOpacity
                  onPress={() => setVisible(true)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingRight: horizontalScale(5),
                  }}
                >
                  <CountryPicker
                    visible={visible}
                    onSelect={onSelect}
                    onClose={() => setVisible(false)}
                    theme={{
                      onBackgroundTextColor: COLORS.black,
                      backgroundColor: COLORS.white,
                    }}
                    withFlagButton={true}
                    withFilter
                    countryCode={countryCode}
                    containerButtonStyle={styles.pickerContainer}
                  />
                  <CustomIcon
                    Icon={ICONS.DropDownIcon}
                    height={20}
                    width={20}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
              <CustomText
                fontFamily="regular"
                fontSize={10}
                color={COLORS.black}
                style={styles.buttonText}
              >
                Cancel
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.button,
                styles.saveButton,
                loading && styles.disabledButton,
              ]}
              disabled={loading}
            >
              <CustomText
                fontFamily="regular"
                fontSize={10}
                color={COLORS.white}
                style={styles.buttonText}
              >
                {loading ? "Saving..." : "Save"}
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(10),
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    height: hp(50),
    width: wp(90),
    borderRadius: 30,
    paddingTop: verticalScale(10),
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: horizontalScale(15),
    paddingTop: verticalScale(15),
  },
  title: {
    fontWeight: "400",
    marginBottom: verticalScale(15),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(15),
  },
  checkboxText: {
    marginLeft: horizontalScale(10),
  },
  input: {
    backgroundColor: COLORS.offGrey,
    padding: horizontalScale(16),
    marginBottom: verticalScale(10),
    fontSize: 14,
    color: COLORS.black,
  },
  countryResion: {
    backgroundColor: COLORS.offGrey,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phoneContainer: {
    backgroundColor: COLORS.offGrey,
    paddingVertical: verticalScale(10),
    paddingRight: horizontalScale(5),
    marginBottom: verticalScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    fontSize: 14,
    color: COLORS.black,
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: COLORS.Offwhite,
  },
  button: {
    paddingVertical: verticalScale(15),
    flex: 1,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: COLORS.DarkBrown,
    borderBottomRightRadius: 30,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: verticalScale(15),
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: COLORS.Offwhite,
  },
  buttonText: {
    fontWeight: "400",
  },
  pickerContainer: {
    borderLeftWidth: 1,
    borderColor: COLORS.Grey,
    paddingHorizontal: horizontalScale(10),
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.checkgrey,
  },
});

export default AddAddressModal;
