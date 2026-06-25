import Toast from 'react-native-toast-message';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

// Helper function to extract numeric value from a string (e.g., "46kg" -> 46)
export const extractNumericValue = (value: string): number => {
  const numericMatch = value.match(/\d+/);
  return numericMatch ? parseInt(numericMatch[0], 10) : 0;
};

// Helper function to extract numeric value from a reps string (e.g., "10M" -> 10)
export const extractReps = (reps: string): number => {
  const numericMatch = reps.match(/\d+/);
  return numericMatch ? parseInt(numericMatch[0], 10) : 0;
};

// Helper function to extract numeric value from a time string (e.g., "04:00" -> 4)
export const extractTime = (time: string): number => {
  const minutesMatch = time.match(/(\d+):/);
  return minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
};

// Helper function to extract numeric value from a distance string (e.g., "123m" -> 123)
export const extractDistance = (distance: string): number => {
  const numericMatch = distance.match(/\d+/);
  return numericMatch ? parseInt(numericMatch[0], 10) : 0;
};

// Calculate 1RM (One Rep Max) using the formula: 1RM = Weight * (1 + reps/30)
export const calculate1RM = (weight: string, reps: string): number => {
  const weightValue = extractNumericValue(weight);
  const repsValue = extractReps(reps);
  return weightValue * (1 + repsValue / 30);
};

export const COLORS_ARRAY = [
  // First row
  '#FF3B5C', // Red
  '#FF5CFF', // Pink
  '#5C5CFF', // Purple
  '#0066FF', // Blue
  '#00CCFF', // Light Blue

  // Second row
  '#00FFCC', // Teal
  '#00FF66', // Green
  '#FFCC33', // Yellow
  '#FF8833', // Orange
  '#FFFF66', // Light Yellow
];

export const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * COLORS_ARRAY.length);
  return COLORS_ARRAY[randomIndex];
};

export const showCustomToast = (type: 'success' | 'error', message: string) => {
  Toast.show({
    type: 'customToast',
    text1: message,
    props: {type},
  });
};
