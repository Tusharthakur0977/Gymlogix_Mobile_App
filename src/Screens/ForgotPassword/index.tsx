import React, {FC, useState} from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FONTS from '../../Assets/fonts';
import IMAGES from '../../Assets/Images';
import {CustomText} from '../../Components/CustomText';
import {KeyboardAvoidingContainer} from '../../Components/KeyboardAvoidingComponent';
import PrimaryButton from '../../Components/PrimaryButton';
import {ForgotPasswordProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {isValidEmail, showCustomToast} from '../../Utilities/Helpers';
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics';
import {postData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';

const ForgotPassword: FC<ForgotPasswordProps> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [inputDetails, setInputDetails] = useState({
    email: '',
  });

  const [errors, setErrors] = useState({email: ''});
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | null;
  }>({
    text: '',
    type: null,
  });

  const validInput = () => {
    let valid = true;
    let newErrors = {
      email: '',
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!inputDetails.email.trim()) {
      valid = false;
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(inputDetails.email)) {
      valid = false;
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    setMessage({text: '', type: null});
    return valid;
  };

  const handleForgotPassword = async () => {
    if (!validInput()) {
      return;
    }
    const data = {
      email: inputDetails.email,
    };

    setLoading(true);
    setMessage({text: '', type: null});

    try {
      const response = await postData(
        `${ENDPOINTS.forgotpassword}?email=${data.email}`,
      );

      if (response.status === 400) {
        setMessage({text: 'Account not found', type: 'error'});
      } else {
        setMessage({
          text: 'Password reset token sent to your email.',
          type: 'success',
        });

        setTimeout(() => {
          navigation.navigate('resetPassword', {
            isEmail: inputDetails.email,
          });
        }, 3000);
      }
    } catch (error: any) {
      setMessage({
        text: 'Account not found',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={IMAGES.authBackground}
      style={[
        styles.background,
        {
          paddingTop: verticalScale(50) + insets.top,
          paddingBottom: verticalScale(10) + insets.bottom,
        },
      ]}>
      <View style={styles.headerContainer}>
        <Image source={IMAGES.logo} style={styles.logo} />
      </View>
      <KeyboardAvoidingContainer
        backgroundColor="transparent"
        style={styles.keyboardAvoidingContainer}>
        <View style={styles.footerContainer}>
          {errors.email && (
            <View style={styles.errorContainer}>
              <CustomText
                fontSize={14}
                fontFamily="medium"
                color={COLORS.red}
                style={styles.errorText}>
                {errors.email}
              </CustomText>
            </View>
          )}
          {message.text && (
            <View style={styles.errorContainer}>
              <CustomText
                fontSize={14}
                fontFamily="medium"
                color={message.type === 'success' ? COLORS.green : COLORS.red}
                style={styles.errorText}>
                {message.text}
              </CustomText>
            </View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              value={inputDetails.email}
              onChangeText={text =>
                setInputDetails({...inputDetails, email: text})
              }
              placeholder="Email Address"
              placeholderTextColor={COLORS.white}
              style={styles.textInput}
            />
          </View>

          <PrimaryButton
            isFullWidth
            title="Forgot password"
            onPress={handleForgotPassword}
            isLoading={loading}
          />
          <CustomText
            fontSize={12}
            fontFamily="medium"
            style={styles.legalText}>
            By continuing, you acknowledge and accept GymLogix's{' '}
            <CustomText color={COLORS.yellow} fontFamily="medium" fontSize={12}>
              privacy policy
            </CustomText>{' '}
            and{' '}
            <CustomText color={COLORS.yellow} fontFamily="medium" fontSize={12}>
              Terms & Conditions
            </CustomText>
          </CustomText>
        </View>
      </KeyboardAvoidingContainer>
    </ImageBackground>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  // Background Styles
  background: {
    flex: 1,
    width: wp(100),
    height: hp(100),
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: verticalScale(10),
    backgroundColor: COLORS.black,
  },

  // Header (Top Section) Styles
  headerContainer: {
    alignItems: 'center',
    gap: verticalScale(10),
  },
  logo: {
    height: verticalScale(66),
    width: wp(80),
    resizeMode: 'contain',
  },

  // Keyboard Avoiding Container Styles
  keyboardAvoidingContainer: {
    justifyContent: 'flex-end',
  },

  // Footer (Bottom Section) Styles
  footerContainer: {
    alignItems: 'center',
    gap: verticalScale(10),
  },
  inputContainer: {
    marginVertical: verticalScale(20),
    gap: verticalScale(15),
  },
  textInput: {
    backgroundColor: 'transparent',
    width: wp(85),
    borderBottomColor: COLORS.white,
    borderBottomWidth: 1,
    fontFamily: FONTS.medium,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(10),
    color: COLORS.white,
  },
  errorContainer: {
    backgroundColor: COLORS.darkBrown,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(5),
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 40,
  },
  errorText: {
    textAlign: 'center',
  },
  legalText: {
    textAlign: 'center',
    width: wp(90),
    marginTop: verticalScale(20),
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'medium',
  },
});
