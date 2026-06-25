import React, {FC, useEffect, useState} from 'react';
import {Image, ImageBackground, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fetchData} from '../../APIServices/api';
import ENDPOINTS from '../../APIServices/endPoints';
import IMAGES from '../../Assets/Images';
import {CustomText} from '../../Components/CustomText';
import {setExerciseData} from '../../Redux/slices/ExerciseSlice';
import {APIFoodData, setFoodData} from '../../Redux/slices/foodSlice';
import {setIngredients} from '../../Redux/slices/ingredientSlice';
import {setMeal} from '../../Redux/slices/myMealsSlice';
import {setPlanData} from '../../Redux/slices/PlanDataSlice';
import {
  setExerciseHashChanged,
  setFoodHashChanged,
  setPlanHashChanged,
  setUserData,
} from '../../Redux/slices/UserSlice';
import {useAppDispatch, useAppSelector} from '../../Redux/store';
import {
  ExerciseAPIData,
  ExerciseResponse,
} from '../../Typings/ApiResponse/ExerciseResponse';
import {FoodResponse} from '../../Typings/ApiResponse/FoodResponse';
import {Data, GetPlanResponse} from '../../Typings/ApiResponse/GetPlanResponse';
import {MealResponse} from '../../Typings/ApiResponse/MyMealResponse';
import {UserResponse} from '../../Typings/ApiResponse/UserResponse';
import {SplashProps} from '../../Typings/route';
import COLORS from '../../Utilities/Colors';
import STORAGE_KEYS from '../../Utilities/Constants';
import {hp, verticalScale, wp} from '../../Utilities/Metrics';
import {
  getLocalStorageData,
  storeLocalStorageData,
} from '../../Utilities/Storage';
import {setExerciseCatalog} from '../../Redux/slices/exerciseCatalogSlice';
import {
  ScheduleAPIData,
  setScheduleData,
} from '../../Redux/slices/ScheduleSlice';
import {setInsightData} from '../../Redux/slices/InsightSlice';

function mapLocation(equipment: string | null | undefined) {
  const eq = (equipment || '').toLowerCase();
  if (eq.includes('bodyweight') || eq.includes('dumbbell')) return 'home';
  if (eq.includes('barbell') || eq.includes('machine')) return 'gym';
  return 'gym';
}

function mapType(type: string | null | undefined) {
  const t = (type || '').toLowerCase();
  if (t.includes('compound')) return 'compound';
  if (t.includes('isolation')) return 'isolation';
  return 'other';
}

function mapForce(force: string | null | undefined) {
  const f = (force || '').toLowerCase();
  if (f.includes('pull')) return 'pull';
  if (f.includes('push')) return 'push';
  return 'push';
}

function getRecommendedSetCount(exerciseId: any) {
  // Search through planData to find matching exercise and return sets
  for (const plan of planData || []) {
    for (const workout of plan.allData?.content?.workouts || []) {
      const exercise = workout.exercises?.find(
        (e: any) => e.exercise_id === exerciseId,
      );
      if (exercise) {
        return exercise.workout_exercises?.[0]?.sets || 0;
      }
    }
  }
  return 0;
}

export const buildExerciseCatalog = (exerciseList: ExerciseAPIData[]) => {
  const difficultyIndex = ['beginner', 'intermediate', 'advance'];
  const bodyPartMap = {};

  for (const item of exerciseList) {
    const bodyPart = item.main_muscle || 'Other';

    const difficultyLevel = difficultyIndex.findIndex(
      level => level.toLowerCase() === (item.difficulty || '').toLowerCase(),
    );

    const exercise = {
      id: item.exercise_id,
      name: item.name,
      coverImage: item.images_urls?.[0] ? {uri: item.images_urls[0]} : null,
      images: item.images_urls?.map(url => ({uri: url})) || [],
      instruction: Array.isArray(item.instruction)
        ? item.instruction.join('\n')
        : item.instruction || '',
      description: item.description || '',
      mainMuscle: item.main_muscle,
      secondaryMuscle: item.secondary_muscles || [],
      difficulty: difficultyLevel >= 0 ? difficultyLevel : 0,
      location: mapLocation(item.equipment),
      type: mapType(item.type),
      force: mapForce(item.force),
      equipment: item.equipment || '',
      targetMuscles: [item.main_muscle, ...(item.secondary_muscles || [])],
      defaultSets: [],
      recommendedSets: 10,
      recommendedReps: 10,
      // recommendedSets: getRecommendedSetCount(item.id),
      // recommendedReps: getRecommendedReps(item.id),
      exerciseSettings: null,
    };

    if (!bodyPartMap[bodyPart]) {
      bodyPartMap[bodyPart] = [];
    }

    bodyPartMap[bodyPart].push(exercise);
  }

  return {
    categories: Object.keys(bodyPartMap).map(bodyPart => ({
      bodyPart,
      exercises: bodyPartMap[bodyPart],
    })),
  };
};

