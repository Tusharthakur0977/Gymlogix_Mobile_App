import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import COLORS from "../../Utilities/Colors"; // Assuming you have a colors file
import { verticalScale } from "../../Utilities/Metrics"; // Assuming you have metrics utilities

interface UploadImageSelectionSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const UploadImageSelectionSheet: React.FC<UploadImageSelectionSheetProps> = ({
  isVisible,
  onClose,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // Handle backdrop press to close the bottom sheet
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onClose}
      />
    ),
    [onClose]
  );

  // Automatically open/close the bottom sheet based on isVisible
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1} // -1 means closed, 0 means first snap point
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: COLORS.darkBrown }}
    >
      <View style={styles.bottomSheetContent}>
        <Text style={styles.bottomSheetTitle}>Bottom Sheet</Text>
        <Text style={styles.bottomSheetText}>
          This is a bottom sheet that appears above the bottom tabs.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: verticalScale(20),
    alignItems: "center",
    height:300
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: verticalScale(10),
  },
  bottomSheetText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  closeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(10),
    paddingHorizontal: verticalScale(20),
    borderRadius: 10,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UploadImageSelectionSheet;
