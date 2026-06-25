import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
  Keyboard,
  Modal,
} from "react-native";
import COLORS from "../../Utilities/Colors";
import { CustomText } from "../CustomText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector, useAppDispatch } from "../../Redux/store";
import { setIsCountryPickerVisible } from "../../Redux/slices/modalSlice";
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from "../../Utilities/Metrics";
import { setSelectedCountry } from "../../Redux/slices/footerSlice";

const CountryPicker = () => {
  const dispatch = useAppDispatch();
  const isCountryPickerVisible = useAppSelector(
    (state) => state.modals.isCountryPickerVisible
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const countries = [
    { code: "IDR", name: "Indonesia Rupiah", countryCode: "ID" },
    { code: "IQD", name: "Iraqi Dinar", countryCode: "IQ" },
    { code: "JOD", name: "Jordanian Dinar", countryCode: "JO" },
    { code: "KWD", name: "Kuwaiti Dinar", countryCode: "KW" },
    { code: "MYR", name: "Malaysian Ringgit", countryCode: "MY" },
    { code: "MAD", name: "Moroccan Dirham", countryCode: "MA" },
    { code: "NZD", name: "New Zealand Dollar", countryCode: "NZ" },
    { code: "OMR", name: "Omani Rial", countryCode: "OM" },
    { code: "PHP", name: "Philippine Peso", countryCode: "PH" },
    { code: "SAR", name: "Saudi Riyal", countryCode: "SA" },
    { code: "SGD", name: "Singapore Dollar", countryCode: "SG" },
    { code: "ZAR", name: "South African Rand", countryCode: "ZA" },
    { code: "CHF", name: "Swiss Franc", countryCode: "CH" },
    { code: "TRY", name: "Turkish Lira", countryCode: "TR" },
    { code: "AED", name: "UAE Dirham", countryCode: "AE" },
    { code: "DZD", name: "Algerian Dinar", countryCode: "DZ" },
    { code: "USD", name: "US Dollar", countryCode: "US" },
    { code: "DKK", name: "Danish Krone", countryCode: "DK" },
    { code: "EUR", name: "Euro", countryCode: "EU" },
    { code: "HKD", name: "Hong Kong Dollar", countryCode: "HK" },
    { code: "GBP", name: "British Pound", countryCode: "GB" },
    { code: "MVR", name: "Maldivian Rufiyaa", countryCode: "MV" },
    { code: "CAD", name: "Canadian Dollar", countryCode: "CA" },
    { code: "TWD", name: "Taiwan Dollar", countryCode: "TW" },
    { code: "AUD", name: "Australian Dollar", countryCode: "AU" },
    { code: "NOK", name: "Norwegian Krone", countryCode: "NO" },
    { code: "BHD", name: "Bahraini Dinar", countryCode: "BH" },
    { code: "QAR", name: "Qatari Riyal", countryCode: "QA" },
    { code: "BND", name: "Brunei Dollar", countryCode: "BN" },
    { code: "TND", name: "Tunisian Dinar", countryCode: "TN" },
    { code: "CNY", name: "Chinese Yuan", countryCode: "CN" },
  ];

  const getFlagUrl = (countryCode: string) =>
    `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

  // Prevent multiple modal instances
  useEffect(() => {
    if (isCountryPickerVisible && !isModalOpen) {
      setIsModalOpen(true);
    } else if (!isCountryPickerVisible && isModalOpen) {
      setIsModalOpen(false);
    }
  }, [isCountryPickerVisible]);

  const closeModal = () => {
    if (isModalOpen) {
      dispatch(setIsCountryPickerVisible(false));
      Keyboard.dismiss();
    }
  };

  // Prevent rapid clicks by debouncing
  const handleCountrySelect = (item: {
    code: string;
    name: string;
    countryCode: string;
  }) => {
    if (Keyboard.isVisible?.()) {
      Keyboard.dismiss();
      setTimeout(() => {
        dispatch(setSelectedCountry(item));
        dispatch(setIsCountryPickerVisible(false));
        closeModal();
      }, 100);
    } else {
      dispatch(setSelectedCountry(item));
      dispatch(setIsCountryPickerVisible(false));
      closeModal();
    }
  };

  // Return null if modal is not visible to prevent rendering
  if (!isCountryPickerVisible) return null;

  return (
    <Modal
      visible={isCountryPickerVisible}
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
          onStartShouldSetResponder={() => true}
          onResponderRelease={(e) => e.stopPropagation()}
        >
          <FlatList
            data={countries}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => handleCountrySelect(item)}
              >
                <Image
                  source={{ uri: getFlagUrl(item.countryCode) }}
                  style={styles.flagImage}
                />
                <CustomText
                  fontFamily="medium"
                  fontSize={14}
                  color={COLORS.black}
                >
                  {item.name} ({item.code})
                </CustomText>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <CustomText fontFamily="medium" fontSize={14} color={COLORS.white}>
              Close
            </CustomText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CountryPicker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(10),
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    maxHeight: hp(50),
    width: wp(90),
    borderRadius: 28,
    paddingBottom: verticalScale(20),
    padding: verticalScale(10),
  },
  countryItem: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  flagImage: {
    width: 30,
    height: 20,
    borderRadius: 3,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});