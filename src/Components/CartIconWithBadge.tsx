import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomIcon from './CustomIcon';
import ICONS from '../Assets/Icons';
import { CustomText } from './CustomText';
import COLORS from '../Utilities/Colors';
import { useAppSelector } from '../Redux/store';

interface CartIconWithBadgeProps {
  width?: number;
  height?: number;
}

const CartIconWithBadge: React.FC<CartIconWithBadgeProps> = ({ 
  width = 20, 
  height = 20 
}) => {
  const navigation = useNavigation();
  const { cartItems } = useAppSelector(state => state.cart);
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.navigate('cart')}
    >
      <CustomIcon 
        Icon={ICONS.CartIcon} 
        width={width} 
        height={height} 
      />
      {cartItems > 0 && (
        <View style={styles.badge}>
          <CustomText 
            fontSize={8} 
            fontFamily="medium" 
            color={COLORS.white}
          >
            {cartItems > 99 ? '99+' : cartItems}
          </CustomText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.black,
    borderRadius: 10,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
});

export default CartIconWithBadge;