import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  Keyboard,
} from "react-native";

interface KeyboardAvoidingContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollEnabled?: boolean;
  backgroundColor?: string;
  bounce?: boolean;
  keyboardOffset?: number;
}

export interface KeyboardAvoidingContainerRef {
  scrollToTop: () => void;
}

export const KeyboardAvoidingContainer = forwardRef<
  KeyboardAvoidingContainerRef,
  KeyboardAvoidingContainerProps
>(
  (
    {
      children,
      style,
      scrollEnabled = true,
      backgroundColor = "transparent",
      bounce = false,
      keyboardOffset = 0,
    },
    ref
  ) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        if (scrollEnabled && scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      },
    }));

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        () => {
          setIsKeyboardVisible(true);
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => {
          setIsKeyboardVisible(false);
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);

    if (scrollEnabled) {
      return (
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={
            Platform.OS === "ios" ? 0 : isKeyboardVisible ? keyboardOffset : 0
          }
        >
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, style]}
            keyboardShouldPersistTaps="handled"
            bounces={bounce}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 0 : isKeyboardVisible ? 10 : 0
        }
      >
        <View style={[styles.content, style]}>{children}</View>
      </KeyboardAvoidingView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Allow content to grow but not push excessively
  },
  content: {
    flex: 1,
  },
});
