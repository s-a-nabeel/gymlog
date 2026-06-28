// Master workout data — auto-populated from Nabeel's fitness plan

const WORKOUTS = {
  A: {
    name: 'Full Body A',
    location: 'gym',
    estimatedMin: 65,
    supersets: [
      { id: 'SS1', label: 'SS1', sets: 3, reps: '15', rest: 60, optional: false,
        exA: { name: 'Leg Press', category: 'compound_legs', primary: true },
        exB: { name: 'Incline Bench Press', category: 'compound_upper' } },
      { id: 'SS2', label: 'SS2', sets: 3, reps: '12', rest: 60, optional: false,
        exA: { name: 'Romanian Deadlift', category: 'compound_legs', primary: true },
        exB: { name: 'Wide Lat Pulldown', category: 'compound_upper' } },
      { id: 'SS3', label: 'SS3', sets: 2, reps: '12', rest: 45, optional: false,
        exA: { name: 'Pull-ups (30kg assist)', category: 'compound_upper' },
        exB: { name: 'Dumbbell Shoulder Press', category: 'isolation' } },
      { id: 'SS4', label: 'SS4', sets: 2, reps: '15', rest: 45, optional: false,
        exA: { name: 'Cable Crossover', category: 'isolation' },
        exB: { name: 'Dumbbell Sit-up', category: 'core' } },
      { id: 'OPT', label: 'Optional', sets: 2, reps: '15', rest: 30, optional: true,
        exA: { name: 'Bicep Curl (bar)', category: 'isolation' },
        exB: { name: 'Triceps Rope Pressdown', category: 'isolation' } },
    ]
  },
  B: {
    name: 'Full Body B',
    location: 'gym',
    estimatedMin: 60,
    supersets: [
      { id: 'SS1', label: 'SS1', sets: 3, reps: '15', rest: 60, optional: false,
        exA: { name: 'Goblet Squat', category: 'compound_legs', primary: true },
        exB: { name: 'Bench Press (flat)', category: 'compound_upper' } },
      { id: 'SS2', label: 'SS2', sets: 3, reps: '15', rest: 60, optional: false,
        exA: { name: 'Seated Leg Curl', category: 'compound_legs', primary: true },
        exB: { name: '2-Arm Dumbbell Row', category: 'compound_upper' } },
      { id: 'SS3', label: 'SS3', sets: 2, reps: '12', rest: 45, optional: false,
        exA: { name: 'Machine Shoulder Press', category: 'compound_upper' },
        exB: { name: 'Lateral Raise', category: 'isolation' } },
      { id: 'SS4', label: 'SS4', sets: 2, reps: '15', rest: 45, optional: false,
        exA: { name: 'Bent Over Lateral Raise', category: 'isolation' },
        exB: { name: 'Wide Lat Pulldown', category: 'compound_upper' } },
      { id: 'OPT', label: 'Optional', sets: 2, reps: '15', rest: 30, optional: true,
        exA: { name: 'Seated Dumbbell Curl', category: 'isolation' },
        exB: { name: 'Dumbbell Kickback', category: 'isolation' } },
    ]
  },
  C: {
    name: 'Full Body C',
    location: 'gym',
    estimatedMin: 65,
    supersets: [
      { id: 'SS1', label: 'SS1', sets: 4, reps: '15', rest: 60, optional: false,
        exA: { name: 'Leg Press', category: 'compound_legs', primary: true },
        exB: { name: 'Dumbbell Bench Press', category: 'compound_upper' } },
      { id: 'SS2', label: 'SS2', sets: 3, reps: '12', rest: 60, optional: false,
        exA: { name: 'Romanian Deadlift', category: 'compound_legs', primary: true },
        exB: { name: 'Pull-ups (30kg assist)', category: 'compound_upper' } },
      { id: 'SS3', label: 'SS3', sets: 2, reps: '15', rest: 45, optional: false,
        exA: { name: 'Leg Extension', category: 'isolation' },
        exB: { name: 'Wide Lat Pulldown', category: 'compound_upper' } },
      { id: 'SS4', label: 'SS4', sets: 2, reps: '12', rest: 45, optional: false,
        exA: { name: 'Machine Shoulder Press', category: 'compound_upper' },
        exB: { name: 'Cable Crossover', category: 'isolation' } },
      { id: 'OPT', label: 'Optional', sets: 2, reps: '12', rest: 30, optional: true,
        exA: { name: 'Barbell Curl', category: 'isolation' },
        exB: { name: 'Lying Tricep Extension', category: 'isolation' } },
    ]
  },
  Home: {
    name: 'Home Dumbbell',
    location: 'home',
    estimatedMin: 35,
    supersets: [
      { id: 'SS1', label: 'SS1', sets: 2, reps: '15-20', rest: 30, optional: false,
        exA: { name: 'Goblet Squat (both DBs)', category: 'compound_legs', primary: true },
        exB: { name: 'Floor Chest Press', category: 'compound_upper' } },
      { id: 'SS2', label: 'SS2', sets: 2, reps: '15', rest: 30, optional: false,
        exA: { name: 'Romanian Deadlift (DBs)', category: 'compound_legs', primary: true },
        exB: { name: '2-Arm Dumbbell Row', category: 'compound_upper' } },
      { id: 'SS3', label: 'SS3', sets: 2, reps: '15', rest: 30, optional: false,
        exA: { name: 'Lateral Raise', category: 'isolation' },
        exB: { name: 'Bent Over Lateral Raise', category: 'isolation' } },
      { id: 'SS4', label: 'SS4', sets: 2, reps: '15', rest: 30, optional: false,
        exA: { name: 'Seated Dumbbell Curl', category: 'isolation' },
        exB: { name: 'Dumbbell Kickback', category: 'isolation' } },
      { id: 'FIN', label: 'Finisher', sets: 2, reps: '12/leg', rest: 30, optional: false,
        exA: { name: 'Reverse Lunge (DBs)', category: 'compound_legs' },
        exB: null },
    ]
  },
  Abs: {
    name: 'Daily Abs',
    location: 'anywhere',
    estimatedMin: 12,
    supersets: [
      { id: 'P1', label: 'Phase 1', sets: 2, reps: '10/side', rest: 30, optional: false,
        exA: { name: 'Dead Bug', category: 'core' },
        exB: { name: 'Bird Dog', category: 'core' } },
      { id: 'P2', label: 'Phase 2', sets: 2, reps: '30s / 15', rest: 30, optional: false,
        exA: { name: 'Forearm Plank', category: 'core' },
        exB: { name: 'Reverse Crunch', category: 'core' } },
      { id: 'P3', label: 'Phase 2b', sets: 2, reps: '15', rest: 30, optional: false,
        exA: { name: 'Bicycle Crunch', category: 'core' },
        exB: null },
    ]
  },
  Rest: { name: 'Rest Day', location: 'anywhere', estimatedMin: 0, supersets: [] }
};

