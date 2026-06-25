import { AppRegistry } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import App from "./App";
import { name as appName } from "./app.json";
import { store } from "./src/Redux/store";

const AppWrapper = () => (
  <GestureHandlerRootView>
    <Provider store={store}>
      <App />
    </Provider>
  </GestureHandlerRootView>
);

AppRegistry.registerComponent(appName, () => AppWrapper);
