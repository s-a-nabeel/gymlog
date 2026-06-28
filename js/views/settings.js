// Settings view — profile, schedule, workout configuration

const SettingsView = (() => {
  function render() {
    const isMobile = window.innerWidth < 768;

    document.getElementById('main-content').innerHTML = `
      <div class="settings-view">
        ${isMobile ? _renderMobileBanner() : ''}
        ${_renderProfile()}
        ${_renderWeekSchedule()}
        ${_renderWorkoutConfig()}
        ${_renderDangerZone()}
      </div>
    `;

    _attachEvents();
  }

  function _renderMobileBanner() {
    return `
      <div class="mobile-banner">
        <span class="banner-icon">⊞</span>
        <span>Settings are best configured on a laptop for easier editing.</span>
      </div>
    `;
  }

  function _renderProfile() {
    const name = DB.getSetting('name') || '';
    const age = DB.getSetting('age') || '';
    const weight = DB.getSetting('weight_kg') || '';
    const height = DB.getSetting('height_cm') || '';
    const weekType = DB.getSetting('week_type') || 'standard';
    const location = DB.getSetting('location') || 'coimbatore';

    return `
      <div class="settings-section">
        <div class="settings-section-title">Profile</div>
        <div class="settings-grid">
          <div class="field-group">
            <label class="field-label">Name</label>
            <input class="field-input" id="set-name" type="text" value="${name}" placeholder="Your name">
          </div>
          <div class="field-group">
            <label class="field-label">Age</label>
            <input class="field-input" id="set-age" type="number" value="${age}" placeholder="42">
          </div>
          <div class="field-group">
            <label class="field-label">Weight (kg)</label>
            <input class="field-input" id="set-weight" type="number" step="0.1" value="${weight}" placeholder="79">
          </div>
          <div class="field-group">
            <label class="field-label">Height (cm)</label>
            <input class="field-input" id="set-height" type="number" value="${height}" placeholder="166">
          </div>
          <div class="field-group">
            <label class="field-label">Current Location</label>
            <select class="field-input" id="set-location">
              <option value="coimbatore" ${location === 'coimbatore' ? 'selected' : ''}>Coimbatore (Gym)</option>
              <option value="trivandrum" ${location === 'trivandrum' ? 'selected' : ''}>Trivandrum (Home)</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Week Type</label>
            <select class="field-input" id="set-week-type">
              <option value="standard" ${weekType === 'standard' ? 'selected' : ''}>Standard (Tue–Thu gym)</option>
              <option value="heavy" ${weekType === 'heavy' ? 'selected' : ''}>Heavy (Mon–Thu gym)</option>
            </select>
          </div>
        </div>
        <button class="btn-save" id="btn-save-profile">Save Profile</button>
        <div class="save-confirm hidden" id="profile-saved">✓ Saved</div>
      </div>
    `;
  }

  function _renderWeekSchedule() {
    const weekType = DB.getSetting('week_type') || 'standard';
    const schedule = DB.getSchedule('standard');
    const scheduleH = DB.getSchedule('heavy');

    return `
      <div class="settings-section">
        <div class="settings-section-title">Weekly Schedule</div>
        <p class="settings-note">Choose which workout happens on each day for each week type.</p>

        <div class="schedule-tabs">
          <button class="sched-tab sched-tab-active" data-tab="standard">Standard Week</button>
          <button class="sched-tab" data-tab="heavy">Heavy Week</button>
        </div>

        <div class="schedule-pane" id="sched-standard">
          ${_renderScheduleGrid('standard', schedule)}
        </div>
        <div class="schedule-pane hidden" id="sched-heavy">
          ${_renderScheduleGrid('heavy', scheduleH)}
        </div>

        <button class="btn-save" id="btn-save-schedule">Save Schedule</button>
        <div class="save-confirm hidden" id="schedule-saved">✓ Saved</div>
      </div>
    `;
  }

  function _renderScheduleGrid(weekType, schedule) {
    return `
      <div class="schedule-grid">
        ${DAYS.map(day => `
          <div class="schedule-row">
            <span class="day-label">${day}</span>
            <select class="field-input sched-select" data-week="${weekType}" data-day="${day}">
              ${WORKOUT_KEYS.map(k =>
                `<option value="${k}" ${schedule[day] === k ? 'selected' : ''}>${WORKOUTS[k]?.name || k}</option>`
              ).join('')}
            </select>
          </div>
        `).join('')}
      </div>
    `;
  }

  function _renderWorkoutConfig() {
    return `
      <div class="settings-section">
        <div class="settings-section-title">Workout Configuration</div>
        <p class="settings-note">Default sets, reps, and rest times for each workout. Changes apply to new sessions.</p>

        <div class="workout-tabs">
          ${['A','B','C','Home','Abs'].map((k, i) => `
            <button class="wtab ${i === 0 ? 'wtab-active' : ''}" data-w="${k}">${WORKOUTS[k].name}</button>
          `).join('')}
        </div>

        ${['A','B','C','Home','Abs'].map((k, i) => `
          <div class="workout-pane ${i === 0 ? '' : 'hidden'}" id="wpane-${k}">
            ${_renderWorkoutTable(k)}
          </div>
        `).join('')}
      </div>
    `;
  }

  function _renderWorkoutTable(key) {
    const workout = WORKOUTS[key];
    if (!workout.supersets.length) return '<p class="settings-note">No supersets configured.</p>';

    return `
      <table class="workout-table">
        <thead>
          <tr>
            <th>Group</th>
            <th>Exercise A</th>
            <th>Exercise B</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>Rest (s)</th>
            <th>Optional</th>
          </tr>
        </thead>
        <tbody>
          ${workout.supersets.map((ss, idx) => `
            <tr>
              <td><span class="ss-badge">${ss.label}</span></td>
              <td>
                <input class="table-input" type="text"
                  data-w="${key}" data-ss="${ss.id}" data-field="exA"
                  value="${ss.exA.name}">
              </td>
              <td>
                ${ss.exB
                  ? `<input class="table-input" type="text"
                      data-w="${key}" data-ss="${ss.id}" data-field="exB"
                      value="${ss.exB.name}">`
                  : '<span class="text-muted">—</span>'}
              </td>
              <td>
                <input class="table-input table-input-sm" type="number" min="1" max="10"
                  data-w="${key}" data-ss="${ss.id}" data-field="sets"
                  value="${ss.sets}">
              </td>
              <td>
                <input class="table-input table-input-sm" type="text"
                  data-w="${key}" data-ss="${ss.id}" data-field="reps"
                  value="${ss.reps}">
              </td>
              <td>
                <input class="table-input table-input-sm" type="number" min="0" step="5"
                  data-w="${key}" data-ss="${ss.id}" data-field="rest"
                  value="${ss.rest}">
              </td>
              <td>
                <input type="checkbox" class="table-check"
                  data-w="${key}" data-ss="${ss.id}" data-field="optional"
                  ${ss.optional ? 'checked' : ''}>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <button class="btn-save btn-save-sm" data-save-workout="${key}">Save ${workout.name}</button>
      <div class="save-confirm hidden" id="wsaved-${key}">✓ Saved</div>
    `;
  }

  function _renderDangerZone() {
    return `
      <div class="settings-section danger-zone">
        <div class="settings-section-title">Data</div>
        <div class="danger-row">
          <div>
            <strong>Export all data</strong>
            <p class="settings-note">Download a CSV backup of all your sessions and sets.</p>
          </div>
          <button class="btn-export" id="settings-export">Export CSV</button>
        </div>
        <div class="danger-row">
          <div>
            <strong>Reset all data</strong>
            <p class="settings-note">Delete all sessions and logs. This cannot be undone.</p>
          </div>
          <button class="btn-danger" id="btn-reset-data">Reset</button>
        </div>
      </div>
    `;
  }

  function _attachEvents() {
    // Profile save
    document.getElementById('btn-save-profile')?.addEventListener('click', () => {
      DB.setSetting('name', document.getElementById('set-name').value);
      DB.setSetting('age', document.getElementById('set-age').value);
      DB.setSetting('weight_kg', document.getElementById('set-weight').value);
      DB.setSetting('height_cm', document.getElementById('set-height').value);
      DB.setSetting('location', document.getElementById('set-location').value);
      DB.setSetting('week_type', document.getElementById('set-week-type').value);

      // Log weight if changed
      const w = parseFloat(document.getElementById('set-weight').value);
      if (w) DB.setBodyMetric(new Date().toISOString().split('T')[0], w, '');

      _flash('profile-saved');
    });

    // Schedule tabs
    document.querySelectorAll('.sched-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sched-tab').forEach(t => t.classList.remove('sched-tab-active'));
        tab.classList.add('sched-tab-active');
        document.querySelectorAll('.schedule-pane').forEach(p => p.classList.add('hidden'));
        document.getElementById('sched-' + tab.dataset.tab)?.classList.remove('hidden');
      });
    });

    // Schedule save
    document.getElementById('btn-save-schedule')?.addEventListener('click', () => {
      document.querySelectorAll('.sched-select').forEach(sel => {
        DB.setScheduleDay(sel.dataset.week, sel.dataset.day, sel.value);
      });
      _flash('schedule-saved');
    });

    // Workout tabs
    document.querySelectorAll('.wtab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.wtab').forEach(t => t.classList.remove('wtab-active'));
        tab.classList.add('wtab-active');
        document.querySelectorAll('.workout-pane').forEach(p => p.classList.add('hidden'));
        document.getElementById('wpane-' + tab.dataset.w)?.classList.remove('hidden');
      });
    });

    // Workout save buttons
    document.querySelectorAll('[data-save-workout]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.saveWorkout;
        const workout = WORKOUTS[key];
        const pane = document.getElementById('wpane-' + key);
        if (!pane || !workout) return;

        // Update in-memory WORKOUTS object
        workout.supersets.forEach(ss => {
          const exAInput = pane.querySelector(`input[data-ss="${ss.id}"][data-field="exA"]`);
          const exBInput = pane.querySelector(`input[data-ss="${ss.id}"][data-field="exB"]`);
          const setsInput = pane.querySelector(`input[data-ss="${ss.id}"][data-field="sets"]`);
          const repsInput = pane.querySelector(`input[data-ss="${ss.id}"][data-field="reps"]`);
          const restInput = pane.querySelector(`input[data-ss="${ss.id}"][data-field="rest"]`);
          const optCheck = pane.querySelector(`input[data-ss="${ss.id}"][data-field="optional"]`);

          if (exAInput) ss.exA.name = exAInput.value;
          if (exBInput && ss.exB) ss.exB.name = exBInput.value;
          if (setsInput) ss.sets = parseInt(setsInput.value) || ss.sets;
          if (repsInput) ss.reps = repsInput.value;
          if (restInput) ss.rest = parseInt(restInput.value) || ss.rest;
          if (optCheck) ss.optional = optCheck.checked;
        });

        // Persist to settings as JSON
        DB.setSetting('workout_override_' + key, JSON.stringify(workout.supersets));
        _flash('wsaved-' + key);
      });
    });

    // Export
    document.getElementById('settings-export')?.addEventListener('click', () => {
      const csv = DB.exportCSV();
      if (!csv) { alert('No data yet.'); return; }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymlog_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Reset
    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
      if (confirm('Delete ALL session data? This cannot be undone.')) {
        localStorage.removeItem('gymlog_db_v1');
        location.reload();
      }
    });
  }

  function _flash(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 2000);
  }

  function cleanup() {}

  return { render, cleanup };
})();
