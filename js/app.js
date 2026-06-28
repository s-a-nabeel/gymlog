// Main app — bootstrap, routing, navigation

(async function () {
  // Load workout overrides from settings if any
  function applyWorkoutOverrides() {
    ['A','B','C','Home','Abs'].forEach(key => {
      const override = DB.getSetting('workout_override_' + key);
      if (override) {
        try {
          WORKOUTS[key].supersets = JSON.parse(override);
        } catch (e) { /* ignore */ }
      }
    });
  }

  // Loading screen
  const loadEl = document.getElementById('loading-screen');
  const appEl = document.getElementById('app');

  try {
    await DB.init();
    applyWorkoutOverrides();
  } catch (e) {
    console.error('DB init failed:', e);
    if (loadEl) loadEl.innerHTML = `
      <div style="text-align:center;padding:2rem;color:#dc2626">
        <p>Failed to load database. Please refresh.</p>
        <small>${e.message}</small>
      </div>`;
    return;
  }

  if (loadEl) loadEl.remove();
  if (appEl) appEl.classList.remove('hidden');

  // Routing
  let currentView = null;
  const views = { log: LogView, progress: ProgressView, settings: SettingsView };

  function navigate(view) {
    if (!views[view]) view = 'log';

    // Cleanup previous
    if (currentView && views[currentView]?.cleanup) views[currentView].cleanup();
    currentView = view;

    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('nav-active', btn.dataset.view === view);
    });

    // Update page title
    const titles = { log: 'Today', progress: 'Progress', settings: 'Settings' };
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = titles[view] || 'GymLog';

    // Render view
    views[view].render();

    // Update hash without triggering hashchange
    history.replaceState(null, '', '#' + view);
  }

  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.view));
  });

  // Hash routing
  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1);
    if (views[hash]) navigate(hash);
  });

  // Initial route
  const initHash = location.hash.slice(1);
  navigate(views[initHash] ? initHash : 'log');

  // Header name
  const name = DB.getSetting('name');
  if (name) {
    const nameEl = document.getElementById('header-name');
    if (nameEl) nameEl.textContent = name;
  }
})();
