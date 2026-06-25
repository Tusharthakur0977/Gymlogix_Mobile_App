import React, {FC, useState} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FONTS from '../../Assets/fonts';
import IMAGES from '../../Assets/Images';
import CustomInput from '../../Components/CustomInput';
import {CustomText} from '../../Components/CustomText';
import {KeyboardAvoidingContainer} from '../../Components/KeyboardAvoidingComponent';
import PrimaryButton from '../../Components/PrimaryButton';
import {ResetPasswordProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics';
import {showCustomToast} from '../../Utilities/Helpers';
import {postData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';

const ResetPassword: FC<ResetPasswordProps> = ({navigation, route}) => {
  const {isEmail} = route.params;
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputDetails, setInputDetails] = useState({
    newPassword: '',
    consfirmNewPassword: '',
  });
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | null;
  }>({
    text: '',
    type: null,
  });

  const [errors, setErrors] = useState({
    code: '',
    newpassword: '',
    confirmpassword: '',
  });

  const validInputs = () => {
    let valid = true;
    let newErrors = {
      code: '',
      newpassword: '',
      confirmpassword: '',
    };

    if (!code) {
      valid = false;
      newErrors.code = 'Code is required.';
    }

    if (!inputDetails.newPassword) {
      valid = false;
      newErrors.newpassword = 'New password is required';
    }

    if (!inputDetails.consfirmNewPassword.trim()) {
      valid = false;
      newErrors.confirmpassword = 'Confirm new password is required.';
    } else if (inputDetails.newPassword !== inputDetails.consfirmNewPassword) {
      valid = false;
      newErrors.confirmpassword = 'Confirm new passwords do not match.';
    }

    setErrors(newErrors);
    setMessage({text: '', type: null});

    return valid;
  };

  const handleResetPassword = async () => {
    if (!validInputs()) {
      return;
    }
    const data = {
      email: isEmail,
      token: code,
      password: inputDetails.newPassword,
      password_confirmation: inputDetails.consfirmNewPassword,
    };

    setLoading(true);
    setMessage({text: '', type: null});

    try {
      const response = await postData<any>(
        `${ENDPOINTS.reset_password}?email=${data.email}&token=${data.token}&password=${data.password}&password_confirmation=${data.password_confirmation}`,
      );

      if (response.status === 200) {
        setIsPasswordReset(true);
        setMessage({
          text: 'Password has been reset successfully.',
          type: 'success',
        });
      } else {
        setMessage({
          type: 'error',
          text: response.data.data.reason || 'Something went wrong',
        });
      }
    } catch (error: any) {
      setMessage({
        text: error.reason || 'Something went wrong',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={IMAGES.authBackground2}
      style={[
        styles.background,
        {
          paddingTop: verticalScale(50) + insets.top,
          paddingBottom: verticalScale(10) + insets.bottom,
        },
      ]}>
      <KeyboardAvoidingContainer
        backgroundColor="transparent"
        style={styles.keyboardAvoidingContainer}>
        <View style={styles.footerContainer}>
          <CustomText
            color={COLORS.white}
            fontFamily="italicBold"
            fontSize={32}>
            Reset your Password
          </CustomText>
          {isPasswordReset ? (
            <View style={styles.successCont}>
              <CustomText
                style={styles.successText}
                color={COLORS.green}
                fontFamily="medium">
                Password reset sucessfully
              </CustomText>
            </View>
          ) : (
            <>
              {Object.values(errors).some(error => error !== '') && (
                <View style={styles.errorContainer}>
                  <CustomText
                    fontSize={14}
                    fontFamily="medium"
                    color={COLORS.red}
                    style={styles.errorText}>
                    {errors.code ||
                      errors.newpassword ||
                      errors.confirmpassword}
                  </CustomText>
                </View>
              )}

              {message.text && (
                <View style={styles.errorContainer}>
                  <CustomText
                    fontSize={14}
                    fontFamily="medium"
                    color={
                      message.type === 'success' ? COLORS.green : COLORS.red
                    }
                    style={styles.errorText}>
                    {message.text}
                  </CustomText>
                </View>
              )}
              <View style={styles.inputContainer}>
                <CustomInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Code"
                  placeholderTextColor={COLORS.white}
                  style={styles.textInputCode}
                />
                <CustomInput
                  value={inputDetails.newPassword}
                  onChangeText={text =>
                    setInputDetails({...inputDetails, newPassword: text})
                  }
                  placeholder="New Password"
                  placeholderTextColor={COLORS.white}
                  type="password"
                />
                <CustomInput
                  value={inputDetails.consfirmNewPassword}
                  onChangeText={text =>
                    setInputDetails({
                      ...inputDetails,
                      consfirmNewPassword: text,
                    })
                  }
                  placeholder="Confirm New Password"
                  placeholderTextColor={COLORS.white}
                  type="password"
                />
              </View>
            </>
          )}
          <PrimaryButton
            isFullWidth
            title={isPasswordReset ? 'Back to Login' : 'Reset Password'}
            onPress={() => {
              if (isPasswordReset) {
                navigation.replace('signIn');
              } else {
                handleResetPassword();
              }
            }}
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

export default ResetPassword;

const styles = StyleSheet.create({
  // Background Styles
  background: {
    flex: 1,
    width: wp(100),
    height: hp(100),
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: verticalScale(10),
    backgroundColor: COLORS.black,
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(10),
  },

  // Keyboard Avoiding Container Styles
  keyboardAvoidingContainer: {
    justifyContent: 'flex-end',
    paddingBottom: 0, // Will be adjusted dynamically via insets if needed
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
    marginBottom: verticalScale(10),
  },
  textInputCode: {
    marginBottom: verticalScale(30),
  },
  legalText: {
    textAlign: 'center',
    width: wp(90),
    marginTop: verticalScale(20),
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'medium',
  },
  successCont: {
    backgroundColor: 'transparent',
    minHeight: hp(20),
    justifyContent: 'center',
  },
  successText: {
    textAlign: 'center',
    backgroundColor: COLORS.darkBrown,
    paddingHorizontal: horizontalScale(40),
    paddingVertical: verticalScale(5),
    borderRadius: 10,
  },
  errorContainer: {
    backgroundColor: COLORS.darkBrown,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(5),
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 30,
  },
  errorText: {
    textAlign: 'center',
  },
});
