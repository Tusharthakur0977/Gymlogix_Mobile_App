import {Asset} from 'react-native-image-picker';
import {CapturedPhoto} from '../Screens/AddNewMeal';
import {IngredientItem, Ingredients} from './MealPlansData';
import {Data} from '../Typings/ApiResponse/GetPlanResponse';

export type ActivePlanListItem = {
  id: string;
  planId: number;
  coverImage: string;
  title: string;
  tags: string[];
  type: 'workout' | 'food';
  onPress?: () => void;
  allData?: Data;
};

const ActivePlansData: ActivePlanListItem[] = [
  {
    id: '1',
    coverImage:
      'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Balanced Nutrition Plan',
    tags: ['Diet', 'Health', 'Wellness'],
    type: 'food',
    planId: 1,
  },
  {
    id: '2',
    coverImage:
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Strength Training Basics',
    tags: ['Gym', 'Strength', 'Workout'],
    type: 'workout',
    planId: 2,
  },
  {
    id: '3',
    coverImage:
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Cardio Blast Session',
    tags: ['Cardio', 'Fitness', 'Endurance'],
    type: 'workout',
    planId: 3,
  },
  {
    id: '4',
    coverImage:
      'https://plus.unsplash.com/premium_photo-1672863647710-1f68f52f735f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Full Body HIIT Routine',
    tags: ['HIIT', 'Fitness', 'Home'],
    type: 'workout',
    planId: 4,
  },
  {
    id: '5',
    coverImage:
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1610&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Post-Workout Recovery Meal',
    tags: ['food', 'Recovery', 'Health'],
    type: 'food',
    planId: 5,
  },
  {
    id: '6',
    coverImage:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Morning Yoga Flow',
    tags: ['Yoga', 'Flexibility', 'Mindfulness'],
    type: 'workout',
    planId: 6,
  },
  {
    id: '7',
    coverImage:
      'https://images.unsplash.com/photo-1470468969717-61d5d54fd036?q=80&w=1488&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Outdoor Running Challenge',
    tags: ['Running', 'Outdoor', 'Cardio'],
    type: 'workout',
    planId: 7,
  },
  {
    id: '8',
    coverImage:
      'https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Advanced Weightlifting Program',
    tags: ['Weights', 'Strength', 'Gym'],
    type: 'workout',
    planId: 8,
  },
  {
    id: '9',
    coverImage:
      'https://plus.unsplash.com/premium_photo-1674675646818-01d7a7bae64c?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Mindful Meditation Break',
    tags: ['Meditation', 'Relaxation', 'Wellness'],
    type: 'workout',
    planId: 9,
  },
  {
    id: '10',
    coverImage:
      'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Dynamic Stretching Warm-Up',
    tags: ['Stretching', 'Warm-Up', 'Flexibility'],
    type: 'workout',
    planId: 10,
  },
];

export type MyMealsListItem = {
  id: number;
  coverImage: CapturedPhoto | null;
  title: string;
  description: string;
  userId: number;
  macros: {
    calories: string;
    fat: string;
    carbs: string;
    protein: string;
  };
  instructions: string;
  isPublic?: boolean;
  ingredients: IngredientItem[];
  mealImages: Asset[];
  tags: string[];
};

