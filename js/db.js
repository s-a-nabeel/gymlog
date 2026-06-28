// Database layer — sql.js wrapper with localStorage persistence

const DB = (() => {
  let _db = null;

  const SCHEMA = `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS schedule (
      week_type TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      workout_key TEXT NOT NULL,
      PRIMARY KEY (week_type, day_of_week)
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      workout_key TEXT NOT NULL,
      location TEXT DEFAULT 'gym',
      start_time TEXT,
      end_time TEXT,
      duration_minutes INTEGER,
      sets_completed INTEGER DEFAULT 0,
      sets_planned INTEGER DEFAULT 0,
      remarks TEXT,
      week_type TEXT DEFAULT 'standard',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS set_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      exercise_category TEXT,
      superset_id TEXT,
      superset_pos TEXT,
      set_number INTEGER NOT NULL,
      reps_planned TEXT,
      reps_done INTEGER,
      weight_kg REAL DEFAULT 0,
      rest_taken INTEGER,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
    CREATE TABLE IF NOT EXISTS diet_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      item_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      location_type TEXT DEFAULT 'coimbatore',
      UNIQUE(date, item_id)
    );
    CREATE TABLE IF NOT EXISTS body_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      weight_kg REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `;

  function save() {
    if (!_db) return;
    try {
      const data = _db.export();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(data)));
      localStorage.setItem('gymlog_db_v1', b64);
    } catch (e) {
      console.error('DB save failed:', e);
    }
  }

  async function init() {
    const SQL = await initSqlJs({
      locateFile: f => `https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/${f}`
    });

    const saved = localStorage.getItem('gymlog_db_v1');
    if (saved) {
      try {
        const bytes = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
        _db = new SQL.Database(bytes);
      } catch (e) {
        console.warn('Corrupt DB, starting fresh:', e);
        _db = new SQL.Database();
      }
    } else {
      _db = new SQL.Database();
    }

    _db.exec(SCHEMA);
    _seedDefaults();
    save();
  }

  function _seedDefaults() {
    const existing = getSetting('seeded');
    if (existing) return;

    // Seed schedule
    const days = Object.keys(DEFAULT_SCHEDULE.standard);
    days.forEach(day => {
      _db.run(`INSERT OR IGNORE INTO schedule VALUES (?,?,?)`,
        ['standard', day, DEFAULT_SCHEDULE.standard[day]]);
      _db.run(`INSERT OR IGNORE INTO schedule VALUES (?,?,?)`,
        ['heavy', day, DEFAULT_SCHEDULE.heavy[day]]);
    });

    // Seed profile defaults
    setSetting('name', 'Nabeel');
    setSetting('age', '42');
    setSetting('weight_kg', '79');
    setSetting('height_cm', '166');
    setSetting('week_type', 'standard');
    setSetting('location', 'coimbatore');
    setSetting('seeded', '1');
    save();
  }

  function run(sql, params = []) {
    _db.run(sql, params);
    save();
  }

  function query(sql, params = []) {
    const stmt = _db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  function queryOne(sql, params = []) {
    const rows = query(sql, params);
    return rows[0] || null;
  }

  // Settings
  function getSetting(key) {
    const row = queryOne('SELECT value FROM settings WHERE key=?', [key]);
    return row ? row.value : null;
  }

  function setSetting(key, value) {
    _db.run(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?,?,datetime('now'))`,
      [key, String(value)]);
    save();
  }

  // Schedule
  function getSchedule(weekType = 'standard') {
    const rows = query('SELECT day_of_week, workout_key FROM schedule WHERE week_type=?', [weekType]);
    const map = {};
    rows.forEach(r => { map[r.day_of_week] = r.workout_key; });
    return map;
  }

  function setScheduleDay(weekType, day, workoutKey) {
    run('INSERT OR REPLACE INTO schedule VALUES (?,?,?)', [weekType, day, workoutKey]);
  }

  function getTodayWorkout() {
    const weekType = getSetting('week_type') || 'standard';
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = dayNames[new Date().getDay()];
    const schedule = getSchedule(weekType);
    return schedule[today] || 'Rest';
  }

  // Sessions
  function createSession(date, workoutKey, location, weekType) {
    run(`INSERT INTO sessions (date, workout_key, location, start_time, week_type)
         VALUES (?,?,?,datetime('now'),?)`,
      [date, workoutKey, location, weekType]);
    const row = queryOne('SELECT last_insert_rowid() as id');
    return row ? row.id : null;
  }

  function endSession(sessionId, remarks) {
    const sets = query('SELECT COUNT(*) as n FROM set_logs WHERE session_id=?', [sessionId]);
    const n = sets[0]?.n || 0;
    run(`UPDATE sessions SET end_time=datetime('now'),
         duration_minutes=CAST((julianday('now')-julianday(start_time))*1440 AS INTEGER),
         sets_completed=?, remarks=? WHERE id=?`,
      [n, remarks || '', sessionId]);
  }

  function updateSessionPlanned(sessionId, planned) {
    run('UPDATE sessions SET sets_planned=? WHERE id=?', [planned, sessionId]);
  }

  function getSession(id) {
    return queryOne('SELECT * FROM sessions WHERE id=?', [id]);
  }

  function getSessionByDate(date) {
    return query('SELECT * FROM sessions WHERE date=? ORDER BY id DESC', [date]);
  }

  // Set logs
  function logSet(sessionId, exName, exCat, ssId, ssPos, setNum, repsPlanned, repsDone, weightKg, restTaken) {
    run(`INSERT INTO set_logs
         (session_id, exercise_name, exercise_category, superset_id, superset_pos,
          set_number, reps_planned, reps_done, weight_kg, rest_taken, completed_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
      [sessionId, exName, exCat, ssId, ssPos, setNum, repsPlanned, repsDone, weightKg, restTaken]);

    run('UPDATE sessions SET sets_completed=sets_completed+1 WHERE id=?', [sessionId]);
  }

  function getSessionSets(sessionId) {
    return query('SELECT * FROM set_logs WHERE session_id=? ORDER BY id', [sessionId]);
  }

  function getLastWeight(exerciseName) {
    const row = queryOne(
      `SELECT sl.weight_kg FROM set_logs sl
       JOIN sessions s ON s.id = sl.session_id
       WHERE sl.exercise_name=? AND sl.weight_kg > 0
       ORDER BY sl.completed_at DESC LIMIT 1`,
      [exerciseName]);
    return row ? row.weight_kg : 0;
  }

  function getPersonalRecord(exerciseName) {
    const row = queryOne(
      `SELECT MAX(weight_kg) as pr FROM set_logs WHERE exercise_name=? AND weight_kg > 0`,
      [exerciseName]);
    return row ? (row.pr || 0) : 0;
  }

  // Diet logs
  function getDietLog(date) {
    return query('SELECT * FROM diet_logs WHERE date=?', [date]);
  }

  function toggleDietItem(date, itemId, completed, locationType) {
    run(`INSERT OR REPLACE INTO diet_logs (date, item_id, completed, completed_at, location_type)
         VALUES (?,?,?,CASE WHEN ? THEN datetime('now') ELSE NULL END,?)`,
      [date, itemId, completed ? 1 : 0, completed ? 1 : 0, locationType]);
  }

  // Body metrics
  function setBodyMetric(date, weightKg, notes) {
    run(`INSERT OR REPLACE INTO body_metrics (date, weight_kg, notes, created_at)
         VALUES (?,?,?,datetime('now'))`,
      [date, weightKg, notes || '']);
  }

  function getBodyMetrics(limit = 30) {
    return query('SELECT * FROM body_metrics ORDER BY date DESC LIMIT ?', [limit]);
  }

  // Progress queries
  function getRecentSessions(limit = 50) {
    return query('SELECT * FROM sessions ORDER BY date DESC, id DESC LIMIT ?', [limit]);
  }

  function getSessionsInRange(fromDate, toDate) {
    return query(
      'SELECT * FROM sessions WHERE date>=? AND date<=? ORDER BY date',
      [fromDate, toDate]);
  }

  function getWeeklyStats() {
    return query(`
      SELECT strftime('%Y-W%W', date) as week,
             COUNT(*) as sessions,
             SUM(duration_minutes) as total_minutes,
             SUM(sets_completed) as total_sets
      FROM sessions
      WHERE end_time IS NOT NULL
      GROUP BY week ORDER BY week DESC LIMIT 12
    `);
  }

  function getWorkoutDistribution() {
    return query(`
      SELECT workout_key, COUNT(*) as count
      FROM sessions WHERE end_time IS NOT NULL
      GROUP BY workout_key ORDER BY count DESC
    `);
  }

  function exportCSV() {
    const sessions = query(`
      SELECT s.date, s.workout_key, s.start_time, s.end_time, s.duration_minutes,
             s.sets_completed, s.remarks,
             sl.exercise_name, sl.superset_id, sl.superset_pos, sl.set_number,
             sl.reps_done, sl.weight_kg, sl.completed_at
      FROM sessions s LEFT JOIN set_logs sl ON sl.session_id = s.id
      ORDER BY s.date, sl.id
    `);

    if (!sessions.length) return '';
    const headers = Object.keys(sessions[0]).join(',');
    const rows = sessions.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(','));
    return [headers, ...rows].join('\n');
  }

  return {
    init, save, getSetting, setSetting,
    getSchedule, setScheduleDay, getTodayWorkout,
    createSession, endSession, updateSessionPlanned, getSession,
    getSessionByDate, logSet, getSessionSets,
    getLastWeight, getPersonalRecord,
    getDietLog, toggleDietItem,
    setBodyMetric, getBodyMetrics,
    getRecentSessions, getSessionsInRange,
    getWeeklyStats, getWorkoutDistribution, exportCSV
  };
})();
