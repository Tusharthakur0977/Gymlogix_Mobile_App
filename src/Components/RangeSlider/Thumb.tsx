import React, { memo } from "react";
import { StyleSheet, View } from "react-native";

const THUMB_RADIUS = 10.5;

const Thumb = () => <View style={styles.root} />;

const styles = StyleSheet.create({
  root: {
    width: THUMB_RADIUS * 2,
    height: THUMB_RADIUS * 2,
    borderRadius: THUMB_RADIUS,
    borderWidth: 2,
    borderColor: "#2482DC",
    backgroundColor: "#1C1816",
  },
});

export default memo(Thumb);
