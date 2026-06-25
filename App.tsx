import {NavigationContainer, NavigationState} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {Appearance, LogBox, StatusBar, StatusBarStyle} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {setCurrentRoute} from './src/Redux/slices/initialSlice';
import {useAppDispatch, useAppSelector} from './src/Redux/store';
import Routing from './src/Routes';
import COLORS from './src/Utilities/Colors';
import CustomToast from './src/Components/CustomToast';
import NetworkLogger from './src/Components/NetworkLogger';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {endConnection, initConnection} from 'react-native-iap';

LogBox.ignoreAllLogs();

GoogleSignin.configure({
  webClientId:
    '489484992575-21a4bbf1shlr2g7vhkhsbqvk16s97mi2.apps.googleusercontent.com', // From Firebase console settings
});

const App = () => {
  const dispatch = useAppDispatch();
  const {currentRoute} = useAppSelector(state => state.initial);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Function to get the current route name from navigation state
  const getCurrentRouteName = (state: any): string | null => {
    if (!state) return null;

    const route = state.routes[state.index];
    if (route.state) {
      // If the route has nested navigators, recurse into the nested state
      return getCurrentRouteName(route.state);
    }
    return route.name;
  };

  // Handler for navigation state changes
  const handleNavigationStateChange = (
    state: Readonly<NavigationState> | undefined,
  ) => {
    const routeName = getCurrentRouteName(state);
    const routeHistory: any = state?.routes.find(
      item => item.name === 'mainStack',
    )?.state?.history;

    setIsDrawerOpen(
      routeHistory?.find((item: any) => item.type === 'drawer')?.status ===
        'open',
    );
    dispatch(setCurrentRoute(routeName));
  };

  const authRoutes = [
    'splash',
    'welcome',
    'signIn',
    'signUp',
    'forgotpassword',
    'resetPassword',
    'workoutResult',
    'addExercise',
    'addNewExercise',
    'addNewWorkout',
    'ingredientList',
  ];

  const statusBarColor = useMemo((): {
    bgColor: string;
    content: StatusBarStyle;
  } => {
    if (authRoutes.includes(currentRoute!)) {
      if (
        currentRoute === 'workoutResult' ||
        currentRoute === 'addNewExercise' ||
        currentRoute === 'addExercise' ||
        currentRoute === 'addNewWorkout' ||
        currentRoute === 'ingredientList'
      ) {
        return {
          bgColor: COLORS.darkBrown,
          content: 'light-content',
        };
      } else {
        return {
          bgColor: COLORS.black,
          content: 'light-content',
        };
      }
    } else if (currentRoute === 'SETTINGS') {
      return {
        bgColor: '#1C1816',
        content: 'light-content',
      };
    } else if (!authRoutes.includes(currentRoute!)) {
      return {
        bgColor: COLORS.brown,
        content: 'light-content',
      };
    } else {
      return {
        bgColor: COLORS.black,
        content: 'default',
      };
    }
  }, [currentRoute]);

  useEffect(() => {
    Appearance.setColorScheme('light');
  }, []);

  useEffect(() => {
    // 1. Initialize the connection
    const initializeIAP = async () => {
      try {
        console.log('Attempting to initialize IAP connection...');
        const result = await initConnection();
        console.log('IAP Connection successful:', result);

        // 2. Set the state only upon success
      } catch (error) {
        console.error('[IAP Error] initConnection failed:', error);
      }
    };

    initializeIAP();
    // Cleanup: Disconnect when the component unmounts
    return () => {
      endConnection();
      console.log('IAP Connection ended.');
    };
  }, []);

  return (
    <>
      <SafeAreaProvider>
        <StatusBar
          backgroundColor={currentRoute ? statusBarColor.bgColor : COLORS.black}
          barStyle={statusBarColor.content}
        />
        <NavigationContainer onStateChange={handleNavigationStateChange}>
          <Routing />
        </NavigationContainer>
        {__DEV__ && <NetworkLogger />}
        <Toast
          config={{
            customToast: props => {
              return <CustomToast {...props} type={props?.props.type} />;
            },
          }}
        />
      </SafeAreaProvider>
    </>
  );
};

export default App;
