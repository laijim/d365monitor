let intervalId = null;
let refreshSec = Number(process.env.DEFAULT_REFRESH_SECONDS) || 60;

function clickRefreshButton() {
  const refreshBtn = document.querySelector('[aria-label="Refresh"]');
  if (refreshBtn) {
    console.info('Dynamics Auto-Refresh: Clicking refresh button');
    refreshBtn.click();
  } else {
    console.info('Dynamics Auto-Refresh: Refresh button not found on this page.');
  }
}

function startInterval() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (refreshSec > 0) {
    intervalId = setInterval(clickRefreshButton, refreshSec * 1000);
    console.debug(`Dynamics Auto-Refresh: Interval started at ${refreshSec} seconds.`);
  }
}

// Initialize
chrome.storage.sync.get(['refreshInterval'], (result) => {
  if (result.refreshInterval) {
    refreshSec = result.refreshInterval;
  }
  startInterval();
});

// Listen for settings change
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.refreshInterval) {
    refreshSec = changes.refreshInterval.newValue;
    console.debug(`Dynamics Auto-Refresh: Interval updated to ${refreshSec} seconds.`);
    startInterval();
  }
});

// Listen for popup status checks
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkRefreshButton') {
    const btn = document.querySelector('[aria-label="Refresh"]');
    sendResponse({ found: !!btn });
  }
});
