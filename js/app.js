/* ===== APP INITIALIZATION ===== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  UI.initTheme();

  // Theme toggle
  const themeBtn = $('#themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', () => UI.toggleTheme());

  // Sidebar navigation
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      UI.switchModule(item.dataset.module);
    });
  });

  // Mobile tab navigation
  $$('.mobile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      UI.switchModule(tab.dataset.module);
    });
  });

  // Export buttons
  const exportCSVBtn = $('#exportCSV');
  const exportResultsBtn = $('#exportResults');
  const printBtn = $('#printResults');
  if (exportCSVBtn) exportCSVBtn.addEventListener('click', () => ExportManager.exportCSV());
  if (exportResultsBtn) exportResultsBtn.addEventListener('click', () => ExportManager.exportResults());
  if (printBtn) printBtn.addEventListener('click', () => ExportManager.printResults());

  // Export dropdown toggle
  const exportDropdown = $('#exportDropdown');
  const exportMenu = $('#exportMenu');
  if (exportDropdown && exportMenu) {
    exportDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => {
      exportMenu.classList.remove('show');
    });
  }

  // Render data input panel (default view)
  UI.renderDataInputPanel();
  UI.switchModule('data-input');

  // Listen for data changes to refresh active module
  AppState.onUpdate((type) => {
    if (type === 'data') {
      // Refresh variable selectors in active module if needed
    }
  });

  // Window resize handler for charts
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-render active module's charts
      const mod = AppState.activeModule;
      if (UI.modules[mod] && UI.modules[mod].render && mod !== 'data-input') {
        UI.modules[mod].render();
      }
    }, 300);
  });
});
