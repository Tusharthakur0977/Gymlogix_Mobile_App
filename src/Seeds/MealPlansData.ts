export interface NutritionPlanItem {
  id: string;
  title: string; // e.g., "7-Day Weight Loss Plan"
  tags: string[]; // e.g., ["Weight Loss", "Healthy", "7 Days"]
  caloriesSummary: number[]; // e.g., [1500, 1550, 1480, 1600] (calories per day)
  meals: MealItem[];
  coverImage: string;
}

export interface MealItem {
  id: string;
  mealNumber: number; // e.g., 1 (Breakfast), 2 (Lunch), 3 (Dinner)
  options: MealOption[]; // Array of meal options for this meal
}

export interface MealOption {
  id: string;
  title: string; // e.g., "Oatmeal with Berries and Nuts"
  image: string; // URL for the meal image
  calories: number[]; // e.g., [350, 360, 340, 370] (calories for this option)
}

const MealPlanData: NutritionPlanItem[] = [
  {
    id: '1',
    title: '7-Day Weight Loss Plan',
    tags: ['Weight Loss', 'Healthy', '7 Days'],
    caloriesSummary: [1450, 1500, 1480, 1520, 1490, 1510, 1460],
    coverImage:
      'https://plus.unsplash.com/premium_photo-1723291306365-841e10185b6f?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '1-1',
        mealNumber: 1,
        options: [
          {
            id: '1-1-1',
            title: 'Oatmeal with Berries and Nuts',
            image:
              'https://images.unsplash.com/photo-1514624973-8001b82d4293?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [350, 360, 340, 370],
          },
          {
            id: '1-1-2',
            title: 'Greek Yogurt with Granola and Fruit',
            image:
              'https://images.unsplash.com/photo-1558470118-a6fa93038964?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [320, 330, 310, 340],
          },
        ],
      },
      {
        id: '1-2',
        mealNumber: 2,
        options: [
          {
            id: '1-2-1',
            title: 'Grilled Chicken Salad with Mixed Greens',
            image:
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [400, 410, 390, 420],
          },
          {
            id: '1-2-2',
            title: 'Lentil Soup with Whole Wheat Bread',
            image:
              'https://images.unsplash.com/photo-1559177626-8618616ca8c2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [380, 390, 370, 400],
          },
        ],
      },
      {
        id: '1-3',
        mealNumber: 3,
        options: [
          {
            id: '1-3-1',
            title: 'Baked Salmon with Roasted Vegetables',
            image:
              'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [450, 460, 440, 470],
          },
          {
            id: '1-3-2',
            title: 'Tofu Stir-Fry with Brown Rice',
            image:
              'https://images.unsplash.com/photo-1598615789986-4b8a99e2e005?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [420, 430, 410, 440],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: '5-Day High Protein Meal Plan',
    tags: ['Muscle Gain', 'High Protein', '5 Days'],
    caloriesSummary: [2600, 2650, 2580, 2700, 2620],
    coverImage:
      'https://images.unsplash.com/photo-1622732777601-e744c3401d44?q=80&w=1626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '2-1',
        mealNumber: 1,
        options: [
          {
            id: '2-1-1',
            title: 'Protein Pancakes with Fruit and Syrup',
            image:
              'https://images.unsplash.com/photo-1567620892989-9884814ccf71?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [550, 560, 540, 570],
          },
          {
            id: '2-1-2',
            title: 'Scrambled Eggs with Turkey Sausage and Avocado',
            image:
              'https://images.unsplash.com/photo-1551882544-1219c610149a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [580, 590, 570, 600],
          },
        ],
      },
      {
        id: '2-2',
        mealNumber: 2,
        options: [
          {
            id: '2-2-1',
            title: 'Lean Beef and Vegetable Stir-Fry',
            image:
              'https://images.unsplash.com/photo-1598615789986-4b8a99e2e005?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [650, 660, 640, 670],
          },
          {
            id: '2-2-2',
            title: 'Chicken Breast with Quinoa and Broccoli',
            image:
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [620, 630, 610, 640],
          },
        ],
      },
      {
        id: '2-3',
        mealNumber: 3,
        options: [
          {
            id: '2-3-1',
            title: 'Baked Cod with Sweet Potato and Green Beans',
            image:
              'https://images.unsplash.com/photo-1548298729-9169960d329d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [600, 610, 590, 620],
          },
          {
            id: '2-3-2',
            title: 'Protein Shake with Banana and Almond Butter',
            image:
              'https://images.unsplash.com/photo-1571788873599-a15539445d1a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [580, 590, 570, 600],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    title: '14-Day Keto Meal Plan',
    tags: ['Keto', 'Low Carb', '14 Days'],
    caloriesSummary: [
      1850, 1900, 1820, 1950, 1880, 1920, 1800, 1870, 1910, 1860, 1930, 1890,
      1840, 1960,
    ],
    coverImage:
      'https://images.unsplash.com/photo-1622732777601-e744c3401d44?q=80&w=1626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '3-1',
        mealNumber: 1,
        options: [
          {
            id: '3-1-1',
            title: 'Avocado with Fried Eggs and Bacon',
            image:
              'https://images.unsplash.com/photo-1518611797044-6a944934ff55?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [480, 490, 470, 500],
          },
          {
            id: '3-1-2',
            title: 'Bulletproof Coffee with MCT Oil',
            image:
              'https://images.unsplash.com/photo-1557821552-17ef8d83129b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [350, 360, 340, 370],
          },
        ],
      },
      {
        id: '3-2',
        mealNumber: 2,
        options: [
          {
            id: '3-2-1',
            title: 'Cauliflower Rice with Ground Beef and Cheese',
            image:
              'https://images.unsplash.com/photo-1579871464769-d91567f79a37?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [600, 610, 590, 620],
          },
          {
            id: '3-2-2',
            title: 'Salmon with Asparagus and Butter Sauce',
            image:
              'https://images.unsplash.com/photo-1563795775202-95819c947a55?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [630, 640, 620, 650],
          },
        ],
      },
    ],
  },
  {
    id: '4',
    title: '14-Day Keto Meal Plan',
    tags: ['Keto', 'Low Carb', '14 Days'],
    caloriesSummary: [
      1850, 1900, 1820, 1950, 1880, 1920, 1800, 1870, 1910, 1860, 1930, 1890,
      1840, 1960,
    ],
    coverImage:
      'https://images.unsplash.com/photo-1622732777601-e744c3401d44?q=80&w=1626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '3-1',
        mealNumber: 1,
        options: [
          {
            id: '3-1-1',
            title: 'Avocado with Fried Eggs and Bacon',
            image:
              'https://images.unsplash.com/photo-1518611797044-6a944934ff55?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [480, 490, 470, 500],
          },
          {
            id: '3-1-2',
            title: 'Bulletproof Coffee with MCT Oil',
            image:
              'https://images.unsplash.com/photo-1557821552-17ef8d83129b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [350, 360, 340, 370],
          },
        ],
      },
      {
        id: '3-2',
        mealNumber: 2,
        options: [
          {
            id: '3-2-1',
            title: 'Cauliflower Rice with Ground Beef and Cheese',
            image:
              'https://images.unsplash.com/photo-1579871464769-d91567f79a37?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [600, 610, 590, 620],
          },
          {
            id: '3-2-2',
            title: 'Salmon with Asparagus and Butter Sauce',
            image:
              'https://images.unsplash.com/photo-1563795775202-95819c947a55?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [630, 640, 620, 650],
          },
        ],
      },
    ],
  },
  {
    id: '5',
    title: '14-Day Keto Meal Plan',
    tags: ['Keto', 'Low Carb', '14 Days'],
    caloriesSummary: [
      1850, 1900, 1820, 1950, 1880, 1920, 1800, 1870, 1910, 1860, 1930, 1890,
      1840, 1960,
    ],
    coverImage:
      'https://images.unsplash.com/photo-1622732777601-e744c3401d44?q=80&w=1626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    meals: [
      {
        id: '3-1',
        mealNumber: 1,
        options: [
          {
            id: '3-1-1',
            title: 'Avocado with Fried Eggs and Bacon',
            image:
              'https://images.unsplash.com/photo-1518611797044-6a944934ff55?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [480, 490, 470, 500],
          },
          {
            id: '3-1-2',
            title: 'Bulletproof Coffee with MCT Oil',
            image:
              'https://images.unsplash.com/photo-1557821552-17ef8d83129b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [350, 360, 340, 370],
          },
        ],
      },
      {
        id: '3-2',
        mealNumber: 2,
        options: [
          {
            id: '3-2-1',
            title: 'Cauliflower Rice with Ground Beef and Cheese',
            image:
              'https://images.unsplash.com/photo-1579871464769-d91567f79a37?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [600, 610, 590, 620],
          },
          {
            id: '3-2-2',
            title: 'Salmon with Asparagus and Butter Sauce',
            image:
              'https://images.unsplash.com/photo-1563795775202-95819c947a55?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            calories: [630, 640, 620, 650],
          },
        ],
      },
    ],
  },
];

