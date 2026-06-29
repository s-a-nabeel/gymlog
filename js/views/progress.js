// Progress view — stats, charts, session history

const ProgressView = (() => {
  let charts = {};

  function render() {
    const sessions = DB.getRecentSessions(100);
    const stats = _computeStats(sessions);

    document.getElementById('main-content').innerHTML = `
      <div class="progress-view">
        ${_renderStats(stats)}
        ${_renderHeatmap(sessions)}
        ${_renderCharts()}
        ${_renderSessionList(sessions)}
        ${_renderExportSection()}
      </div>
    `;

    _buildCharts(sessions);
    _attachEvents();
  }

  function _computeStats(sessions) {
    const completed = sessions.filter(s => s.end_time);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    const weekStr = weekStart.toISOString().split('T')[0];

    const thisWeek = completed.filter(s => s.date >= weekStr).length;
    const streak = _calcStreak(completed);
    const avgDur = completed.length
      ? Math.round(completed.filter(s => s.duration_minutes).reduce((a, s) => a + (s.duration_minutes || 0), 0) / completed.filter(s => s.duration_minutes).length)
      : 0;
    const totalSets = completed.reduce((a, s) => a + (s.sets_completed || 0), 0);

    return { total: completed.length, thisWeek, streak, avgDur, totalSets };
  }

  function _calcStreak(sessions) {
    if (!sessions.length) return 0;
    const gymSessions = sessions.filter(s => !['Rest','Abs'].includes(s.workout_key));
    const dates = [...new Set(gymSessions.map(s => s.date))].sort().reverse();
    if (!dates.length) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);

    for (const date of dates) {
      const d = new Date(date + 'T00:00:00');
      const diff = Math.round((checkDate - d) / 86400000);
      if (diff <= 1) {
        streak++;
        checkDate = d;
      } else break;
    }
    return streak;
  }

  function _renderStats(stats) {
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.streak}</div>
          <div class="stat-label">Gym Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.thisWeek}</div>
          <div class="stat-label">This Week</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.avgDur || '—'}</div>
          <div class="stat-label">Avg Duration (min)</div>
        </div>
      </div>
    `;
  }

  function _renderHeatmap(sessions) {
    const dateMap = {};
    sessions.forEach(s => {
      if (!dateMap[s.date]) dateMap[s.date] = { count: 0, mins: 0 };
      dateMap[s.date].count++;
      dateMap[s.date].mins += s.duration_minutes || 0;
    });

    // Build 12 weeks of grid
    const today = new Date();
    const cells = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const info = dateMap[ds];
      let intensity = 0;
      if (info) {
        if (info.mins >= 60) intensity = 4;
        else if (info.mins >= 40) intensity = 3;
        else if (info.mins >= 20) intensity = 2;
        else intensity = 1;
      }
      cells.push({ date: ds, intensity, info });
    }

    const dayLabels = ['M','T','W','T','F','S','S'];
    // Figure out offset so grid starts on Monday
    const firstDay = new Date(cells[0].date + 'T00:00:00');
    const startPad = (firstDay.getDay() + 6) % 7; // 0=Mon

    return `
      <div class="heatmap-section">
        <div class="section-title">Activity — Last 12 Weeks</div>
        <div class="heatmap-wrap">
          <div class="heatmap-days">
            ${dayLabels.map(l => `<span>${l}</span>`).join('')}
          </div>
          <div class="heatmap-grid">
            ${Array(startPad).fill('<div class="hm-cell hm-pad"></div>').join('')}
            ${cells.map(c => `
              <div class="hm-cell hm-i${c.intensity}" title="${c.date}${c.info ? ` · ${c.info.mins}min` : ''}"></div>
            `).join('')}
          </div>
        </div>
        <div class="heatmap-legend">
          <span>Less</span>
          <div class="hm-cell hm-i0"></div>
          <div class="hm-cell hm-i1"></div>
          <div class="hm-cell hm-i2"></div>
          <div class="hm-cell hm-i3"></div>
          <div class="hm-cell hm-i4"></div>
          <span>More</span>
        </div>
      </div>
    `;
  }

  function _renderCharts() {
    return `
      <div class="charts-section">
        <div class="chart-card">
          <div class="chart-title">Weekly Sessions</div>
          <div class="chart-canvas-wrap"><canvas id="chart-weekly"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Session Duration (min)</div>
          <div class="chart-canvas-wrap"><canvas id="chart-duration"></canvas></div>
        </div>
        <div class="chart-card chart-card-half">
          <div class="chart-title">Workout Mix</div>
          <div class="chart-canvas-wrap chart-canvas-wrap-tall"><canvas id="chart-mix"></canvas></div>
        </div>
        <div class="chart-card chart-card-half">
          <div class="chart-title">Time of Day</div>
          <div class="chart-canvas-wrap chart-canvas-wrap-tall"><canvas id="chart-time"></canvas></div>
        </div>
      </div>
    `;
  }

  function _buildCharts(sessions) {
    // Destroy existing
    Object.values(charts).forEach(c => c.destroy());
    charts = {};

    const completed = sessions.filter(s => s.end_time);
    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 }, color: '#888' } },
        y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 }, color: '#888' } }
      }
    };

    // Weekly sessions bar chart
    const weeklyData = DB.getWeeklyStats().reverse();
    if (weeklyData.length && document.getElementById('chart-weekly')) {
      charts.weekly = new Chart(document.getElementById('chart-weekly'), {
        type: 'bar',
        data: {
          labels: weeklyData.map(w => {
            if (!w.week) return '?';
            const parts = w.week.split('-W');
            return 'Wk ' + (parts[1] || parts[0]);
          }),
          datasets: [{
            data: weeklyData.map(w => w.sessions),
            backgroundColor: '#18181b',
            borderWidth: 0,
          }]
        },
        options: { ...chartDefaults, plugins: { legend: { display: false } } }
      });
    }

    // Duration line chart
    const durData = completed.filter(s => s.duration_minutes).slice(0, 20).reverse();
    if (durData.length && document.getElementById('chart-duration')) {
      charts.duration = new Chart(document.getElementById('chart-duration'), {
        type: 'line',
        data: {
          labels: durData.map(s => s.date.slice(5)),
          datasets: [{
            data: durData.map(s => s.duration_minutes),
            borderColor: '#18181b',
            backgroundColor: 'rgba(24,24,27,0.05)',
            borderWidth: 2,
            pointRadius: 3,
            fill: true,
            tension: 0.3,
          }]
        },
        options: { ...chartDefaults }
      });
    }

    // Workout mix doughnut
    const mixData = DB.getWorkoutDistribution();
    if (mixData.length && document.getElementById('chart-mix')) {
      const COLORS = ['#18181b','#52525b','#a1a1aa','#d4d4d8','#e4e4e7'];
      charts.mix = new Chart(document.getElementById('chart-mix'), {
        type: 'doughnut',
        data: {
          labels: mixData.map(m => WORKOUTS[m.workout_key]?.name || m.workout_key),
          datasets: [{
            data: mixData.map(m => m.count),
            backgroundColor: COLORS.slice(0, mixData.length),
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } }
          },
          cutout: '60%'
        }
      });
    }

    // Time of day histogram
    if (completed.length && document.getElementById('chart-time')) {
      const hours = Array(24).fill(0);
      completed.forEach(s => {
        if (s.start_time) {
          const h = new Date(s.start_time + 'Z').getHours();
          hours[h]++;
        }
      });
      const labeledHours = hours.map((v, h) => ({ h, v })).filter(x => x.v > 0 || (x.h >= 5 && x.h <= 23));
      charts.time = new Chart(document.getElementById('chart-time'), {
        type: 'bar',
        data: {
          labels: labeledHours.map(x => `${x.h}:00`),
          datasets: [{
            data: labeledHours.map(x => x.v),
            backgroundColor: '#18181b',
            borderWidth: 0,
          }]
        },
        options: { ...chartDefaults, plugins: { legend: { display: false } } }
      });
    }
  }

  function _renderSessionList(sessions) {
    const completed = sessions.filter(s => s.end_time).slice(0, 15);
    if (!completed.length) {
      return `<div class="empty-state">No completed sessions yet. Start your first workout!</div>`;
    }

    return `
      <div class="session-list-section">
        <div class="section-title">Recent Sessions</div>
        <div class="session-list">
          ${completed.map(s => {
            const dateObj = new Date(s.date + 'T00:00:00');
            const dateLabel = dateObj.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
            const workout = WORKOUTS[s.workout_key];
            const startH = s.start_time ? new Date(s.start_time + 'Z').toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) : '';
            return `
              <div class="session-row">
                <div class="session-row-left">
                  <span class="session-date">${dateLabel}</span>
                  <span class="session-workout badge-${s.workout_key}">${workout?.name || s.workout_key}</span>
                </div>
                <div class="session-row-right">
                  ${startH ? `<span class="session-time">${startH}</span>` : ''}
                  <span class="session-dur">${s.duration_minutes || 0} min</span>
                  <span class="session-sets">${s.sets_completed || 0} sets</span>
                  <button class="btn-view-session" data-date="${s.date}" data-workout="${s.workout_key}">View</button>
                </div>
                ${s.remarks ? `<div class="session-remarks">${s.remarks}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function _renderExportSection() {
    return `
      <div class="export-section">
        <button class="btn-export" id="btn-export-csv">Export data as CSV</button>
      </div>
    `;
  }

  function _attachEvents() {
    document.querySelectorAll('.btn-view-session').forEach(btn => {
      btn.addEventListener('click', () => {
        LogView.setDate(btn.dataset.date, btn.dataset.workout);
        location.hash = '#log';
      });
    });

    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      const csv = DB.exportCSV();
      if (!csv) { alert('No data to export yet.'); return; }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymlog_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function cleanup() {
    Object.values(charts).forEach(c => c.destroy());
    charts = {};
  }

  return { render, cleanup };
})();
