import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { ShopifyCheckoutSheetProvider } from "@shopify/checkout-sheet-kit";
import React from "react";
import { LogBox, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CountryPicker from "./src/Components/Modals/CountryPicker";
import Routing from "./src/Routes/Index";
import COLORS from "./src/Utilities/Colors";
import NetworkLogger from "./src/Components/NetworkLogger";
LogBox.ignoreAllLogs();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ShopifyCheckoutSheetProvider configuration={{}}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <StatusBar
              backgroundColor={COLORS.white}
              barStyle={"dark-content"}
            />
            <NavigationContainer>
              <Routing />
              <CountryPicker />
              {__DEV__ && <NetworkLogger />}
            </NavigationContainer>
            <Toast />
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </ShopifyCheckoutSheetProvider>
    </GestureHandlerRootView>
  );
};

export default App;
