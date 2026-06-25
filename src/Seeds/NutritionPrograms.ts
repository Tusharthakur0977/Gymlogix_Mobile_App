export interface NutritionPlanItem {
  id: string;
  title: string; // e.g., "7 days losing weight"
  tags: string[]; // e.g., ["Home", "Home", "Home"]
  caloriesSummary: number[]; // e.g., [1512, 1512, 1512, 1512]
  meals: MealItem[];
  coverImage: string;
  foodId: number;
}

export interface MealItem {
  id: string;
  mealNumber: number; // e.g., 1 for "Meal 1"
  options: MealOption[]; // Array of meal options
}

export interface MealOption {
  id: string;
  title: string; // e.g., "Chick breast with broccoli"
  image: string; // URL for the meal image
  calories: number[]; // e.g., [1512, 1512, 1512, 1512]
}

const NutritionProgramData: NutritionPlanItem[] = [
  {
    id: '1',
    title: '7 days losing weight',
    tags: ['Home', 'Home', 'Home'],
    caloriesSummary: [1512, 1512, 1512, 1512],
    foodId: 1,
    coverImage:
      'https://plus.unsplash.com/premium_photo-1723291306365-841e10185b6f?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '1-1',
        mealNumber: 1,
        options: [
          {
            id: '1-1-1',
            title: 'Chick breast with broccoli',
            image:
              'https://images.unsplash.com/photo-1627308594141-750173e6e5e8?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [400, 400, 400, 400],
          },
          {
            id: '1-1-2',
            title: 'Greek yogurt with berries',
            image:
              'https://images.unsplash.com/photo-1546165205-3781b2a6e4f1?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [250, 250, 250, 250],
          },
        ],
      },
      {
        id: '1-2',
        mealNumber: 2,
        options: [
          {
            id: '1-2-1',
            title: 'Turkey wrap with veggies',
            image:
              'https://images.unsplash.com/photo-1560717896-3fcebb9a492d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [500, 500, 500, 500],
          },
          {
            id: '1-2-2',
            title: 'Quinoa salad with feta',
            image:
              'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [350, 350, 350, 350],
          },
        ],
      },
      {
        id: '1-3',
        mealNumber: 3,
        options: [
          {
            id: '1-3-1',
            title: 'Grilled fish with asparagus',
            image:
              'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [450, 450, 450, 450],
          },
          {
            id: '1-3-2',
            title: 'Vegetable soup',
            image:
              'https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [200, 200, 200, 200],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: '5 days muscle gain',
    tags: ['Gym', 'High Protein', 'Bulking'],
    caloriesSummary: [2500, 2500, 2500, 2500],
    foodId: 2,
    coverImage:
      'https://images.unsplash.com/photo-1622732777601-e744c3401d44?q=80&w=1626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '2-1',
        mealNumber: 1,
        options: [
          {
            id: '2-1-1',
            title: 'Grilled salmon with quinoa',
            image:
              'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [800, 800, 800, 800],
          },
          {
            id: '2-1-2',
            title: 'Chicken and sweet potato',
            image:
              'https://images.unsplash.com/photo-1627308594141-750173e6e5e8?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [750, 750, 750, 750],
          },
        ],
      },
      {
        id: '2-2',
        mealNumber: 2,
        options: [
          {
            id: '2-2-1',
            title: 'Beef stir-fry with veggies',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [900, 900, 900, 900],
          },
          {
            id: '2-2-2',
            title: 'Turkey meatballs with rice',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [850, 850, 850, 850],
          },
        ],
      },
      {
        id: '2-3',
        mealNumber: 3,
        options: [
          {
            id: '2-3-1',
            title: 'Protein shake with oats',
            image:
              'https://images.unsplash.com/photo-1606851442282-f5b96a0de197?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [600, 600, 600, 600],
          },
          {
            id: '2-3-2',
            title: 'Egg omelette with spinach',
            image:
              'https://images.unsplash.com/photo-1612874470007-6e7f025ae3d2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [500, 500, 500, 500],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    title: '14 days keto diet',
    tags: ['Keto', 'Low Carb', 'Fat Loss'],
    caloriesSummary: [1800, 1800, 1800, 1800],
    foodId: 3,
    coverImage:
      'https://plus.unsplash.com/premium_photo-1664206964033-55b538beaec3?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '3-1',
        mealNumber: 1,
        options: [
          {
            id: '3-1-1',
            title: 'Avocado and egg salad',
            image:
              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [600, 600, 600, 600],
          },
          {
            id: '3-1-2',
            title: 'Bacon and cheese roll',
            image:
              'https://images.unsplash.com/photo-1599128417852-4152ed53e8e9?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [550, 550, 550, 550],
          },
        ],
      },
      {
        id: '3-2',
        mealNumber: 2,
        options: [
          {
            id: '3-2-1',
            title: 'Pork chops with asparagus',
            image:
              'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [700, 700, 700, 700],
          },
          {
            id: '3-2-2',
            title: 'Cauliflower mash with steak',
            image:
              'https://images.unsplash.com/photo-1598106960872-6d5a157e3d3d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [650, 650, 650, 650],
          },
        ],
      },
      {
        id: '3-3',
        mealNumber: 3,
        options: [
          {
            id: '3-3-1',
            title: 'Keto chicken casserole',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [600, 600, 600, 600],
          },
          {
            id: '3-3-2',
            title: 'Zucchini noodles with pesto',
            image:
              'https://images.unsplash.com/photo-1595771719998-0a4e7e58b6e6?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [450, 450, 450, 450],
          },
        ],
      },
    ],
  },
  {
    id: '4',
    title: '10 days balanced diet',
    tags: ['Balanced', 'Health', 'Wellness'],
    caloriesSummary: [2000, 2000, 2000, 2000],
    foodId: 4,
    coverImage:
      'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '4-1',
        mealNumber: 1,
        options: [
          {
            id: '4-1-1',
            title: 'Oatmeal with nuts',
            image:
              'https://images.unsplash.com/photo-1547592180-3c5c0e8e0f0e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [500, 500, 500, 500],
          },
          {
            id: '4-1-2',
            title: 'Fruit smoothie',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [400, 400, 400, 400],
          },
        ],
      },
      {
        id: '4-2',
        mealNumber: 2,
        options: [
          {
            id: '4-2-1',
            title: 'Chicken salad with dressing',
            image:
              'https://images.unsplash.com/photo-1563379926897-6a99557b0c2e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [600, 600, 600, 600],
          },
          {
            id: '4-2-2',
            title: 'Tuna sandwich',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [550, 550, 550, 550],
          },
        ],
      },
      {
        id: '4-3',
        mealNumber: 3,
        options: [
          {
            id: '4-3-1',
            title: 'Baked salmon with rice',
            image:
              'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [500, 500, 500, 500],
          },
          {
            id: '4-3-2',
            title: 'Vegetable stir-fry',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [450, 450, 450, 450],
          },
        ],
      },
    ],
  },
  {
    id: '5',
    title: '21 days vegan challenge',
    tags: ['Vegan', 'Plant-Based', 'Detox'],
    caloriesSummary: [1700, 1700, 1700, 1700],
    foodId: 5,
    coverImage:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '5-1',
        mealNumber: 1,
        options: [
          {
            id: '5-1-1',
            title: 'Avocado toast with hummus',
            image:
              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1pYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [400, 400, 400, 400],
          },
          {
            id: '5-1-2',
            title: 'Chia pudding with fruit',
            image:
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [350, 350, 350, 350],
          },
        ],
      },
      {
        id: '5-2',
        mealNumber: 2,
        options: [
          {
            id: '5-2-1',
            title: 'Lentil curry with rice',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [500, 500, 500, 500],
          },
          {
            id: '5-2-2',
            title: 'Quinoa bowl with veggies',
            image:
              'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [450, 450, 450, 450],
          },
        ],
      },
      {
        id: '5-3',
        mealNumber: 3,
        options: [
          {
            id: '5-3-1',
            title: 'Roasted vegetable salad',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [400, 400, 400, 400],
          },
          {
            id: '5-3-2',
            title: 'Tofu stir-fry with soy sauce',
            image:
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [350, 350, 350, 350],
          },
        ],
      },
    ],
  },
  {
    id: '6',
    title: '30 days endurance boost',
    tags: ['Endurance', 'Energy', 'Fitness'],
    caloriesSummary: [2200, 2200, 2200, 2200],
    foodId: 6,
    coverImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '6-1',
        mealNumber: 1,
        options: [
          {
            id: '6-1-1',
            title: 'Oatmeal with banana',
            image:
              'https://images.unsplash.com/photo-1547592180-3c5c0e8e0f0e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [500, 500, 500, 500],
          },
          {
            id: '6-1-2',
            title: 'Whole grain toast with peanut butter',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [450, 450, 450, 450],
          },
        ],
      },
      {
        id: '6-2',
        mealNumber: 2,
        options: [
          {
            id: '6-2-1',
            title: 'Chicken wrap with hummus',
            image:
              'https://images.unsplash.com/photo-1560717896-3fcebb9a492d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [600, 600, 600, 600],
          },
          {
            id: '6-2-2',
            title: 'Lentil soup with bread',
            image:
              'https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [550, 550, 550, 550],
          },
        ],
      },
      {
        id: '6-3',
        mealNumber: 3,
        options: [
          {
            id: '6-3-1',
            title: 'Grilled shrimp with quinoa',
            image:
              'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [500, 500, 500, 500],
          },
          {
            id: '6-3-2',
            title: 'Brown rice with veggies',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [450, 450, 450, 450],
          },
        ],
      },
    ],
  },
];

export default NutritionProgramData;
