// Log view — daily workout tracker

const LogView = (() => {
  let sessionId = null;
  let sessionStarted = false;
  let sessionEnded = false;    // true when viewing a fully completed session
  let newSessionMode = false;  // true when "Log another" was clicked
  let sessionTimerInterval = null;
  let sessionStartTime = null;
  let restTimerInterval = null;
  let restStartTime = null;   // timestamp when rest began
  let restDuration = 0;       // total rest seconds
  let restNextHint = '';
  let completedKeys = new Set(); // "ssId_pos_setNum"
  let weightCache = {};          // "exerciseName" -> kg
  let sessionSetsCache = [];     // cached set_logs for current session
  let activeWorkoutKey = null;
  let activeDate = null;

  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function makeKey(ssId, pos, setNum) {
    return `${ssId}_${pos}_${setNum}`;
  }

  function render() {
    activeDate = activeDate || todayStr();
    activeWorkoutKey = activeWorkoutKey || DB.getTodayWorkout();

    const workout = WORKOUTS[activeWorkoutKey];
    const existingSessions = DB.getSessionByDate(activeDate);
    // In newSessionMode, ignore any completed session so we start fresh.
    const latestSession = newSessionMode ? null : existingSessions[0];
    newSessionMode = false;

    if (latestSession) {
      sessionId = latestSession.id;
      sessionStarted = !!latestSession.start_time;
      sessionEnded = !!latestSession.end_time;
      if (latestSession.start_time && !latestSession.end_time) {
        sessionStartTime = new Date(latestSession.start_time + 'Z');
      }
      _loadCompletedSets();
    } else {
      sessionId = null;
      sessionStarted = false;
      sessionEnded = false;
      completedKeys.clear();
    }

    const html = `
      <div class="log-view">
        ${_renderHeader(workout)}
        ${_renderDateWorkoutBar()}
        ${activeWorkoutKey === 'Rest'
          ? `<div class="rest-day-msg"><div class="rest-icon">🌿</div><p>Rest day. Recovery is part of the plan.</p></div>`
          : `${_renderSessionControls()}
             ${workout.location === 'gym' ? _renderOpeningBlock() : ''}
             ${_renderSupersets(workout)}
             ${_renderRemarks()}`
        }
        ${_renderDietSection()}
      </div>
      <div id="rest-overlay" class="rest-overlay hidden"></div>
      <div id="ex-tips-overlay" class="ex-tips-overlay hidden"></div>
    `;

    document.getElementById('main-content').innerHTML = html;
    _attachEvents();

    if (sessionStarted && !latestSession?.end_time) {
      _startSessionTimer();
    }
  }

  function _renderHeader(workout) {
    const dateObj = new Date(activeDate + 'T00:00:00');
    const dateLabel = dateObj.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'short' });
    const isToday = activeDate === todayStr();

    return `
      <div class="log-header">
        <div class="log-header-left">
          <div class="log-date">${isToday ? 'Today' : dateLabel}</div>
          <div class="log-workout-badge badge-${activeWorkoutKey}">${workout?.name || 'Rest'}</div>
        </div>
        <div class="log-header-right">
          <div id="session-timer" class="session-timer ${sessionStarted ? '' : 'hidden'}">00:00</div>
        </div>
      </div>
    `;
  }

  function _renderDateWorkoutBar() {
    const weekType = DB.getSetting('week_type') || 'standard';
    const schedule = DB.getSchedule(weekType);

    return `
      <div class="date-workout-bar">
        <input type="date" id="date-picker" class="date-input" value="${activeDate}" max="${todayStr()}">
        <select id="workout-selector" class="workout-select">
          ${WORKOUT_KEYS.map(k =>
            `<option value="${k}" ${k === activeWorkoutKey ? 'selected' : ''}>${WORKOUTS[k]?.name || k}</option>`
          ).join('')}
        </select>
      </div>
    `;
  }

  function _renderSessionControls() {
    const existingSessions = DB.getSessionByDate(activeDate);
    const session = existingSessions[0];
    const ended = session?.end_time;
    const started = session?.start_time && !ended;

    if (ended) {
      const dur = session.duration_minutes || 0;
      return `
        <div class="session-done-bar">
          <span class="done-badge">✓ Session complete</span>
          <span class="done-meta">${session.sets_completed} sets · ${dur} min</span>
          <button class="btn-link" id="btn-new-session">Log another</button>
        </div>
      `;
    }

    return `
      <div class="session-ctrl-bar">
        ${!started
          ? `<button class="btn-start" id="btn-start-session">▶ Start Session</button>`
          : `<button class="btn-end" id="btn-end-session">■ End Session</button>`
        }
        ${started
          ? `<span class="sets-counter"><span id="sets-done-count">${session?.sets_completed || 0}</span> sets done</span>`
          : ''
        }
      </div>
    `;
  }

  function _renderOpeningBlock() {
    return `
      <div class="block-card opening-block">
        <div class="block-title">Opening Block</div>
        ${OPENING_BLOCK.map(item => `
          <div class="opening-item">
            <span class="opening-name">
              ${item.name}
              <button class="ex-tip-btn" data-ex="${item.name.replace(/"/g, '&quot;')}" title="Form tips">ⓘ</button>
            </span>
            <span class="opening-detail">${item.detail}</span>
            <span class="opening-dur">${item.duration}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function _renderSupersets(workout) {
    if (!workout.supersets.length) return '';

    return `
      <div class="supersets-section">
        ${workout.supersets.map((ss, ssIdx) => _renderSuperset(ss, ssIdx)).join('')}
      </div>
    `;
  }

  function _renderSuperset(ss, ssIdx) {
    const totalSets = ss.sets;
    const completedInSS = _countCompletedInSS(ss.id, ss.exB);

    return `
      <div class="ss-card ${ss.optional ? 'ss-optional' : ''}" id="ss-${ss.id}">
        <div class="ss-header">
          <div class="ss-label-group">
            <span class="ss-label">${ss.label}</span>
            ${ss.optional ? '<span class="optional-tag">Optional</span>' : ''}
            <span class="ss-exercises">
              ${ss.exA.name}${ss.exB ? ' + ' + ss.exB.name : ''}
            </span>
          </div>
          <div class="ss-meta">
            <span>${totalSets} × ${ss.reps}</span>
            <span class="rest-tag">↺ ${ss.rest}s</span>
          </div>
        </div>
        <div class="ss-body">
          ${_renderSSHeader(ss)}
          ${Array.from({length: totalSets}, (_, i) => _renderSetRow(ss, i + 1)).join('')}
        </div>
      </div>
    `;
  }

  function _renderSSHeader(ss) {
    function exLabel(name) {
      return `<span class="ex-col-label">
        <span class="ex-col-label-text">${name}</span>
        <button class="ex-tip-btn" data-ex="${name.replace(/"/g, '&quot;')}" title="Form tips">ⓘ</button>
      </span>`;
    }
    return `
      <div class="set-row set-row-header">
        <span class="set-num-col"></span>
        <div class="ex-cols">
          ${exLabel(ss.exA.name)}
          ${ss.exB ? exLabel(ss.exB.name) : ''}
        </div>
      </div>
    `;
  }

  function _renderSetCell(ss, pos, setNum, done, weight, reps, repsPlanned) {
    if (sessionEnded) {
      // View-only: plain text, no inputs
      const w = done ? (weight || '—') : '—';
      const r = done ? (reps || '—') : '—';
      return `
        <div class="ex-cell ${done ? '' : 'ex-skipped'}">
          <span class="set-stat">${w}${done && weight ? ' kg' : ''}</span>
          <span class="set-stat set-stat-reps">${r}${done && reps ? ' ×' : ''}</span>
          <span class="set-stat set-stat-tick">${done ? '✓' : '—'}</span>
        </div>`;
    }
    const exObj = pos === 'A' ? ss.exA : ss.exB;
    const lastW = pos === 'A'
      ? (weightCache[ss.exA.name] || DB.getLastWeight(ss.exA.name))
      : (weightCache[ss.exB.name] || DB.getLastWeight(ss.exB.name));
    const bothDone = completedKeys.has(makeKey(ss.id, 'A', setNum)) &&
                     (!ss.exB || completedKeys.has(makeKey(ss.id, 'B', setNum)));
    return `
      <div class="ex-cell ${done ? 'ex-done' : ''}">
        <input class="weight-input" type="number" step="0.5" min="0" placeholder="kg"
               value="${done ? weight : (lastW || '')}"
               data-ex="${exObj.name}" data-ss="${ss.id}" data-pos="${pos}" data-set="${setNum}"
               ${bothDone ? 'readonly' : ''}>
        <input class="reps-input" type="number" min="1" max="30" placeholder="${repsPlanned}"
               value="${done ? reps : ''}"
               data-ex="${exObj.name}" data-ss="${ss.id}" data-pos="${pos}" data-set="${setNum}"
               ${bothDone ? 'readonly' : ''}>
        <button class="tick-btn ${done ? 'tick-done' : ''}"
                data-ss="${ss.id}" data-pos="${pos}" data-set="${setNum}"
                data-ex="${exObj.name}" data-cat="${exObj.category}"
                data-reps="${repsPlanned}" data-rest="${ss.rest}"
                data-has-b="${ss.exB ? '1' : '0'}"
                ${done ? 'disabled' : ''}>
          ${done ? '✓' : '○'}
        </button>
      </div>`;
  }

  function _renderSetRow(ss, setNum) {
    const keyA = makeKey(ss.id, 'A', setNum);
    const keyB = ss.exB ? makeKey(ss.id, 'B', setNum) : null;
    const doneA = completedKeys.has(keyA);
    const doneB = keyB ? completedKeys.has(keyB) : true;
    const bothDone = doneA && doneB;

    const isNext = !bothDone && _isNextSet(ss, setNum);
    const prevBothDone = setNum === 1 ? true : (() => {
      const pk = makeKey(ss.id, 'A', setNum - 1);
      const pkB = ss.exB ? makeKey(ss.id, 'B', setNum - 1) : null;
      return completedKeys.has(pk) && (!pkB || completedKeys.has(pkB));
    })();
    const locked = !sessionEnded && !bothDone && !prevBothDone && setNum > 1;

    const wA = _getLoggedWeight(ss.id, 'A', setNum);
    const rA = _getLoggedReps(ss.id, 'A', setNum);
    const wB = ss.exB ? _getLoggedWeight(ss.id, 'B', setNum) : '';
    const rB = ss.exB ? _getLoggedReps(ss.id, 'B', setNum) : '';

    if (!sessionEnded) {
      // Pre-cache last weights for the active session inputs
      const lastWA = weightCache[ss.exA.name] || DB.getLastWeight(ss.exA.name);
      weightCache[ss.exA.name] = lastWA;
      if (ss.exB) {
        const lastWB = weightCache[ss.exB.name] || DB.getLastWeight(ss.exB.name);
        weightCache[ss.exB.name] = lastWB;
      }
    }

    return `
      <div class="set-row ${bothDone ? 'set-done' : ''} ${isNext ? 'set-next' : ''} ${locked ? 'set-locked' : ''}"
           data-ss-id="${ss.id}" data-set-num="${setNum}">
        <span class="set-num-col">Set ${setNum}</span>
        <div class="ex-cols">
          ${_renderSetCell(ss, 'A', setNum, doneA, wA, rA, ss.reps)}
          ${ss.exB ? _renderSetCell(ss, 'B', setNum, doneB, wB, rB, ss.reps) : ''}
        </div>
        ${bothDone ? `<span class="set-done-time">${_getSetDoneTime(ss.id, setNum)}</span>` : ''}
      </div>
    `;
  }

  function _renderRemarks() {
    const session = DB.getSessionByDate(activeDate)[0];
    const remarks = session?.remarks || '';
    return `
      <div class="remarks-section">
        <label class="remarks-label">Remarks</label>
        <textarea id="remarks-input" class="remarks-input" placeholder="How did it feel? Notes on weights, form…">${remarks}</textarea>
      </div>
    `;
  }

  function _renderDietSection() {
    const location = DB.getSetting('location') || 'coimbatore';
    const items = getActiveDietChecklist(location);
    const dietLogs = DB.getDietLog(activeDate);
    const doneMap = {};
    dietLogs.forEach(d => { doneMap[d.item_id] = !!d.completed; });

    const doneCount = Object.values(doneMap).filter(Boolean).length;

    return `
      <div class="diet-section">
        <div class="diet-header" id="diet-toggle">
          <span class="diet-title">Daily Checklist</span>
          <span class="diet-progress">${doneCount}/${items.length}</span>
          <span class="diet-chevron" id="diet-chevron">▼</span>
        </div>
        <div class="diet-body" id="diet-body">
          ${items.map(item => `
            <label class="diet-item ${doneMap[item.id] ? 'diet-item-done' : ''}">
              <input type="checkbox" class="diet-check" data-item="${item.id}"
                     data-location="${location}" ${doneMap[item.id] ? 'checked' : ''}>
              <span>${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Helper: count completed sets in a superset
  function _countCompletedInSS(ssId, hasB) {
    let count = 0;
    completedKeys.forEach(k => { if (k.startsWith(ssId + '_')) count++; });
    return count;
  }

  function _isNextSet(ss, setNum) {
    // The next set is the first one where not both A and B are done,
    // and all previous sets in this SS are complete
    for (let i = 1; i < setNum; i++) {
      const pkA = makeKey(ss.id, 'A', i);
      const pkB = ss.exB ? makeKey(ss.id, 'B', i) : null;
      if (!completedKeys.has(pkA) || (pkB && !completedKeys.has(pkB))) return false;
    }
    const kA = makeKey(ss.id, 'A', setNum);
    const kB = ss.exB ? makeKey(ss.id, 'B', setNum) : null;
    return !completedKeys.has(kA) || (kB && !completedKeys.has(kB));
  }

  function _loadCompletedSets() {
    if (!sessionId) { sessionSetsCache = []; return; }
    completedKeys.clear();
    sessionSetsCache = DB.getSessionSets(sessionId);
    sessionSetsCache.forEach(s => {
      completedKeys.add(makeKey(s.superset_id, s.superset_pos, s.set_number));
    });
  }

  function _getLoggedWeight(ssId, pos, setNum) {
    const found = sessionSetsCache.find(s =>
      s.superset_id === ssId && s.superset_pos === pos && s.set_number === setNum);
    return found?.weight_kg || '';
  }

  function _getLoggedReps(ssId, pos, setNum) {
    const found = sessionSetsCache.find(s =>
      s.superset_id === ssId && s.superset_pos === pos && s.set_number === setNum);
    return found?.reps_done || '';
  }

  function _getSetDoneTime(ssId, setNum) {
    if (!sessionId) return '';
    // Get the later of A and B completion times for this set
    const matches = sessionSetsCache.filter(s => s.superset_id === ssId && s.set_number === setNum);
    if (!matches.length) return '';
    const latest = matches.sort((a, b) => b.completed_at.localeCompare(a.completed_at))[0];
    if (!latest.completed_at) return '';
    const d = new Date(latest.completed_at + 'Z');
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  // Fires when tab/screen becomes visible again — refreshes both timers immediately.
  function _onVisibilityChange() {
    if (document.hidden) return;
    if (sessionStartTime) _startSessionTimer();
    if (restStartTime) _tickRestTimer();
  }

  // Session timer
  function _startSessionTimer() {
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);
    if (!sessionStartTime) return;

    function update() {
      const el = document.getElementById('session-timer');
      if (!el) { clearInterval(sessionTimerInterval); return; }
      const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      el.textContent = `${m}:${s}`;
    }

    update();
    sessionTimerInterval = setInterval(update, 1000);
    // Register once — duplicate listeners are silently ignored by the browser.
    document.addEventListener('visibilitychange', _onVisibilityChange);
  }

  function _stopSessionTimer() {
    if (sessionTimerInterval) { clearInterval(sessionTimerInterval); sessionTimerInterval = null; }
    document.removeEventListener('visibilitychange', _onVisibilityChange);
  }

  // Rest timer overlay — timestamp-based so backgrounding doesn't desync it.
  function _showRestTimer(seconds, nextHint) {
    if (restTimerInterval) clearInterval(restTimerInterval);
    restStartTime = Date.now();
    restDuration = seconds;
    restNextHint = nextHint || '';

    const overlay = document.getElementById('rest-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    _tickRestTimer();
    restTimerInterval = setInterval(_tickRestTimer, 500);
  }

  function _tickRestTimer() {
    const overlay = document.getElementById('rest-overlay');
    if (!overlay || overlay.classList.contains('hidden')) {
      _hideRestTimer();
      return;
    }
    const elapsed = (Date.now() - restStartTime) / 1000;
    const remaining = Math.max(0, Math.ceil(restDuration - elapsed));
    const pct = Math.min(100, (elapsed / restDuration) * 100);

    if (remaining <= 0) {
      _hideRestTimer();
      return;
    }

    overlay.innerHTML = `
      <div class="rest-card">
        <div class="rest-label">Rest</div>
        <div class="rest-countdown">${remaining}s</div>
        <div class="rest-bar-track">
          <div class="rest-bar-fill" style="width:${pct}%"></div>
        </div>
        ${restNextHint ? `<div class="rest-next">Next: ${restNextHint}</div>` : ''}
        <button class="btn-skip-rest" id="btn-skip-rest">Skip rest</button>
      </div>
    `;
    document.getElementById('btn-skip-rest')?.addEventListener('click', _hideRestTimer);
  }

  function _hideRestTimer() {
    if (restTimerInterval) { clearInterval(restTimerInterval); restTimerInterval = null; }
    restStartTime = null;
    const overlay = document.getElementById('rest-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  // Event handlers
  function _attachEvents() {
    // Date picker
    document.getElementById('date-picker')?.addEventListener('change', e => {
      activeDate = e.target.value;
      _stopSessionTimer();
      completedKeys.clear();
      sessionId = null;
      sessionStarted = false;
      render();
    });

    // Workout selector
    document.getElementById('workout-selector')?.addEventListener('change', e => {
      activeWorkoutKey = e.target.value;
      _stopSessionTimer();
      completedKeys.clear();
      sessionId = null;
      sessionStarted = false;
      render();
    });

    // Start session
    document.getElementById('btn-start-session')?.addEventListener('click', () => {
      const location = DB.getSetting('location') || 'gym';
      const weekType = DB.getSetting('week_type') || 'standard';
      sessionId = DB.createSession(activeDate, activeWorkoutKey, location, weekType);
      sessionStarted = true;
      sessionStartTime = new Date();

      const workout = WORKOUTS[activeWorkoutKey];
      let planned = 0;
      workout.supersets.forEach(ss => {
        planned += ss.sets * (ss.exB ? 2 : 1);
      });
      DB.updateSessionPlanned(sessionId, planned);

      render();
      _startSessionTimer();
    });

    // End session
    document.getElementById('btn-end-session')?.addEventListener('click', () => {
      _hideRestTimer();
      _stopSessionTimer();
      const remarks = document.getElementById('remarks-input')?.value || '';
      DB.endSession(sessionId, remarks);
      render();
    });

    // New session (re-log same day) — ignore the completed session this render cycle
    document.getElementById('btn-new-session')?.addEventListener('click', () => {
      newSessionMode = true;
      sessionId = null;
      sessionStarted = false;
      sessionEnded = false;
      completedKeys.clear();
      render();
    });

    // Tick buttons
    document.querySelectorAll('.tick-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => _handleTick(btn));
    });

    // Exercise tips buttons
    document.querySelectorAll('.ex-tip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        _showExerciseTips(btn.dataset.ex);
      });
    });

    // Weight inputs — update cache
    document.querySelectorAll('.weight-input').forEach(inp => {
      inp.addEventListener('change', e => {
        weightCache[e.target.dataset.ex] = parseFloat(e.target.value) || 0;
      });
    });

    // Diet checkboxes
    document.querySelectorAll('.diet-check').forEach(cb => {
      cb.addEventListener('change', e => {
        const { item, location } = e.target.dataset;
        DB.toggleDietItem(activeDate, item, e.target.checked, location);
        const label = e.target.closest('.diet-item');
        label?.classList.toggle('diet-item-done', e.target.checked);
        // update count
        const total = document.querySelectorAll('.diet-check').length;
        const done = document.querySelectorAll('.diet-check:checked').length;
        document.querySelector('.diet-progress').textContent = `${done}/${total}`;
      });
    });

    // Diet toggle
    document.getElementById('diet-toggle')?.addEventListener('click', () => {
      const body = document.getElementById('diet-body');
      const chevron = document.getElementById('diet-chevron');
      body?.classList.toggle('collapsed');
      if (chevron) chevron.textContent = body?.classList.contains('collapsed') ? '▶' : '▼';
    });

    // Remarks auto-save
    document.getElementById('remarks-input')?.addEventListener('blur', e => {
      if (!sessionId) return;
      const session = DB.getSession(sessionId);
      if (session?.end_time) {
        DB.endSession(sessionId, e.target.value);
      }
    });
  }

  function _handleTick(btn) {
    if (!sessionStarted) {
      // Auto-start session if not started
      const location = DB.getSetting('location') || 'gym';
      const weekType = DB.getSetting('week_type') || 'standard';
      sessionId = DB.createSession(activeDate, activeWorkoutKey, location, weekType);
      sessionStarted = true;
      sessionStartTime = new Date();
      const workout = WORKOUTS[activeWorkoutKey];
      let planned = 0;
      workout.supersets.forEach(ss => { planned += ss.sets * (ss.exB ? 2 : 1); });
      DB.updateSessionPlanned(sessionId, planned);
      _startSessionTimer();
      const timerEl = document.getElementById('session-timer');
      if (timerEl) timerEl.classList.remove('hidden');
      const ctrlBar = document.querySelector('.session-ctrl-bar');
      if (ctrlBar) ctrlBar.innerHTML = `
        <button class="btn-end" id="btn-end-session">■ End Session</button>
        <span class="sets-counter"><span id="sets-done-count">0</span> sets done</span>
      `;
      document.getElementById('btn-end-session')?.addEventListener('click', () => {
        _hideRestTimer();
        _stopSessionTimer();
        const remarks = document.getElementById('remarks-input')?.value || '';
        DB.endSession(sessionId, remarks);
        render();
      });
    }

    const { ss: ssId, pos, set: setNum, ex: exName, cat: exCat, reps: repsPlanned, rest: restSec, hasB } = btn.dataset;

    // Read weight/reps from inputs
    const row = btn.closest('.ex-cell');
    const weightInput = row?.querySelector('.weight-input');
    const repsInput = row?.querySelector('.reps-input');
    const weight = parseFloat(weightInput?.value) || 0;
    const repsDone = parseInt(repsInput?.value) || parseInt(repsPlanned) || 0;

    // Check PR
    const pr = DB.getPersonalRecord(exName);
    const isNewPR = weight > 0 && weight > pr;

    // Log to DB
    DB.logSet(sessionId, exName, exCat, ssId, pos, parseInt(setNum), repsPlanned, repsDone, weight, null);
    weightCache[exName] = weight;

    const key = makeKey(ssId, pos, parseInt(setNum));
    completedKeys.add(key);
    // Update local cache so _getLoggedWeight/_getLoggedReps work without re-querying
    sessionSetsCache.push({
      superset_id: ssId, superset_pos: pos, set_number: parseInt(setNum),
      exercise_name: exName, weight_kg: weight, reps_done: repsDone,
      completed_at: new Date().toISOString().replace('Z','')
    });

    // Update UI without full re-render
    btn.textContent = '✓';
    btn.classList.add('tick-done');
    btn.disabled = true;
    btn.closest('.ex-cell')?.classList.add('ex-done');
    if (weightInput) weightInput.readOnly = true;
    if (repsInput) repsInput.readOnly = true;

    // PR badge
    if (isNewPR) {
      const cell = btn.closest('.ex-cell');
      const prBadge = document.createElement('span');
      prBadge.className = 'pr-badge';
      prBadge.textContent = 'PR!';
      cell?.appendChild(prBadge);
    }

    // Update set counter
    const counterEl = document.getElementById('sets-done-count');
    if (counterEl) {
      const session = DB.getSession(sessionId);
      counterEl.textContent = session?.sets_completed || '';
    }

    // Check if both done in this set
    const otherPos = pos === 'A' ? 'B' : 'A';
    const otherKey = makeKey(ssId, otherPos, parseInt(setNum));
    const bothDone = hasB === '0' || completedKeys.has(otherKey);

    if (bothDone) {
      const setRow = btn.closest('.set-row');
      setRow?.classList.add('set-done');
      setRow?.classList.remove('set-next');

      // Add time stamp
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      if (!setRow?.querySelector('.set-done-time')) {
        const timeEl = document.createElement('span');
        timeEl.className = 'set-done-time';
        timeEl.textContent = timeStr;
        setRow?.appendChild(timeEl);
      }

      // Find next set row and mark it as next
      const allRows = setRow?.closest('.ss-body')?.querySelectorAll('.set-row:not(.set-row-header)');
      let foundCurrent = false;
      allRows?.forEach(r => {
        if (r === setRow) { foundCurrent = true; return; }
        if (foundCurrent && !r.classList.contains('set-done')) {
          r.classList.add('set-next');
          r.classList.remove('set-locked'); // unlock so tick buttons are interactive
          r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          foundCurrent = false; // only first next
        }
      });

      // Show rest timer
      const workout = WORKOUTS[activeWorkoutKey];
      const ss = workout.supersets.find(s => s.id === ssId);
      if (ss) {
        const nextSetNum = parseInt(setNum) + 1;
        let nextHint = '';
        if (nextSetNum <= ss.sets) {
          nextHint = `Set ${nextSetNum}: ${ss.exA.name}`;
        } else {
          const ssIdx = workout.supersets.indexOf(ss);
          const nextSS = workout.supersets[ssIdx + 1];
          if (nextSS) nextHint = `${nextSS.label}: ${nextSS.exA.name}`;
        }
        _showRestTimer(parseInt(restSec), nextHint);
      }
    } else {
      // Mark sibling exercise as next focus
      const siblingBtn = btn.closest('.set-row')?.querySelector(
        `.tick-btn[data-pos="${otherPos}"][data-set="${setNum}"]`
      );
      siblingBtn?.closest('.ex-cell')?.querySelector('.weight-input')?.focus();
    }
  }

  function _showExerciseTips(exName) {
    const tips = EXERCISE_TIPS[exName];
    const overlay = document.getElementById('ex-tips-overlay');
    if (!overlay) return;

    const ytUrl = 'https://www.youtube.com/results?search_query=' +
      encodeURIComponent(exName + ' exercise form tutorial');

    overlay.innerHTML = `
      <div class="ex-tips-card">
        <div class="ex-tips-header">
          <span class="ex-tips-emoji">${tips ? tips.emoji : '💪'}</span>
          <span class="ex-tips-name">${exName}</span>
          <button class="ex-tips-close" id="ex-tips-close">×</button>
        </div>
        <p class="ex-tips-cue">${tips ? tips.cue : 'Focus on controlled movement and full range of motion.'}</p>
        <a class="ex-tips-yt" href="${ytUrl}" target="_blank" rel="noopener">▶ Search YouTube for demo</a>
      </div>
    `;
    overlay.classList.remove('hidden');
    document.getElementById('ex-tips-close')?.addEventListener('click', () => {
      overlay.classList.add('hidden');
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    }, { once: true });
  }

  function cleanup() {
    _stopSessionTimer(); // also removes visibilitychange listener
    _hideRestTimer();
  }

  // Called from Progress view to deep-link to a specific past session.
  function setDate(date, workoutKey) {
    activeDate = date;
    activeWorkoutKey = workoutKey || null;
    sessionId = null;
    sessionStarted = false;
    sessionEnded = false;
    newSessionMode = false;
    completedKeys.clear();
    weightCache = {};
  }

  return { render, cleanup, setDate };
})();
