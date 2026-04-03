/* ===== EXPORT MANAGER ===== */

window.ExportManager = {

  exportCSV() {
    const { headers, rows } = AppState.data;
    if (!headers.length) {
      Utils.toast('No data to export', 'warning');
      return;
    }

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => {
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return '"' + cell.replace(/"/g, '""') + '"';
        }
        return cell;
      }).join(',') + '\n';
    });

    Utils.downloadFile(csv, 'novastats-data.csv', 'text/csv');
    Utils.toast('Data exported as CSV', 'success');
  },

  exportResults() {
    const results = AppState.results;
    if (!Object.keys(results).length) {
      Utils.toast('No results to export', 'warning');
      return;
    }

    let text = 'NovaStats - Statistical Analysis Results\n';
    text += '='.repeat(50) + '\n';
    text += `Generated: ${new Date().toLocaleString()}\n\n`;

    for (const [module, result] of Object.entries(results)) {
      if (!result) continue;
      text += `\n${'='.repeat(40)}\n`;
      text += `${(result.testType || module).toUpperCase()}\n`;
      text += `${'='.repeat(40)}\n\n`;

      if (result.steps) {
        result.steps.forEach(s => { text += s + '\n'; });
      }
      text += '\n';
    }

    Utils.downloadFile(text, 'novastats-results.txt', 'text/plain');
    Utils.toast('Results exported', 'success');
  },

  printResults() {
    window.print();
  }
};