function getRecommendedReps(exerciseId: any) {
  for (const plan of planData || []) {
    for (const workout of plan.allData?.content?.workouts || []) {
      const exercise = workout.exercises?.find(
        (e: any) => e.exercise_id === exerciseId,
      );
      if (exercise) {
        return exercise.workout_exercises?.[0]?.reps || 0;
      }
    }
  }
  return 0;
}

const Splash: FC<SplashProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState(null);
  const {planData} = useAppSelector(state => state.planData);
  const {foodData} = useAppSelector(state => state.foodData);
  const {exerciseHashChanged, foodHashChanged, plandHashChanged} =
    useAppSelector(state => state.userData);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await getLocalStorageData(STORAGE_KEYS.token);
      if (token) {
        setToken(token);
      }
      const hashData = await getLocalStorageData(STORAGE_KEYS.allHashes);
      const localExerciseHash = hashData ? hashData?.exercises_hash : '';
      const localFoodHash = hashData ? hashData?.foods_hash : '';
      const localPlanHash = hashData ? hashData?.plans_hash : '';

      try {
        if (token) {
          const response = await fetchData<UserResponse>(ENDPOINTS.getUser);
          const allGetresponse = await fetchData<any>(ENDPOINTS.allGet);

          dispatch(setUserData(response.data.user));
          if (response.data) {
            const exercises_hash = allGetresponse.data.exercises_hash;
            const isExercise = exercises_hash !== localExerciseHash;

            const foods_hash = allGetresponse.data.foods_hash;
            const isFood = foods_hash !== localFoodHash;

            const plans_hash = allGetresponse.data.plans_hash;
            const isPlan = plans_hash !== localPlanHash;

            dispatch(setExerciseHashChanged(isExercise));
            dispatch(setFoodHashChanged(isFood));
            dispatch(setPlanHashChanged(isPlan));
            await storeLocalStorageData(STORAGE_KEYS.allHashes, {
              foods_hash,
              exercises_hash,
              plans_hash,
            });
          }

          navigation.replace('mainStack', {
            screen: 'tabs',
            params: {
              screen: 'HOME',
            },
          });
        } else {
          const timeout = setTimeout(() => {
            navigation.replace('authStack', {
              screen: 'welcome',
            });
          }, 3000);
          return () => clearTimeout(timeout);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const getFoodData = async () => {
      if (foodHashChanged && token) {
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
                quantity: item.serving_size_amount.toString(),
                measurementUnit: item.serving_size_measurement,
                size: item.serving_weight_grams,
              })),
            ),
          );
        }
      } else {
        const localFoodData: APIFoodData[] = await getLocalStorageData(
          STORAGE_KEYS.localFoodData,
        );
        dispatch(setFoodData(localFoodData));
        dispatch(
          setIngredients(
            localFoodData.map((item: any) => ({
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
              quantity: item.serving_size_amount.toString(),
              measurementUnit: item.serving_size_measurement,
              size: item.serving_weight_grams,
            })),
          ),
        );
      }
    };

    getFoodData().then(() => getMealData());
  }, [token, foodHashChanged]);

  const getMealData = async () => {
    if (foodHashChanged && token) {
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
                const match = foodData?.find(f => f.food_id === food.food_id);
                return {
                  id: food.food_id.toString(),
                  idFood: Number(food.food_id),
                  title: match?.name || 'Unknown',
                  image:
                    match?.image_url ||
                    'https://nix-tag-images.s3.amazonaws.com/384_highres.jpg',
                  quantity: match?.serving_size_amount.toString()!,
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
    } else {
      const localMealData = await getLocalStorageData(
        STORAGE_KEYS.localMealData,
      );

      const localFoodData = await getLocalStorageData(
        STORAGE_KEYS.localFoodData,
      );

      dispatch(
        setMeal(
          localMealData.map((item: any) => ({
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
            ingredients: item.foods.map((food: any) => {
              const match = localFoodData?.find(
                (f: any) => f.food_id === food.food_id,
              );

              return {
                id: food.food_id.toString(),
                idFood: Number(food.food_id),
                title: match?.name || 'Unknown',
                image:
                  match?.image_url ||
                  'https://nix-tag-images.s3.amazonaws.com/384_highres.jpg',
                quantity: match?.serving_size_amount.toString()!,
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

  useEffect(() => {
    const getPlanData = async () => {
      if (plandHashChanged && token) {
        const response = await fetchData<GetPlanResponse>(ENDPOINTS.planGet);

        if (response.data.data) {
          await storeLocalStorageData(
            STORAGE_KEYS.localWorkoutData,
            response.data.data,
          );

          dispatch(
            setPlanData(
              response.data.data.map(item => ({
                id: item.id!,
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
        }
      } else {
        const localWorkoutData = await getLocalStorageData(
          STORAGE_KEYS.localWorkoutData,
        );

        dispatch(
          setPlanData(
            localWorkoutData.map((item: any) => ({
              id: item.id,
              planId: item.plan_id,
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
      }
    };
    getPlanData();
  }, [token, plandHashChanged]);

  useEffect(() => {
    if (planData && planData.length > 0) {
      getExerciseData();
    }
  }, [planData]);

  const getExerciseData = async () => {
    if (exerciseHashChanged && token) {
      const response = await fetchData<ExerciseResponse>(ENDPOINTS.exerciseGet);

      if (response.data.data) {
        const exerciseList = response.data.data;

        await storeLocalStorageData(
          STORAGE_KEYS.localExerciseData,
          exerciseList,
        );

        await storeLocalStorageData(
          STORAGE_KEYS.localExerciseCatalog,
          exerciseList,
        );

        dispatch(setExerciseData(exerciseList));

        const catalog = buildExerciseCatalog(exerciseList);
        dispatch(setExerciseCatalog(catalog));
      }
    } else {
      const localExerciseData = await getLocalStorageData(
        STORAGE_KEYS.localExerciseData,
      );

      const localExerciseCatalog = await getLocalStorageData(
        STORAGE_KEYS.localExerciseCatalog,
      );

      dispatch(setExerciseData(localExerciseData));

      const catalog = buildExerciseCatalog(localExerciseCatalog);

      dispatch(setExerciseCatalog(catalog));
    }
  };

  useEffect(() => {
    const getScheduleData = async () => {
      if (token) {
        const response = await fetchData<ScheduleAPIData[] | any>(
          ENDPOINTS.schedule,
        );
        if (response.data) {
          await storeLocalStorageData(
            STORAGE_KEYS.localScheduleData,
            response.data,
          );

          dispatch(setScheduleData(response.data.data));
        } else {
          const localScheduleData = await getLocalStorageData(
            STORAGE_KEYS.localScheduleData,
          );

          dispatch(setScheduleData(localScheduleData));
        }
      }
    };
    getScheduleData();
  }, [token]);

  useEffect(() => {
    const getInsightData = async () => {
      if (token) {
        const response = await fetchData<any>(ENDPOINTS.get_insight);
        if (response.data.data) {
          await storeLocalStorageData(
            STORAGE_KEYS.localInsight,
            response.data.data,
          );
          dispatch(setInsightData(response.data.data));
        } else {
          const localInsightData = await getLocalStorageData(
            STORAGE_KEYS.localInsight,
          );

          dispatch(setInsightData(localInsightData));
        }
      }
    };
    getInsightData();
  }, [token]);

  return (
    <ImageBackground
      source={IMAGES.authBackground}
      style={[
        styles.mainview,
        {
          paddingTop: verticalScale(50) + insets.top,
        },
      ]}>
      <Image source={IMAGES.logo} style={styles.image} />
      <CustomText fontSize={30} fontFamily="italic" color={COLORS.whiteTail}>
        Fuel Your Goals
      </CustomText>
    </ImageBackground>
  );
};

export default Splash;

const styles = StyleSheet.create({
  mainview: {
    height: hp(100),
    width: wp(100),
    alignItems: 'center',
    gap: verticalScale(10),
  },
  image: {
    height: verticalScale(66),
    width: wp(80),
    resizeMode: 'contain',
  },
});
