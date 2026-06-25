import React, {FC} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import COLORS from '../Utilities/Colors';
import {horizontalScale, verticalScale, wp} from '../Utilities/Metrics';
import {CustomText} from './CustomText';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
  textSize?: number;
  isFullWidth?: boolean;
  isLoading?: boolean;
};

const PrimaryButton: FC<PrimaryButtonProps> = ({
  title,
  onPress,
  backgroundColor = COLORS.yellow,
  disabled = false,
  textColor = COLORS.white,
  style,
  textSize = 16,
  isFullWidth = true,
  isLoading = false,
}) => {
  const color = disabled ? COLORS.lightGrey : textColor;
  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      style={[
        isFullWidth && styles.button,
        {
          backgroundColor,
          opacity: disabled ? 0.8 : 1,
        },
        style,
      ]}
      onPress={onPress}>
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <CustomText fontFamily="bold" fontSize={textSize} color={color}>
          {title}
        </CustomText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(20),
    borderRadius: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(5),
    width: wp(90),
    alignSelf: 'center',
    // height: 50,
  },
});

export default PrimaryButton;
