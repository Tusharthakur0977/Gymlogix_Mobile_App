import React, {useState, useEffect} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CustomText} from '../../Components/CustomText';
import CustomDropdown from '../../Components/Modals/DropDownModal';
import RangeSlider from '../../Components/RangeSlider/RangeSlider';
import COLORS from '../../Utilities/Colors';
import {horizontalScale, verticalScale, wp} from '../../Utilities/Metrics';
import MeasurementTab from './MeasurementTab';
import NutritionTab from './NutritionTab';
import TrainingTab from './TrainingTab';
import {useAppSelector} from '../../Redux/store';

const STATS = () => {
  const [statsTab, setStatsTab] = useState(1);
  const [plan, setPlan] = useState('Select');
  const [workout, setWorkout] = useState('Select');
  const [exercise, setExercise] = useState('Select');
  const [foodPlan, setFoodPlan] = useState('Select');
  const [meals, setMeals] = useState('Select');
  const [ingredients, setIngredients] = useState('Select');
  const [dateRange, setDateRange] = useState([0, 100]);
  const {planData} = useAppSelector(state => state.planData);
  const {exerciseData} = useAppSelector(state => state.exerciseData);
  const {scheduleData} = useAppSelector(state => state.scheduleData);
  const {myMealsList} = useAppSelector(state => state.myMeals);
  const {foodData} = useAppSelector(state => state.foodData);
  const [extractedExercise, setExtractedExercise] = useState<any>([]);
  const [extractedFoods, setExtractedFoods] = useState<any>([]);
  const [originalFoods, setOriginalFoods] = useState<any>([]);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = new Date();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const [range, setRange] = useState({
    from: formatDate(oneYearAgo),
    to: formatDate(today),
  });

  const [filteredScheduleData, setFilteredScheduleData] =
    useState(scheduleData);

  const startOfDay = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // Step 1: Filter Plans
  const plans = planData
    ?.filter(item => item.type === 'workout' && item.allData?.name !== null)
    .map(item => ({
      label: item.allData?.name,
      value: item.allData?.plan_id,
      workouts: item.allData?.content?.workouts || [],
    }));

  // Step 2: Selected Plan
  const selectedPlan = plans?.find((p: any) => p.value === plan);

  // Step 3: Workouts
  const workouts =
    selectedPlan?.workouts
      ?.filter(w => w?.name)
      ?.map(w => ({
        label: w?.name,
        value: w?.workout_id,
        exercises: w?.exercises || [],
      })) || [];

  const selectedWorkout = workouts?.find((w: any) => w.value === workout);

  // Step 4: Exercises
  const exercises =
    selectedWorkout?.exercises
      ?.flatMap(e => e.workout_exercises)
      ?.map(item => {
        const match = exerciseData?.find(
          ex => ex.exercise_id === item.exercise_id,
        );
        return {
          ...item,
          label: match ? match.name : `Exercise ${item.exercise_id}`,
          value: item.exercise_id,
        };
      }) || [];

  // Function to update extracted exercises
  const updateExtractedExercises = () => {
    const extractExercises = (Exercises: any) => {
      if (!Exercises) return [];

      // Case 1 → Exercises is an array []
      if (Array.isArray(Exercises)) {
        return Exercises.flatMap((group: any) => group?.content || []);
      }

      // Case 2 → Exercises is an object { content: [...] }
      if (Exercises && Array.isArray(Exercises.content)) {
        return Exercises.content;
      }

      // Case 3 → Nested content [{ content: [...] }]
      if (
        Exercises &&
        Array.isArray(Exercises.content) &&
        Array.isArray(Exercises.content[0]?.content)
      ) {
        return Exercises.content.flatMap((group: any) => group.content || []);
      }

      // fallback
      return [];
    };

    if (exercise !== 'Select' && workout !== 'Select' && plan !== 'Select') {
      const loggedDataWithSelectedPlanandWorkout: any = scheduleData?.filter(
        schedule => {
          const scheduleDate = new Date(schedule.schedule_at);

          return (
            Number(schedule.content.plan_id) === Number(plan) &&
            Number(schedule.content.Workout_id) === Number(workout) &&
            scheduleDate >= startOfDay(range.from) &&
            scheduleDate <= endOfDay(range.to)
          );
        },
      );

      if (loggedDataWithSelectedPlanandWorkout?.length > 0) {
        const exerciseList = loggedDataWithSelectedPlanandWorkout?.flatMap(
          (workout: any) => extractExercises(workout?.content?.Exercises),
        );

        const filteredExercises = exerciseList?.filter(
          (ex: any) => Number(ex.Exercise_id) === Number(exercise),
        );

        setExtractedExercise(filteredExercises);
      } else {
        setExtractedExercise([]);
      }
    } else if (workout !== 'Select' && plan !== 'Select') {
      const loggedWorkouts: any = scheduleData?.filter(schedule => {
        const scheduleDate = new Date(schedule.schedule_at);

        return (
          Number(schedule.content.Workout_id) === Number(workout) &&
          scheduleDate >= startOfDay(range.from) &&
          scheduleDate <= endOfDay(range.to)
        );
      });

      if (loggedWorkouts?.length > 0) {
        const exerciseList = loggedWorkouts?.flatMap((workout: any) =>
          extractExercises(workout?.content?.Exercises),
        );

        setExtractedExercise(exerciseList);
      } else {
        setExtractedExercise([]);
      }
    } else if (plan !== 'Select') {
      const loggedPlans: any = scheduleData?.filter(schedule => {
        const scheduleDate = new Date(schedule.schedule_at);
        return (
          Number(schedule.content.plan_id) === Number(plan) &&
          scheduleDate >= startOfDay(range.from) &&
          scheduleDate <= endOfDay(range.to)
        );
      });

      if (loggedPlans?.length > 0) {
        const exerciseList = loggedPlans?.flatMap((plan: any) =>
          extractExercises(plan?.content?.Exercises),
        );

        setExtractedExercise(exerciseList);
      } else {
        setExtractedExercise([]);
      }
    } else {
      setExtractedExercise([]);
    }
  };

  // Update extracted exercises and filtered schedule data when range or other dependencies change
  useEffect(() => {
    updateExtractedExercises();
    const filteredData =
      scheduleData?.filter(schedule => {
        const scheduleDate = new Date(schedule.schedule_at);

        return (
          scheduleDate >= startOfDay(range.from) &&
          scheduleDate <= endOfDay(range.to)
        );
      }) || [];

    setFilteredScheduleData(filteredData);
  }, [range, plan, workout, exercise, scheduleData]);

  // Update originalFoods and extractedFoods when range or foodPlan changes
  useEffect(() => {
    if (foodPlan !== 'Select' && scheduleData) {
      const loggedFoodPlan = scheduleData?.filter(
        schedule =>
          schedule.content.plan_id === foodPlan && schedule.type === 'food',
        // &&
        // new Date(schedule.schedule_at) >= new Date(range.from) &&
        // new Date(schedule.schedule_at) <= new Date(range.to),
      );
      const foodContent = loggedFoodPlan || [];
      setOriginalFoods(foodContent);

      // Re-apply meal filter if meal is selected
      let updatedFoods = foodContent;
      if (meals !== 'Select') {
        updatedFoods = updatedFoods.filter(
          (food: any) => food.content.meal_id === parseInt(meals),
        );
      }

      // Re-apply ingredient filter if ingredient is selected
      if (ingredients !== 'Select' && updatedFoods.length > 0) {
        const filteredSchedules = updatedFoods.filter((food: any) =>
          food.content.food_list?.some(
            (item: any) => item.food_id === parseInt(ingredients),
          ),
        );
        const selectedIngredient = foodData?.find(
          food => food.food_id === parseInt(ingredients),
        );
        if (selectedIngredient && filteredSchedules.length > 0) {
          updatedFoods = filteredSchedules.map((schedule: any) => {
            const ingredientEntry = schedule.content.food_list.find(
              (item: any) => item.food_id === parseInt(ingredients),
            );
            if (ingredientEntry) {
              const servingFactor =
                ingredientEntry.serving_per /
                selectedIngredient.serving_weight_grams;
              return {
                ...schedule,
                content: {
                  ...schedule.content,
                  calories: selectedIngredient.calories * servingFactor,
                  carbs: selectedIngredient.carbs * servingFactor,
                  fat: selectedIngredient.fat * servingFactor,
                  protein: selectedIngredient.protein * servingFactor,
                  food_list: [ingredientEntry],
                },
              };
            }
            return schedule;
          });
        }
      }

      setExtractedFoods(updatedFoods);
    }
  }, [range, foodPlan, scheduleData, meals, ingredients, foodData]);

  const topTabsData = [
    {label: 'Training', value: 1, onClick: () => setStatsTab(1)},
    {label: 'Nutrition', value: 2, onClick: () => setStatsTab(2)},
    {label: 'Measurements', value: 3, onClick: () => setStatsTab(3)},
  ];

  const renderTopTabs = () => {
    return (
      <View style={styles.topTabsContainer}>
        {topTabsData.map(tab => (
          <Pressable
            key={tab.value}
            style={[styles.tab, statsTab === tab.value && styles.activeTab]}
            onPress={tab.onClick}>
            <CustomText
              fontSize={13}
              fontFamily="medium"
              color={COLORS.whiteTail}>
              {tab.label}
            </CustomText>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderTrainingDropDowns = () => {
    // Helper function to extract exercises - same as in updateExtractedExercises
    const extractExercises = (Exercises: any) => {
      if (!Exercises) return [];

      // Case 1 → Exercises is an array []
      if (Array.isArray(Exercises)) {
        return Exercises.flatMap((group: any) => group?.content || []);
      }

      // Case 2 → Exercises is an object { content: [...] }
      if (Exercises && Array.isArray(Exercises.content)) {
        return Exercises.content;
      }

      // Case 3 → Nested content [{ content: [...] }]
      if (
        Exercises &&
        Array.isArray(Exercises.content) &&
        Array.isArray(Exercises.content[0]?.content)
      ) {
        return Exercises.content.flatMap((group: any) => group.content || []);
      }

      // fallback
      return [];
    };

    return (
      <View style={styles.dropdownContainer}>
        <CustomDropdown
          label="Plan"
          modalTitle="Select Plan"
          placeholder="Select"
          items={plans}
          selectedValue={plan}
          onValueChange={value => {
            setPlan(value);
            setWorkout('Select'); // reset workout
            setExercise('Select'); // reset exercise
            const loggedPlans = scheduleData?.filter(schedule => {
              const scheduleDate = new Date(schedule.schedule_at);
              return (
                Number(schedule.content.plan_id) === Number(value) &&
                scheduleDate >= startOfDay(range.from) &&
                scheduleDate <= endOfDay(range.to)
              );
            });
            if (loggedPlans && loggedPlans.length > 0) {
              const exerciseList = loggedPlans.flatMap(plan =>
                extractExercises(plan?.content?.Exercises),
              );
              setExtractedExercise(exerciseList);
            } else {
              setExtractedExercise([]);
            }
          }}
        />
        <CustomDropdown
          label="Workout"
          modalTitle="Select Workout"
          placeholder="Select"
          items={workouts}
          selectedValue={workout}
          onValueChange={value => {
            setWorkout(value);
            setExercise('Select'); // reset exercise
            const loggedWorkouts = scheduleData?.filter(schedule => {
              const scheduleDate = new Date(schedule.schedule_at);
              return (
                Number(schedule.content.Workout_id) === Number(value) &&
                scheduleDate >= startOfDay(range.from) &&
                scheduleDate <= endOfDay(range.to)
              );
            });
            if (loggedWorkouts && loggedWorkouts.length > 0) {
              const exerciseList = loggedWorkouts.flatMap(workout =>
                extractExercises(workout?.content?.Exercises),
              );
              setExtractedExercise(exerciseList);
            } else {
              setExtractedExercise([]);
            }
          }}
          disabled={!plan}
        />
        <CustomDropdown
          label="Exercise"
          modalTitle="Select Exercise"
          placeholder="Select"
          items={exercises}
          selectedValue={exercise}
          onValueChange={value => {
            setExercise(value);
            const loggedDataWithSelectedPlanandWorkout = scheduleData?.filter(
              schedule => {
                const scheduleDate = new Date(schedule.schedule_at);
                return (
                  Number(schedule.content.plan_id) === Number(plan) &&
                  Number(schedule.content.Workout_id) === Number(workout) &&
                  scheduleDate >= startOfDay(range.from) &&
                  scheduleDate <= endOfDay(range.to)
                );
              },
            );
            if (
              loggedDataWithSelectedPlanandWorkout &&
              loggedDataWithSelectedPlanandWorkout.length > 0
            ) {
              const exerciseList = loggedDataWithSelectedPlanandWorkout.flatMap(
                workout => extractExercises(workout?.content?.Exercises),
              );
              const filteredExercises = exerciseList.filter(
                ex => Number(ex.Exercise_id) === Number(value),
              );
              setExtractedExercise(filteredExercises);
            } else {
              setExtractedExercise([]);
            }
          }}
          disabled={!workout}
        />
      </View>
    );
  };

  const renderNutritionDropDowns = () => {
    // ---- 1. Plans ----
    const planFood = planData
      ?.filter(item => item.type === 'food')
      .map(plan => ({
        label: plan.allData?.name,
        value: plan.allData?.plan_id,
      }));

    // ---- 2. Meals (based on selected Plan) ----
    const selectedPlan = planData?.find(
      (item: any) => item.type === 'food' && item.allData?.plan_id === foodPlan,
    );

    const mealIds =
      selectedPlan?.allData?.content?.meals?.map(m => m.meal_id) || [];

    const planMeals = myMealsList
      ?.filter(meal => mealIds.includes(meal.id))
      .map(meal => ({
        label: meal.title,
        value: meal.id,
      }));
    // ---- 3. Ingredients (based on selected Meal) ----
    const selectedMeal = myMealsList?.find((meal: any) => meal.id === meals);
    const ingredientIdsFromMeal =
      selectedMeal?.ingredients?.map(i => i.idFood) || [];
    const ingredientIdsFromSchedule =
      extractedFoods.length > 0
        ? extractedFoods[0]?.content?.food_list?.map((i: any) => i.food_id)
        : [];

    const planIngredients = foodData
      ?.filter(food =>
        [...ingredientIdsFromMeal, ...ingredientIdsFromSchedule].includes(
          food.food_id,
        ),
      )
      .map(food => ({
        label: food.name,
        value: food.food_id,
      }));

    return (
      <View style={styles.dropdownContainer}>
        <CustomDropdown
          label="Plan"
          modalTitle="Select Plan"
          placeholder="Select"
          items={planFood}
          selectedValue={foodPlan}
          onValueChange={value => {
            setFoodPlan(value);
            setMeals('Select'); // reset meals when plan changes
            setIngredients('Select'); // reset ingredients
            const loggedFoodPlan = scheduleData?.filter(schedule => {
              const scheduleDate = new Date(schedule.schedule_at);

              return (
                schedule.content.plan_id === value &&
                schedule.type === 'food' &&
                scheduleDate >= startOfDay(range.from) &&
                scheduleDate <= endOfDay(range.to)
              );
            });
            const foodContent = loggedFoodPlan || [];
            setOriginalFoods(foodContent); // Store the full plan foods
            setExtractedFoods(foodContent); // Initially set to full plan
          }}
        />
        <CustomDropdown
          label="Meals"
          modalTitle="Select Meals"
          placeholder="Select"
          items={planMeals}
          selectedValue={meals}
          onValueChange={value => {
            setMeals(value);
            setIngredients('Select');
            // Filter extractedFoods based on selected meal_id
            if (value !== 'Select' && originalFoods.length > 0) {
              // Always filter from originalFoods (full plan data)
              const filteredFoods = originalFoods.filter(
                (food: any) => food.content.meal_id === parseInt(value),
              );
              setExtractedFoods(filteredFoods);
            } else if (value === 'Select' && originalFoods.length > 0) {
              // Reset to full plan when "Select" is chosen
              setExtractedFoods(originalFoods);
            }
          }}
        />
        <CustomDropdown
          label="Ingredients"
          modalTitle="Select Ingredients"
          placeholder="Select"
          items={planIngredients}
          selectedValue={ingredients}
          onValueChange={value => {
            setIngredients(value);
            if (value !== 'Select' && originalFoods.length > 0) {
              // Start from the meal-filtered data
              const mealFiltered =
                meals !== 'Select'
                  ? originalFoods.filter(
                      (food: any) => food.content.meal_id === parseInt(meals),
                    )
                  : originalFoods;

              if (mealFiltered.length > 0) {
                // Filter schedules containing the ingredient
                const filteredSchedules = mealFiltered.filter((food: any) =>
                  food.content.food_list?.some(
                    (item: any) => item.food_id === parseInt(value),
                  ),
                );

                // Calculate ingredient-specific nutrition based on serving_per and foodData
                const selectedIngredient = foodData?.find(
                  food => food.food_id === parseInt(value),
                );
                if (selectedIngredient && filteredSchedules.length > 0) {
                  const updatedFoods = filteredSchedules.map(
                    (schedule: any) => {
                      const ingredientEntry = schedule.content.food_list.find(
                        (item: any) => item.food_id === parseInt(value),
                      );
                      if (ingredientEntry) {
                        const servingFactor =
                          ingredientEntry.serving_per /
                          selectedIngredient.serving_weight_grams; // Normalize to grams
                        return {
                          ...schedule,
                          content: {
                            ...schedule.content,
                            calories:
                              selectedIngredient.calories * servingFactor,
                            carbs: selectedIngredient.carbs * servingFactor,
                            fat: selectedIngredient.fat * servingFactor,
                            protein: selectedIngredient.protein * servingFactor,
                            food_list: [ingredientEntry], // Limit to this ingredient
                          },
                        };
                      }
                      return schedule;
                    },
                  );
                  setExtractedFoods(updatedFoods);
                }
              }
            } else if (value === 'Select' && extractedFoods.length > 0) {
              // Reset to the meal's data when "Select" is chosen
              const mealFiltered =
                meals !== 'Select'
                  ? originalFoods.filter(
                      (food: any) => food.content.meal_id === parseInt(meals),
                    )
                  : originalFoods;
              setExtractedFoods(mealFiltered);
            }
          }}
          disabled={meals === 'Select'}
        />
      </View>
    );
  };

  const renderMainView = () => {
    switch (statsTab) {
      case 1:
        return <TrainingTab exercises={extractedExercise} />;
      case 2:
        return <NutritionTab foods={extractedFoods} />;
      case 3:
        return <MeasurementTab data={filteredScheduleData} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.main}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View
          style={{
            width: wp(100),
            backgroundColor: COLORS.brown,
            paddingHorizontal: horizontalScale(20),
            paddingVertical: verticalScale(10),
            gap: verticalScale(20),
          }}>
          {renderTopTabs()}

          {statsTab === 1 && renderTrainingDropDowns()}
          {statsTab === 2 && renderNutritionDropDowns()}
          <RangeSlider
            minDate={formatDate(oneYearAgo)}
            maxDate={formatDate(today)}
            onDateRangeChange={setRange}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          style={styles.scrollView}>
          {renderMainView()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default STATS;

const styles = StyleSheet.create({
  main: {
    backgroundColor: COLORS.darkBrown,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    gap: verticalScale(10),
  },
  topTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    paddingVertical: verticalScale(8),
    borderRadius: 10,
    width: wp(30),
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.yellow,
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.darkBrown,
  },
  scrollView: {
    flex: 1,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: horizontalScale(5),
    marginBottom: verticalScale(10),
  },
  dropdownWrapper: {
    flex: 1,
    gap: verticalScale(5),
  },
  dropdown: {
    backgroundColor: COLORS.whiteTail,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#CECECE',
    overflow: 'hidden',
  },
  sliderContainer: {
    backgroundColor: COLORS.brown,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
  },
});
