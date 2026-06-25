import {Text, type TextProps} from 'react-native';
import FONTS, {FontFamilyType} from '../Assets/fonts';
import COLORS from '../Utilities/Colors';
import {responsiveFontSize} from '../Utilities/Metrics';

export type CustomTextProps = TextProps & {
  color?: string;
  fontFamily?: FontFamilyType;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
};

export function CustomText({
  style,
  fontFamily = 'regular',
  fontSize = 16,
  fontWeight = '400',
  color = COLORS.white,
  lineHeight,
  ...rest
}: CustomTextProps) {
  return (
    <Text
      style={[
        {
          color,
          fontFamily: FONTS[fontFamily],
          fontSize: responsiveFontSize(fontSize),
          opacity: rest.disabled ? 0.7 : 1,
        },
        style,
      ]}
      {...rest}
    />
  );
}
