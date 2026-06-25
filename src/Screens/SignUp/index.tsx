import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import React, {FC, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {fetchData, postData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';
import IMAGES from '../../Assets/Images';
import CustomInput from '../../Components/CustomInput';
import {CustomText} from '../../Components/CustomText';
import GoogleButton from '../../Components/GoogleButton';
import PrimaryButton from '../../Components/PrimaryButton';
import {setExerciseCatalog} from '../../Redux/slices/exerciseCatalogSlice';
import {setExerciseData} from '../../Redux/slices/ExerciseSlice';
import {setFoodData} from '../../Redux/slices/foodSlice';
import {setIngredients} from '../../Redux/slices/ingredientSlice';
import {setInsightData} from '../../Redux/slices/InsightSlice';
import {setMeal} from '../../Redux/slices/myMealsSlice';
import {setPlanData} from '../../Redux/slices/PlanDataSlice';
import {
  ScheduleAPIData,
  setScheduleData,
} from '../../Redux/slices/ScheduleSlice';
import {setUserData} from '../../Redux/slices/UserSlice';
import {useAppDispatch} from '../../Redux/store';
import {ExerciseResponse} from '../../Typings/ApiResponse/ExerciseResponse';
import {FoodResponse} from '../../Typings/ApiResponse/FoodResponse';
import {GetPlanResponse} from '../../Typings/ApiResponse/GetPlanResponse';
import {MealResponse} from '../../Typings/ApiResponse/MyMealResponse';
import {UserResponse} from '../../Typings/ApiResponse/UserResponse';
import {SignUpProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import STORAGE_KEYS from '../../Utilities/Constants';
import {showCustomToast} from '../../Utilities/Helpers';
import {horizontalScale, hp, verticalScale, wp} from '../../Utilities/Metrics';
import {storeLocalStorageData} from '../../Utilities/Storage';
import {GoogleSignINResponse} from '../SignIn';
import {buildExerciseCatalog} from '../Splash';

const SignUp: FC<SignUpProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [googleLoader, setgoogleLoader] = useState(false);

  const [loginDetails, setLoginDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repassword: '',
  });

  const [error, setErrors] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    repassword: '',
  });

  const validInputs = () => {
    let valid = true;
    let newErrors = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      repassword: '',
    };
    if (!loginDetails.firstName.trim()) {
      valid = false;
      newErrors.firstname = 'First name is required.';
      showCustomToast('error', newErrors.firstname);
      return;
    }
    if (!loginDetails.lastName.trim()) {
      valid = false;
      newErrors.lastname = 'Last name is required.';
      showCustomToast('error', newErrors.lastname);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!loginDetails.email.trim()) {
      valid = false;
      newErrors.email = 'Email is required.';
      showCustomToast('error', newErrors.email);
      return;
    } else if (!emailRegex.test(loginDetails.email)) {
      valid = false;
      newErrors.email = 'Invalid email format.';
      showCustomToast('error', newErrors.email);
      return;
    }
    if (!loginDetails.password) {
      valid = false;
      newErrors.password = 'Password is required';
      showCustomToast('error', newErrors.password);
      return;
    }
    if (!loginDetails.repassword.trim()) {
      valid = false;
      newErrors.repassword = 'Re Password is required.';
      showCustomToast('error', newErrors.repassword);
      return;
    } else if (loginDetails.password !== loginDetails.repassword) {
      valid = false;
      newErrors.repassword = 'Re Passwords do not match.';
      showCustomToast('error', newErrors.repassword);
      return;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSignUp = async () => {
    if (!validInputs()) {
      return;
    }
    const data = {
      first_name: loginDetails.firstName,
      last_name: loginDetails.lastName,
      email: loginDetails.email,
      password: loginDetails.password,
      password_confirmation: loginDetails.repassword,
      locale: 'en-US',
      platform: Platform.OS === 'android' ? 'android' : 'ios',
      device_id: await DeviceInfo.getUniqueId(),
    };

    setLoading(true);

    try {
      const response = await postData(
        `${ENDPOINTS.signup}?email=${data.email}&password=${data.password}&password_confirmation=${data.password_confirmation}&locale=${data.locale}&platform=${data.platform}&device_id=${data.device_id}&first_name=${data.first_name}&last_name=${data.last_name}`,
      );
      if (response.status === 200) {
        showCustomToast('success', 'User successfully registered');
        navigation.navigate('signIn');
      }
    } catch (error: any) {
      showCustomToast('error', error.reason || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const result = await GoogleSignin.signIn();
      console.log('Google Sign-In Result:', result);

      // 🚨 USER CANCELLED
      if (result?.type === 'cancelled') {
        Alert.alert('Sign In Cancelled', 'You cancelled the Google sign-in.');
        return;
      }

      const idToken = result?.data?.idToken;

      // 🚨 NO TOKEN
      if (!idToken) {
        Alert.alert(
          'Sign In Failed',
          'Unable to get Google token. Please try again.',
        );
        return;
      }

      // ✅ SUCCESS
      await handleSocialLogin(idToken);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);

      const errorCode =
        typeof err === 'object' && err !== null && 'code' in err
          ? (err as any).code
          : null;

      switch (errorCode) {
        case statusCodes.IN_PROGRESS:
          Alert.alert(
            'Sign In In Progress',
            'Google Sign-In is already in progress.',
          );
          break;

        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          Alert.alert(
            'Play Services Error',
            'Google Play Services is not available or outdated.',
          );
          break;

        default:
          Alert.alert(
            'Sign In Failed',
            'Something went wrong. Please try again.',
          );
      }
    }
  };

  const storeAllHashes = async () => {
    const hashResponse = await fetchData<any>(ENDPOINTS.allGet);
    if (hashResponse.data) {
      const {foods_hash, exercises_hash, plans_hash} = hashResponse.data;
      await storeLocalStorageData(STORAGE_KEYS.allHashes, {
        foods_hash,
        exercises_hash,
        plans_hash,
      });
    }
  };

  const getFoodData = async () => {
    const response = await fetchData<FoodResponse>(ENDPOINTS.foodGet);

    if (response.data.data) {
      await storeLocalStorageData(
        STORAGE_KEYS.localFoodData,
        response.data.data,
      );

      dispatch(setFoodData(response.data.data));

      dispatch(
        setIngredients(
          response.data.data.map(item => ({
            id: item.id,
            idFood: Number(item.food_id),
            title: item.name,
            percentage: 0,
            image: item.image_url,
            calories: [
              item.calories || 0,
              item.carbs || 0,
              item.fat || 0,
              item.protein || 0,
            ],
            quantity: item.serving_size_amount?.toString(),
            measurementUnit: item.serving_size_measurement,
            size: item.serving_weight_grams,
          })),
        ),
      );

      await getMealData(response.data);
    }
  };

  const getMealData = async (foodList: FoodResponse) => {
    const response = await fetchData<MealResponse>(ENDPOINTS.getMeal);

    if (response.data.data) {
      await storeLocalStorageData(
        STORAGE_KEYS.localMealData,
        response.data.data,
      );

      dispatch(
        setMeal(
          response.data.data.map(item => ({
            id: item.meal_id,
            userId: item.user_id,
            coverImage: {
              uri: item.image_url,
            },
            title: item.name,
            description: item.description,
            macros: {
              calories: item.calories,
              fat: item.fats,
              carbs: item.carbs,
              protein: item.protein,
            },
            instructions: item.preparation_instructions,
            isPublic: item.is_public,
            ingredients: item.foods.map(food => {
              const match = foodList.data?.find(
                f => f.food_id === food.food_id,
              );

              return {
                id: food.food_id?.toString(),
                idFood: Number(food.food_id),
                title: match?.name || 'Unknown',
                image:
                  match?.image_url ||
                  'https://nix-tag-images.s3.amazonaws.com/384_highres.jpg',
                quantity: match?.serving_size_amount?.toString()!,
                percentage: 0,
                calories: [
                  Number(match?.calories) || 0,
                  Number(match?.carbs) || 0,
                  Number(match?.fat) || 0,
                  Number(match?.protein) || 0,
                ],
                size: match?.serving_weight_grams || 0,
                measurementUnit: match?.serving_size_measurement || 'gram',
              };
            }),
            mealImages: [],
            tags: item.tags,
          })),
        ),
      );
    }
  };

  const getPlanData = async () => {
    const response = await fetchData<GetPlanResponse>(ENDPOINTS.planGet);

    if (response.data.data) {
      await storeLocalStorageData(
        STORAGE_KEYS.localWorkoutData,
        response.data.data,
      );

      dispatch(
        setPlanData(
          response.data.data.map(item => ({
            id: item.id,
            planId: item.plan_id!,
            title: item.name || '',
            coverImage:
              item.image_url ||
              'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=1598&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            tags: item.tags,
            type: item.type === 'workout' ? 'workout' : 'food',
            allData: item,
          })),
        ),
      );

      await getExerciseData();
    }
  };

  const getExerciseData = async () => {
    const response = await fetchData<ExerciseResponse>(ENDPOINTS.exerciseGet);

    if (response.data.data) {
      const exerciseList = response.data.data;

      await storeLocalStorageData(STORAGE_KEYS.localExerciseData, exerciseList);

      await storeLocalStorageData(
        STORAGE_KEYS.localExerciseCatalog,
        exerciseList,
      );

      dispatch(setExerciseData(exerciseList));

      const catalog = buildExerciseCatalog(exerciseList);
      dispatch(setExerciseCatalog(catalog));
    }
  };

  const getScheduleData = async () => {
    try {
      const response = await fetchData<ScheduleAPIData[] | any>(
        ENDPOINTS.schedule,
      );
      if (response.data) {
        await storeLocalStorageData(
          STORAGE_KEYS.localScheduleData,
          response.data,
        );

        dispatch(setScheduleData(response.data.data));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const getInsight = async () => {
    try {
      const response = await fetchData<any>(ENDPOINTS.get_insight);
      if (response.data.data) {
        await storeLocalStorageData(
          STORAGE_KEYS.localInsight,
          response.data.data,
        );
        dispatch(setInsightData(response.data.data));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleSocialLogin = async (id_token: string) => {
    // 3. Convert to Firebase credential
    const googleCredential = auth.GoogleAuthProvider.credential(id_token);

    // 4. Sign into Firebase
    const userCredential = await auth().signInWithCredential(googleCredential);

    const firebaseIdToken = await userCredential.user.getIdToken();

    try {
      setgoogleLoader(true);

      const response = await postData<GoogleSignINResponse>(
        `${ENDPOINTS.googleSign}?id_token=${firebaseIdToken}`,
      );

      if (response.status === 200) {
        const rawToken = response.data.token;
        const cleanToken = rawToken.replace(/^Bearer\s/, '');

        await storeLocalStorageData(STORAGE_KEYS.token, cleanToken);

        if (cleanToken) {
          const response = await fetchData<UserResponse>(ENDPOINTS.getUser);

          if (response.data.user) {
            dispatch(setUserData(response.data.user));
          }
          await Promise.all([
            storeAllHashes(),
            getPlanData(),
            getFoodData(),
            getScheduleData(),
            getInsight(),
          ]);
        }
        // showCustomToast('success', 'Log in Successfully');
        navigation.replace('mainStack', {
          screen: 'tabs',
          params: {
            screen: 'HOME',
          },
        });
      }
    } catch (error: any) {
      console.error('Social Login Error:', error);
      setgoogleLoader(false);
      Toast.show({
        type: 'error',
        text1: 'Social Login Error',
        text2: error.message || 'Something went wrong',
      });
    } finally {
      setgoogleLoader(false);
    }
  };

  return (
    <ImageBackground
      source={IMAGES.authBackground}
      style={[
        styles.background,
        {
          paddingTop: verticalScale(50) + insets.top,
          paddingBottom: verticalScale(10) + insets.bottom,
        },
      ]}>
      <View style={styles.header}>
        <Image source={IMAGES.logo} style={styles.logo} />
      </View>

      <View style={styles.footer}>
        {googleLoader ? (
          <View style={styles.googleLoaderContainer}>
            <ActivityIndicator size="small" color={COLORS.yellow} />
          </View>
        ) : (
          <GoogleButton
            onPress={() => {
              handleGoogleSignIn();
            }}
          />
        )}
        <CustomText fontFamily="medium">OR</CustomText>
        <View
          style={{marginVertical: verticalScale(20), gap: verticalScale(10)}}>
          <CustomInput
            value={loginDetails.firstName}
            onChangeText={text =>
              setLoginDetails({...loginDetails, firstName: text})
            }
            placeholder="First Name"
            placeholderTextColor={COLORS.white}
            style={{
              marginBottom: verticalScale(10),
            }}
          />
          <CustomInput
            value={loginDetails.lastName}
            onChangeText={text =>
              setLoginDetails({...loginDetails, lastName: text})
            }
            placeholder="Last Name"
            placeholderTextColor={COLORS.white}
            style={{
              marginBottom: verticalScale(10),
            }}
          />
          <CustomInput
            value={loginDetails.email}
            onChangeText={text =>
              setLoginDetails({...loginDetails, email: text})
            }
            placeholder="Email Address"
            placeholderTextColor={COLORS.white}
            style={{
              marginBottom: verticalScale(10),
            }}
          />
          <CustomInput
            value={loginDetails.password}
            onChangeText={text =>
              setLoginDetails({...loginDetails, password: text})
            }
            placeholder="Password"
            placeholderTextColor={COLORS.white}
            type="password"
          />
          <CustomInput
            value={loginDetails.repassword}
            onChangeText={text =>
              setLoginDetails({...loginDetails, repassword: text})
            }
            placeholder="Re password"
            placeholderTextColor={COLORS.white}
            type="password"
          />
        </View>
        <PrimaryButton
          isFullWidth
          title="Sign up"
          onPress={handleSignUp}
          isLoading={loading}
        />

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate('signIn')}>
          <CustomText fontFamily="bold">Already have an account</CustomText>
        </TouchableOpacity>
        <CustomText
          fontSize={12}
          fontFamily="medium"
          style={{
            textAlign: 'center',
            width: wp(90),
            marginTop: verticalScale(20),
          }}>
          By continuing, you acknowledge and accept GymLogix's{' '}
          <CustomText color={COLORS.yellow} fontFamily="medium" fontSize={12}>
            privacy policy
          </CustomText>{' '}
          and{' '}
          <CustomText color={COLORS.yellow} fontFamily="medium" fontSize={12}>
            Terms & Conditions
          </CustomText>
        </CustomText>
      </View>
    </ImageBackground>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  // Background Styles
  background: {
    flex: 1,
    width: wp(100),
    height: hp(100),
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: verticalScale(10),
    backgroundColor: COLORS.black,
  },

  // Header (Top Section) Styles
  header: {
    alignItems: 'center',
    gap: verticalScale(10),
  },
  logo: {
    height: verticalScale(66),
    width: wp(80),
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontFamily: 'bold',
    color: COLORS.whiteTail,
  },

  // Footer (Bottom Section) Styles
  footer: {
    alignItems: 'center',
    gap: verticalScale(10),
  },
  googleLoaderContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(20),
    borderRadius: verticalScale(16),
    alignItems: 'center',
    marginVertical: verticalScale(5),
    width: wp(90),
    alignSelf: 'center',
  },
  linkContainer: {
    marginTop: verticalScale(10), // Moved from inline, using GAP_SIZE for consistency
  },
  linkText: {
    fontFamily: 'bold',
    color: COLORS.white, // Default color for consistency with dark background
  },
  legalText: {
    fontSize: 12,
    fontFamily: 'medium',
    textAlign: 'center',
    width: wp(90),
    color: COLORS.white, // Default color for consistency with dark background
    marginTop: verticalScale(20), // Moved from inline, added for spacing
  },
  legalLink: {
    color: COLORS.yellow,
    fontFamily: 'medium',
    fontSize: 12,
  },
});