export default MealPlanData;

const MealsONly = [
  {
    id: '1-1-1',
    title: 'Oatmeal with Berries and Nuts',
    image:
      'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: [350, 360, 340, 370],
    planId: '1',
    mealNumber: 1,
    mealId: '1-1',
  },
  {
    id: '1-1-2',
    title: 'Greek Yogurt with Granola and Fruit',
    image:
      'https://plus.unsplash.com/premium_photo-1675252369719-dd52bc69c3df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGZvb2R8ZW58MHx8MHx8fDA%3D',
    calories: [320, 330, 310, 340],
    planId: '1',
    mealNumber: 1,
    mealId: '1-1',
  },
  {
    id: '1-2-1',
    title: 'Grilled Chicken Salad with Mixed Greens',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: [400, 410, 390, 420],
    planId: '1',
    mealNumber: 2,
    mealId: '1-2',
  },
  {
    id: '1-2-2',
    title: 'Lentil Soup with Whole Wheat Bread',
    image:
      'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: [380, 390, 370, 400],
    planId: '1',
    mealNumber: 2,
    mealId: '1-2',
  },
  {
    id: '1-3-1',
    title: 'Baked Salmon with Roasted Vegetables',
    image:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: [450, 460, 440, 470],
    planId: '1',
    mealNumber: 3,
    mealId: '1-3',
  },
  {
    id: '1-3-2',
    title: 'Tofu Stir-Fry with Brown Rice',
    image:
      'https://plus.unsplash.com/premium_photo-1675252369719-dd52bc69c3df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGZvb2R8ZW58MHx8MHx8fDA%3D',
    calories: [420, 430, 410, 440],
    planId: '1',
    mealNumber: 3,
    mealId: '1-3',
  },
  {
    id: '2-1-1',
    title: 'Protein Pancakes with Fruit and Syrup',
    image:
      'https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGZvb2R8ZW58MHx8MHx8fDA%3D',
    calories: [550, 560, 540, 570],
    planId: '2',
    mealNumber: 1,
    mealId: '2-1',
  },
  {
    id: '2-1-2',
    title: 'Scrambled Eggs with Turkey Sausage and Avocado',
    image:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZvb2R8ZW58MHx8MHx8fDA%3D',
    calories: [580, 590, 570, 600],
    planId: '2',
    mealNumber: 1,
    mealId: '2-1',
  },
  {
    id: '2-2-1',
    title: 'Lean Beef and Vegetable Stir-Fry',
    image:
      'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: [650, 660, 640, 670],
    planId: '2',
    mealNumber: 2,
    mealId: '2-2',
  },
  {
    id: '2-2-2',
    title: 'Chicken Breast with Quinoa and Broccoli',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: [620, 630, 610, 640],
    planId: '2',
    mealNumber: 2,
    mealId: '2-2',
  },
  {
    id: '2-3-1',
    title: 'Baked Cod with Sweet Potato and Green Beans',
    image:
      'https://plus.unsplash.com/premium_photo-1663858367001-89e5c92d1e0e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGZvb2R8ZW58MHx8MHx8fDA%3D',
    calories: [600, 610, 590, 620],
    planId: '2',
    mealNumber: 3,
    mealId: '2-3',
  },
  {
    id: '2-3-2',
    title: 'Protein Shake with Banana and Almond Butter',
    image:
      'https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGZvb2R8ZW58MHx8MHx8fDA%3D',
    calories: [580, 590, 570, 600],
    planId: '2',
    mealNumber: 3,
    mealId: '2-3',
  },
  {
    id: '3-1-1',
    title: 'Avocado with Fried Eggs and Bacon',
    image:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZvb2R8ZW58MHx8MHx8fDA%3D',
    calories: [480, 490, 470, 500],
    planId: '3',
    mealNumber: 1,
    mealId: '3-1',
  },
  {
    id: '3-1-2',
    title: 'Bulletproof Coffee with MCT Oil',
    image:
      'https://plus.unsplash.com/premium_photo-1675252369719-dd52bc69c3df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGZvb2R8ZW58MHx8MHx8fDA%3D',
    calories: [350, 360, 340, 370],
    planId: '3',
    mealNumber: 1,
    mealId: '3-1',
  },
  {
    id: '3-2-1',
    title: 'Cauliflower Rice with Ground Beef and Cheese',
    image:
      'https://plus.unsplash.com/premium_photo-1663858367001-89e5c92d1e0e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGZvb2R8ZW58MHx8MHx8fDA%3D',
    calories: [600, 610, 590, 620],
    planId: '3',
    mealNumber: 2,
    mealId: '3-2',
  },
  {
    id: '3-2-2',
    title: 'Salmon with Asparagus and Butter Sauce',
    image:
      'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: [630, 640, 620, 650],
    planId: '3',
    mealNumber: 2,
    mealId: '3-2',
  },
];

