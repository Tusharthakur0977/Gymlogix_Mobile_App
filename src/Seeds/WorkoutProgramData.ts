export interface WorkoutProgram {
  day: string;
  locked: boolean;
  dotColor: string;
  exercises: Exercise[];
  restPeriod: string | null;
}

export interface Exercise {
  id: string;
  image: string;
  name: string;
  sets: number;
  reps: number;
}

const workoutPlan: WorkoutProgram[] = [
  {
    day: 'Day 1',
    locked: false,
    dotColor: '#ff0000', // Orange for Day 1
    exercises: [
      {
        id: '1-1',
        image: 'https://images.unsplash.com/photo-1605296866985-34b1741b1e02',
        name: 'Smith machine shrug',
        sets: 3,
        reps: 3,
      },
      {
        id: '1-2',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
        name: 'Barbell bench press',
        sets: 3,
        reps: 8,
      },
      {
        id: '1-3',
        image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1',
        name: 'Dumbbell lateral raise',
        sets: 3,
        reps: 12,
      },
    ],
    restPeriod: '24 hours rest period',
  },
  {
    day: 'Day 2',
    locked: true,
    dotColor: '#00FF00', // Green for Day 2
    exercises: [
      {
        id: '2-1',
        image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e',
        name: 'Squat',
        sets: 4,
        reps: 8,
      },
      {
        id: '2-2',
        image: 'https://images.unsplash.com/photo-1605296867424-7d1b3f6c2b3d',
        name: 'Cable tricep pushdown',
        sets: 3,
        reps: 10,
      },
      {
        id: '2-3',
        image: 'https://images.unsplash.com/photo-1605296867722-8d9d5e0b0b1e',
        name: 'Plank',
        sets: 3,
        reps: 15,
      },
    ],
    restPeriod: '24 hours rest period',
  },
  {
    day: 'Day 3',
    locked: true,
    dotColor: '#00FF00', // Green for Day 3
    exercises: [
      {
        id: '3-1',
        image: 'https://images.unsplash.com/photo-1605296866985-34b1741b1e02',
        name: 'Deadlift',
        sets: 4,
        reps: 6,
      },
      {
        id: '3-2',
        image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1',
        name: 'Dumbbell shoulder press',
        sets: 3,
        reps: 10,
      },
      {
        id: '3-3',
        image: 'https://images.unsplash.com/photo-1605296867722-8d9d5e0b0b1e',
        name: 'Side plank',
        sets: 3,
        reps: 10,
      },
    ],
    restPeriod: null,
  },
];

export {workoutPlan};
