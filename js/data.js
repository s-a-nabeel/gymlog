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
      { id: 'SS1', label: 'SS1', sets: 3, reps: '15', rest: 60, optional: false,
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

// Returns the active checklist — custom override from DB, or hardcoded default.
// Called after DB.init() so DB is always available here.
function getActiveDietChecklist(location) {
  try {
    var raw = DB.getSetting('diet_checklist_' + location);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DIET_CHECKLISTS[location] || DIET_CHECKLISTS.coimbatore;
}

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

// Form cues shown in the exercise tips modal.
const EXERCISE_TIPS = {
  'Leg Press':                  { emoji: '🦵', cue: 'Feet shoulder-width on plate. Lower until knees at 90°. Don\'t lock out at top. Back flat against pad throughout.' },
  'Incline Bench Press':        { emoji: '💪', cue: 'Bench at 30–45°. Lower bar to upper chest. Elbows at ~45° to body. Full ROM but stop before shoulder impingement.' },
  'Romanian Deadlift':          { emoji: '🏋️', cue: 'Hinge at hips — not the spine. Bar/DBs stay close to legs. Stop the moment you feel the hamstring stretch peak. Back stays neutral.' },
  'Wide Lat Pulldown':          { emoji: '💪', cue: 'Pull bar to upper chest (not behind neck). Lean back slightly. Drive elbows down and back. Squeeze shoulder blades at bottom. Slow release.' },
  'Pull-ups (30kg assist)':     { emoji: '💪', cue: 'Start from a dead hang. Pull chest to bar. Drive elbows down to sides. No kipping. Take 2–3 seconds on the way down.' },
  'Dumbbell Shoulder Press':    { emoji: '💪', cue: 'Start DBs at ear level. Press overhead without arching lower back. Elbows slightly in front of the body plane, not flared out.' },
  'Cable Crossover':            { emoji: '💪', cue: 'Arms slightly bent. Arc hands toward each other at chest height — "hug a tree." Slow 3-second negative. Squeeze chest at the centre.' },
  'Dumbbell Sit-up':            { emoji: '🧘', cue: 'Hold DB at chest. Curl the spine up — don\'t yank the neck. Lower under full control. Core stays braced throughout.' },
  'Bicep Curl (bar)':           { emoji: '💪', cue: 'Elbows pinned to sides — don\'t let them drift forward. Full extension at bottom. Supinate at the top. No swinging. 3-second negative.' },
  'Triceps Rope Pressdown':     { emoji: '💪', cue: 'Elbows at sides, don\'t flare. Press to full extension. Flare the rope handles apart at the bottom. Slow controlled return.' },
  'Goblet Squat':               { emoji: '🦵', cue: 'Hold DB at chest. Feet shoulder-width, toes out ~30°. Squat deep — elbows push knees out at bottom. Chest up. Drive through heels.' },
  'Bench Press (flat)':         { emoji: '💪', cue: 'Bar over lower chest. Elbows at 45–75° (not 90°). Touch chest lightly — no bounce. Full extension at top without locking.' },
  'Seated Leg Curl':            { emoji: '🦵', cue: 'Ankle pad on lower shin. Curl heel toward glutes. Hold 1 second at peak contraction. Slow, controlled release — 3 seconds back up.' },
  '2-Arm Dumbbell Row':         { emoji: '💪', cue: 'Plant one knee and hand on bench. Pull elbow straight back — DB grazes torso. Squeeze the lat at the top. Chest stays parallel to floor.' },
  'Machine Shoulder Press':     { emoji: '💪', cue: 'Adjust seat so handles are at shoulder level. Press overhead without fully locking elbows. Control the descent — 2–3 seconds.' },
  'Lateral Raise':              { emoji: '💪', cue: 'Slight bend at elbows. Lead with the elbows, not the wrists. Stop at shoulder height. Slow negative — 3 seconds down. No shrugging.' },
  'Bent Over Lateral Raise':    { emoji: '💪', cue: 'Hinge forward ~45°. Arms hang naturally. Raise to shoulder height. Thumbs slightly down. Pinch shoulder blades at the top.' },
  'Seated Dumbbell Curl':       { emoji: '💪', cue: 'Sit on bench edge, back straight. Supinate as you curl. Full ROM. Keep elbows slightly in front. No shoulder rocking.' },
  'Dumbbell Kickback':          { emoji: '💪', cue: 'Hinge forward. Upper arm stays parallel to floor. Extend elbow fully and squeeze tricep at lockout. Don\'t drop the arm on the return.' },
  'Dumbbell Bench Press':       { emoji: '💪', cue: 'DBs start at chest level, elbows ~70°. Press and slightly rotate/pinch inward at the top. Good range of motion — lower past parallel if comfortable.' },
  'Leg Extension':              { emoji: '🦵', cue: 'Ankle pad on lower shin. Extend to full lockout — hold 1 second. 3-second slow negative. Don\'t swing or use momentum.' },
  'Barbell Curl':               { emoji: '💪', cue: 'Shoulder-width grip. Elbows pinned back. Curl bar to chin level. Squeeze at top. 3-second negative.' },
  'Lying Tricep Extension':     { emoji: '💪', cue: 'Lie on bench. Bar/EZ-bar above nose. Bend elbows — only the forearms move. Elbows stay in, don\'t flare. Extend and squeeze hard.' },
  'Goblet Squat (both DBs)':    { emoji: '🦵', cue: 'Hold both DBs at chest. Same cues as goblet squat. Squat deep, elbows push knees out. Drive through heels to stand.' },
  'Floor Chest Press':          { emoji: '💪', cue: 'Lie on floor, knees bent. DBs at chest. Press up. ROM is limited by the floor — that\'s OK, safer for shoulders. Squeeze chest at top.' },
  'Romanian Deadlift (DBs)':    { emoji: '🦵', cue: 'Hinge at hips, DBs close to legs. Feel the hamstring stretch. Stop when your back starts to round. Squeeze glutes standing back up.' },
  'Reverse Lunge (DBs)':        { emoji: '🦵', cue: 'Step directly backward. Lower rear knee toward floor. Front knee stays over ankle — NOT past toes. Push through the front heel to return.' },
  'Dead Bug':                   { emoji: '🧘', cue: 'Lie on back, arms straight up, knees at 90°. Lower opposite arm + leg toward floor. KEY: lower back must stay pressed to floor throughout. Small movement.' },
  'Bird Dog':                   { emoji: '🧘', cue: 'On hands and knees. Extend opposite arm and leg until level. Hips stay square — don\'t rotate or let back arch. Hold 2 seconds. Repeat.' },
  'Forearm Plank':              { emoji: '🧘', cue: 'Elbows under shoulders. Body forms a straight line — head to heel. Brace like someone is about to punch your stomach. Breathe steadily.' },
  'Reverse Crunch':             { emoji: '🧘', cue: 'Lie on back, knees bent. Curl tailbone UP off the floor — it\'s a small, controlled pelvic curl. Lower slowly. No neck strain. Not a leg raise.' },
  'Bicycle Crunch':             { emoji: '🧘', cue: '2 FULL seconds each side. Rotate from the thoracic spine, not the neck. Opposite elbow toward opposite knee. Slow is the entire point.' },
  'HIIT Cycling':               { emoji: '🚴', cue: '30s all-out sprint (90–100% effort). 30s easy recovery. 10 rounds total. Keep good posture on the bike — don\'t hunch. Heart rate stays elevated.' },
  'Dynamic Warm-up':            { emoji: '🤸', cue: 'Arm circles (both directions), hip circles, side-to-side leg swings, forward leg swings. Full controlled range of motion — not ballistic.' },
  'Push-ups':                   { emoji: '💪', cue: 'Hands just outside shoulder-width. Body in a straight plank. Lower chest to floor. Full extension at top. No sagging hips or raised butt.' },
};
