import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import ICONS from '../Assets/Icons';
import COLORS from '../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../Utilities/Metrics';
import CustomIcon from './CustomIcon';
import { CustomText } from './CustomText';

type GoogleButtonProps = {
  onPress: () => void;
};

const GoogleButton: FC<GoogleButtonProps> = ({onPress}) => {
  return (
    <TouchableOpacity
    onPress={onPress}
      style={{
        backgroundColor: COLORS.white,
        paddingVertical: verticalScale(12),
        paddingHorizontal: horizontalScale(20),
        borderRadius: verticalScale(16),
        alignItems: 'center',
        marginVertical: verticalScale(5),
        width: wp(90),
        alignSelf: 'center',
        flexDirection: 'row',
      }}>
      <CustomIcon Icon={ICONS.GoogleIcon} />
      <CustomText
        fontFamily="medium"
        style={{textAlign: 'center', flex: 1}}
        color={COLORS.black}>
        Continue with Google
      </CustomText>
    </TouchableOpacity>
  );
};

export default GoogleButton;

const styles = StyleSheet.create({});