const myMealsList: MyMealsListItem[] = [
  {
    id: 123,
    userId: 0,
    coverImage: {
      uri: 'https://plus.unsplash.com/premium_photo-1669742928112-19364a33b530?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    title: 'Chicken Breast with Broccoli',
    description: 'Grilled chicken breast served with fresh broccoli.',
    macros: {
      calories: '450',
      fat: '10',
      carbs: '20',
      protein: '50',
    },
    instructions: 'Grill the chicken and steam the broccoli.',
    ingredients: [Ingredients[0], Ingredients[2], Ingredients[5]],
    mealImages: [
      {
        uri: 'https://plus.unsplash.com/premium_photo-1669742928112-19364a33b530?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
    tags: ['healthy', 'Grilled'],
  },
  {
    id: 234,
    userId: 0,

    coverImage: {
      uri: 'https://images.unsplash.com/photo-1560717845-968823efbee1?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    title: 'Grilled Salmon with Veggies',
    description: 'Perfectly grilled salmon served with mixed vegetables.',
    macros: {
      calories: '520',
      fat: '22',
      carbs: '15',
      protein: '45',
    },
    instructions: 'Grill salmon and sauté vegetables.',
    ingredients: [Ingredients[0], Ingredients[1], Ingredients[3]],
    mealImages: [
      {
        uri: 'https://images.unsplash.com/photo-1560717845-968823efbee1?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
    tags: ['healthy', 'Grilled'],
  },
  {
    id: 23423,
    userId: 0,

    coverImage: {
      uri: 'https://plus.unsplash.com/premium_photo-1677000666741-17c3c57139a2?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    title: 'Steak with Mashed Potatoes',
    description: 'Juicy steak paired with creamy mashed potatoes.',
    macros: {
      calories: '700',
      fat: '30',
      carbs: '40',
      protein: '60',
    },
    instructions: 'Grill the steak and prepare mashed potatoes.',
    ingredients: [Ingredients[1], Ingredients[2], Ingredients[3]],
    mealImages: [
      {
        uri: 'https://plus.unsplash.com/premium_photo-1677000666741-17c3c57139a2?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
    tags: ['healthy', 'Grilled'],
  },
  {
    id: 2343222,
    userId: 0,

    coverImage: {
      uri: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    title: 'Pasta with Tomato Sauce',
    description: 'Classic pasta tossed in rich tomato sauce.',
    macros: {
      calories: '550',
      fat: '15',
      carbs: '65',
      protein: '20',
    },
    instructions: 'Boil pasta and cook tomato sauce.',
    ingredients: [Ingredients[4], Ingredients[6], Ingredients[8]],
    mealImages: [
      {
        uri: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
    tags: ['healthy', 'Grilled'],
  },
  {
    id: 29009,
    userId: 0,

    coverImage: {
      uri: 'https://images.unsplash.com/photo-1735190093631-d66ecd1bc433?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    title: 'Sushi Platter',
    description: 'Assorted sushi rolls with wasabi and soy sauce.',
    macros: {
      calories: '600',
      fat: '8',
      carbs: '70',
      protein: '30',
    },
    instructions: 'Roll sushi with selected fillings.',
    ingredients: [Ingredients[3], Ingredients[1], Ingredients[7]],
    mealImages: [
      {
        uri: 'https://images.unsplash.com/photo-1735190093631-d66ecd1bc433?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
    tags: ['healthy', 'Grilled'],
  },
  {
    id: 23279904,
    userId: 0,

    coverImage: {
      uri: 'https://plus.unsplash.com/premium_photo-1669742928112-19364a33b530?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    title: 'Cheeseburger with Fries',
    description: 'Classic cheeseburger served with crispy fries.',
    macros: {
      calories: '850',
      fat: '45',
      carbs: '60',
      protein: '35',
    },
    instructions: 'Grill patty, assemble burger, and fry potatoes.',
    ingredients: [Ingredients[0], Ingredients[2], Ingredients[5]],
    mealImages: [
      {
        uri: 'https://plus.unsplash.com/premium_photo-1669742928112-19364a33b530?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
    tags: ['healthy', 'Grilled'],
  },
  {
    id: 244434,
    userId: 0,

    coverImage: {
      uri: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1628&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    title: 'Margherita Pizza',
    description: 'Traditional pizza with tomato, mozzarella, and basil.',
    macros: {
      calories: '650',
      fat: '20',
      carbs: '70',
      protein: '25',
    },
    instructions: 'Bake pizza with toppings.',
    ingredients: [Ingredients[0], Ingredients[2], Ingredients[5]],
    mealImages: [
      {
        uri: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1628&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
    tags: ['healthy', 'Grilled'],
  },
  {
    id: 231124,
    userId: 0,

    coverImage: {
      uri: 'https://plus.unsplash.com/premium_photo-1661730329741-b3bf77019b39?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    title: 'Tacos with Salsa',
    description: 'Spicy tacos topped with fresh salsa.',
    macros: {
      calories: '500',
      fat: '18',
      carbs: '45',
      protein: '28',
    },
    instructions: 'Prepare fillings, warm tortillas, and serve.',
    ingredients: [Ingredients[1], Ingredients[2], Ingredients[4]],
    mealImages: [
      {
        uri: 'https://plus.unsplash.com/premium_photo-1661730329741-b3bf77019b39?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
    tags: ['healthy', 'Grilled'],
  },
  {
    id: 2323234,
    userId: 0,

    coverImage: {
      uri: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    title: 'Pancakes with Maple Syrup',
    description: 'Fluffy pancakes served with maple syrup.',
    macros: {
      calories: '400',
      fat: '12',
      carbs: '55',
      protein: '10',
    },
    instructions: 'Mix batter and cook on griddle.',
    ingredients: [Ingredients[2], Ingredients[9], Ingredients[5]],
    mealImages: [
      {
        uri: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
    tags: ['healthy', 'Grilled'],
  },
];

const trainingPrograms: ActivePlanListItem[] = [
  {
    id: '1',
    coverImage:
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Strength Training Basics',
    tags: ['Gym', 'Strength', 'Beginner'],
    type: 'workout',
    planId: 1,
  },
  {
    id: '2',
    coverImage:
      'https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Advanced Weightlifting Program',
    tags: ['Weights', 'Strength', 'Advanced'],
    type: 'workout',
    planId: 2,
  },
  {
    id: '3',
    coverImage:
      'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Powerlifting Fundamentals',
    tags: ['Powerlifting', 'Strength', 'Gym'],
    type: 'workout',
    planId: 3,
  },
  {
    id: '4',
    coverImage:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a16?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Leg Day Intensive',
    tags: ['Legs', 'Strength', 'Gym'],
    type: 'workout',
    planId: 4,
  },
  {
    id: '5',
    coverImage:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Upper Body Sculpt',
    tags: ['Upper Body', 'Muscle', 'Gym'],
    type: 'workout',
    planId: 5,
  },
  {
    id: '6',
    coverImage:
      'https://images.unsplash.com/photo-1613845205719-8c87760ab728?q=80&w=1635&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Core Strength Circuit',
    tags: ['Core', 'Strength', 'Gym'],
    type: 'workout',
    planId: 6,
  },
  {
    id: '7',
    coverImage:
      'https://plus.unsplash.com/premium_photo-1672863647710-1f68f52f735f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Full Body Hypertrophy',
    tags: ['Hypertrophy', 'Muscle', 'Gym'],
    type: 'workout',
    planId: 7,
  },
  {
    id: '8',
    coverImage:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Functional Fitness Routine',
    tags: ['Functional', 'Strength', 'Gym'],
    type: 'workout',
    planId: 8,
  },
  {
    id: '9',
    coverImage:
      'https://images.unsplash.com/photo-1596357395217-80de13130e92?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Push-Pull Split',
    tags: ['Push-Pull', 'Strength', 'Gym'],
    type: 'workout',
    planId: 9,
  },
  // {
  //   id: "10",
  //   coverImage:
  //     "https://images.unsplash.com/photo-1601422401067-73e038f4b658?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   title: "Endurance Lifting Challenge",
  //   tags: ["Endurance", "Weights", "Gym"],
  //   type: "workout",
  // },
];

export type BulkingProgramItem = {
  id: string;
  image: string;
  title: string;
  description: string;
};

const bulkingPrograms: BulkingProgramItem[] = [
  {
    id: '1',
    title: 'Chicken with Mix Potato',
    description: 'A protein-packed meal with healthy carbs.',
    image:
      'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '2',
    title: 'High-Calorie Protein Shake',
    description: 'A nutritious shake to fuel muscle growth.',
    image:
      'https://images.unsplash.com/photo-1710091691777-3115088962c4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '3',
    title: 'Grilled Steak with Rice',
    description: 'A delicious meal for muscle gain.',
    image:
      'https://images.unsplash.com/photo-1505253213348-ce3e0ff1f0cc?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '4',
    title: 'Egg & Avocado Toast',
    description: 'A balanced breakfast for bulking.',
    image:
      'https://images.unsplash.com/photo-1710091691771-96b2e6d17dac?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '5',
    title: 'Salmon & Quinoa Bowl',
    description: 'Packed with healthy fats and protein.',
    image:
      'https://images.unsplash.com/photo-1676547480642-3e056a4137e8?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '6',
    title: 'Oatmeal with Nuts & Honey',
    description: 'A great start to your bulking day.',
    image:
      'https://images.unsplash.com/photo-1710091691777-3115088962c4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '7',
    title: 'Beef & Sweet Potato',
    description: 'A perfect mix of protein and complex carbs.',
    image:
      'https://images.unsplash.com/photo-1710091691802-7dedb8af9a77?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '8',
    title: 'Tuna & Brown Rice',
    description: 'A meal rich in lean protein and fiber.',
    image:
      'https://images.unsplash.com/photo-1710091691777-3115088962c4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '9',
    title: 'Greek Yogurt with Granola',
    description: 'A high-protein snack to keep you energized.',
    image:
      'https://images.unsplash.com/photo-1505253213348-ce3e0ff1f0cc?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '10',
    title: 'Peanut Butter Banana Smoothie',
    description: 'A calorie-dense smoothie for mass gain.',
    image:
      'https://images.unsplash.com/photo-1710091691802-7dedb8af9a77?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export default bulkingPrograms;

export {ActivePlansData, myMealsList, trainingPrograms};