export interface IngredientItem {
  id: string;
  title: string;
  quantity: string;
  size: number;
  measurementUnit: string;
  calories: number[];
  percentage: number;
  image: string;
  idFood: number;
}

const Ingredients: IngredientItem[] = [
  {
    id: '1',
    title: 'Chicken',
    quantity: '750g',
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '2',
    title: 'Rice',
    quantity: '500g',
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '3',
    title: 'Salt',
    quantity: '5g',
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://images.unsplash.com/photo-1558394299-f2e6198506a6?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '4',
    title: 'Broccoli',
    quantity: '3700g', // Note: This seems high; consider adjusting if it was a typo (e.g., to 370g)
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://plus.unsplash.com/premium_photo-1724250160975-6c789dbfdc9f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '5',
    title: 'Onion',
    quantity: '300g',
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://plus.unsplash.com/premium_photo-1700400119867-41aeda606042?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '6',
    title: 'Olive Oil',
    quantity: '30ml',
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://images.unsplash.com/photo-1610547939489-73202bc6afda?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '7',
    title: 'Garlic',
    quantity: '20g',
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://plus.unsplash.com/premium_photo-1666270423754-5b66a5184cc3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '8',
    title: 'Tomato',
    quantity: '200g',
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://plus.unsplash.com/premium_photo-1661811820259-2575b82101bf?q=80&w=1180&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '9',
    title: 'Spinach',
    quantity: '150g',
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '10',
    title: 'Black Pepper',
    quantity: '10g',
    calories: [1512, 1512, 1512, 1512],
    percentage: 0,
    idFood: 0,
    size: 0,
    measurementUnit: '0',
    image:
      'https://plus.unsplash.com/premium_photo-1668447605666-716a18e15a1d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export {MealsONly, Ingredients};
