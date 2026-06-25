import React, { FC } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IMAGES from '../../Assets/Images';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import { WelcomeProps } from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import { hp, verticalScale, wp } from '../../Utilities/Metrics';

const Welcome: FC<WelcomeProps> = ({navigation}) => {
  const insets = useSafeAreaInsets();

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
      <View style={styles.header}>
        <Image source={IMAGES.logo} style={styles.logo} />
        <CustomText
          fontSize={30}
          fontFamily="italicBold"
          color={COLORS.whiteTail}>
          Fuel Your Goals
        </CustomText>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          isFullWidth
          title="Sign up"
          onPress={() => navigation.navigate('signUp')}
        />
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate('signIn')}>
          <CustomText fontFamily="bold">Already have an account</CustomText>
        </TouchableOpacity>
        <CustomText
          fontSize={12}
          fontFamily="medium"
          style={{
            textAlign: 'center',
            width: wp(90),
            marginTop: verticalScale(20),
          }}>
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
    </ImageBackground>
  );
};

export default Welcome;

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
  header: {
    alignItems: 'center',
    gap: verticalScale(10),
  },
  logo: {
    height: verticalScale(66),
    width: wp(80),
    resizeMode: 'contain',
  },

  // Footer (Bottom Section) Styles
  footer: {
    alignItems: 'center',
    gap: verticalScale(10),
  },
  linkContainer: {
    marginTop: verticalScale(10), // Moved from inline, using GAP_SIZE for consistency
  },
  linkText: {
    fontFamily: 'bold',
    color: COLORS.white, // Default color for consistency with dark background
  },
  legalText: {
    fontSize: 12,
    fontFamily: 'medium',
    textAlign: 'center',
    width: wp(90),
    color: COLORS.white, // Default color for consistency with dark background
    marginTop: verticalScale(20), // Moved from inline, added for spacing
  },
  legalLink: {
    color: COLORS.yellow,
    fontFamily: 'medium',
    fontSize: 12,
  },
});
