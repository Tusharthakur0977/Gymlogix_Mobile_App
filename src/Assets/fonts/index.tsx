const FONTS = {
  light: 'Inter-Light',
  thin: 'Inter-Thin',
  medium: 'Inter-Medium',
  regular: 'Inter-Regular',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
  italic: 'Inter-Italic',
  italicBold: 'Inter-BoldItalic',
};

export default FONTS;

export type FontFamilyType = keyof typeof FONTS;
