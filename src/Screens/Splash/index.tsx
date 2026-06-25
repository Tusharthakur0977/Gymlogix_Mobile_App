import {Appearance, Image, StyleSheet} from 'react-native';
import React, { FC, useEffect } from "react";
import IMAGES from "../../Assets/Images";
import { hp } from "../../Utilities/Metrics";
import { useNavigation } from "@react-navigation/native";
import { SplashScreenProps } from "../../Typings/route";

const Splash: FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    Appearance.setColorScheme("light");

    const timeout = setTimeout(() => {
      navigation.replace("mainStack", {
        screen: "tabs",
        params: { screen: "home" },
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [navigation]);

  return <Image source={IMAGES.splash} style={styles.image} />;
};

export default Splash;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: "100%",
    height: hp(93),
    alignSelf: "center",
  },
});