const DEFAULT_SCHEDULE = {
  standard: {
    Monday: 'Abs', Tuesday: 'A', Wednesday: 'B',
    Thursday: 'C', Friday: 'Abs', Saturday: 'Home', Sunday: 'Rest'
  },
  heavy: {
    Monday: 'A', Tuesday: 'B', Wednesday: 'C',
    Thursday: 'A', Friday: 'Abs', Saturday: 'Home', Sunday: 'Rest'
  }
};

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const WORKOUT_KEYS = ['A','B','C','Home','Abs','Rest'];

const OPENING_BLOCK = [
  { name: 'HIIT Cycling', detail: '30s sprint / 30s easy × 10 rounds', duration: '10 min' },
  { name: 'Dynamic Warm-up', detail: 'Arm swings, hip circles, leg swings', duration: '5 min' },
  { name: 'Push-ups', detail: 'Bodyweight × 15 reps', duration: '2 min' },
];

const DIET_CHECKLISTS = {
  coimbatore: [
    { id: 'wake_water', label: '2 glasses warm water + lemon on waking' },
    { id: 'abs_am', label: 'Ab routine 12 min (morning)' },
    { id: 'breakfast', label: 'Breakfast: 2 eggs + 35g oats + 5 walnuts' },
    { id: 'tea_wait', label: 'Waited 90 min before tea after breakfast' },
    { id: 'snack', label: 'Snack: 20g nuts + 1 fruit' },
    { id: 'lunch', label: 'Lunch: rice + dal + veg + curd + lemon on dal' },
    { id: 'afternoon', label: 'Afternoon: 2 egg whites + 1 apple' },
    { id: 'pre_gym', label: 'Pre-gym apple eaten' },
    { id: 'post_gym', label: 'Post-gym: 1 banana + 1 boiled egg' },
    { id: 'dinner', label: 'Dinner: chicken + sweet potato + salad (before 9 PM)' },
    { id: 'water', label: '2.5 litres water through the day' },
  ],
  trivandrum: [
    { id: 'wake_water', label: '2 glasses warm water + lemon on waking' },
    { id: 'abs_am', label: 'Ab routine 12 min (morning)' },
    { id: 'breakfast', label: 'Breakfast: max 2 appam + 2 eggs' },
    { id: 'tea_wait', label: 'Waited 90 min before tea after breakfast' },
    { id: 'lunch', label: 'Lunch: ¾ cup red rice + fish + veg + curd + lemon on sambar' },
    { id: 'lunch_walk', label: 'Post-lunch 15-min walk' },
    { id: 'dinner', label: 'Dinner before 8 PM: fish/chicken + veg + ½ cup rice' },
    { id: 'dinner_walk', label: 'Post-dinner 15-min walk' },
    { id: 'fish_week', label: 'Fish 3-4× this week (mackerel/sardines)' },
    { id: 'dumbbell', label: 'Light dumbbell session (when family time allows)' },
  ]
};
