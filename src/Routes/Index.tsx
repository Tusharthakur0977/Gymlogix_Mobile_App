import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet} from 'react-native';
import Account from '../Screens/Account';
import Home from '../Screens/Home';
import Search from '../Screens/Search';
import Shop from '../Screens/Shop';
import Splash from '../Screens/Splash';
import StyleGuide from '../Screens/StyleGuide';
import {
  BottomStackTabParams,
  MainStackParams,
  RootStackParams,
} from '../Typings/route';
import BottomTabBar from '../Components/BottomTabBar';
import Cart from "../Screens/Cart";
import SingleProduct from "../Screens/SingleProduct";
import Login from "../Screens/Login";
import OtpScreen from "../Screens/OtpScreen";
import Collection from "../Screens/Collection";
import RegisterScreen from "../Screens/RegisterScreen";
import ForgotPassword from "../Screens/ForgotPassword";
import UpdatePassword from "../Screens/UpdatePassword";
import TermsOfServices from "../Screens/TermsofServices";
import PrivacyCookies from "../Screens/PrivacyCookies";
import RefundPolicy from "../Screens/RefundPolicy";
import FaqScreen from "../Screens/FaqScreen";
import FindAStore from "../Screens/FindAStore";
import HijabDesign from "../Screens/HijabDesign";
import HowToBuy from "../Screens/HowToBuy";
import PaymentOption from "../Screens/PaymentOptions";

const Root = createNativeStackNavigator<RootStackParams>();
const Main = createNativeStackNavigator<MainStackParams>();
const Tabs = createBottomTabNavigator<BottomStackTabParams>();

const Routing = () => {
  const tabStack = () => {
    return (
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <BottomTabBar {...props} />}
      >
        <Tabs.Screen name="home" component={Home} />
        <Tabs.Screen name="shop" component={Shop} />
        <Tabs.Screen name="search" component={Search} />
        <Tabs.Screen name="styleGuide" component={StyleGuide} />
        <Tabs.Screen name="account" component={Account} />
      </Tabs.Navigator>
    );
  };

  const mainStack = () => {
    return (
      <Main.Navigator screenOptions={{ headerShown: false }}>
        <Main.Screen name="tabs" component={tabStack} />
        <Main.Screen name="cart" component={Cart} />
        <Main.Screen name="singleProduct" component={SingleProduct} />
        <Main.Screen name="login" component={Login} />
        <Main.Screen name="collection" component={Collection} />
        <Main.Screen name="registerScreen" component={RegisterScreen} />
        <Main.Screen name="forgotPassword" component={ForgotPassword} />
        <Main.Screen name="updatePassword" component={UpdatePassword} />
        <Main.Screen name="termsOfServices" component={TermsOfServices} />
        <Main.Screen name="privacyCookies" component={PrivacyCookies} />
        <Main.Screen name="refundPolicy" component={RefundPolicy} />
        <Main.Screen name="faqScreen" component={FaqScreen} />
        <Main.Screen name="findAStore" component={FindAStore} />
        <Main.Screen name="hijabDesign" component={HijabDesign} />
        <Main.Screen name="howToBuy" component={HowToBuy} />
        <Main.Screen name="paymentOption" component={PaymentOption} />
      </Main.Navigator>
    );
  };

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      <Root.Screen name="splash" component={Splash} />
      <Root.Screen name="mainStack" component={mainStack} />
    </Root.Navigator>
  );
};

export default Routing;

const styles = StyleSheet.create({});
