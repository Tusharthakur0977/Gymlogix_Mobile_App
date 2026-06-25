import React from 'react';
import {StyleSheet, View} from 'react-native';
import {BaseToastProps} from 'react-native-toast-message';
import COLORS from '../Utilities/Colors';

import {horizontalScale} from '../Utilities/Metrics';
import {CustomText} from './CustomText';

const getStylesByType = (type: string) => {
  switch (type) {
    case 'success':
      return {
        container: {
          backgroundColor: COLORS.white,
          borderLeftWidth: 10,
          borderLeftColor: 'green',
        },
      };
    case 'error':
      return {
        container: {
          backgroundColor: COLORS.white,
          borderLeftWidth: 10,
          borderLeftColor: 'crimson',
        },
      };
    case 'info':
    default:
      return {
        container: {
          backgroundColor: COLORS.white,
          borderLeftWidth: 10,
          borderLeftColor: 'skyblue',
        },
      };
  }
};

const CustomToast = ({text1, type}: BaseToastProps & {type?: string}) => {
  const toastType = type || 'info';
  const {container} = getStylesByType(toastType);

  return (
    <View style={[styles.toastContainer, container]}>
      <CustomText fontSize={14} fontFamily="bold" color={COLORS.black}>
        {text1}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    gap: horizontalScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
  },
  //   toastText: {
  //     color: COLORS.midnightgrey,
  //     fontSize: 12,
  //     flex: 1,
  //     flexWrap: "wrap",
  //   },
});

export default CustomToast;
