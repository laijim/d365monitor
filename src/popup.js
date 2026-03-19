import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const Popup = () => {
  const [seconds, setSeconds] = useState(Number(process.env.DEFAULT_REFRESH_SECONDS) || 60);
  const [saved, setSaved] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'checkRefreshButton' }, (response) => {
            if (!chrome.runtime.lastError && response) {
              setIsActivated(response.found);
            } else {
              setIsActivated(false);
            }
          });
        }
      });
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['refreshInterval'], (result) => {
        if (result.refreshInterval) {
          setSeconds(result.refreshInterval);
        }
      });
    }
  }, []);

  const handleSave = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ refreshInterval: Number(seconds) }, () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
    }
  };

  return (
    <div className="p-4 bg-gray-50 flex flex-col gap-3 font-sans w-64">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-lg font-bold text-gray-800">Settings</h1>
        <span className={`text-sm font-bold uppercase transition-colors ${isActivated ? 'text-green-500' : 'text-red-500'}`}>
          Activate
        </span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Refresh Interval (seconds)
        </label>
        <input
          type="number"
          min="1"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
        />
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
      >
        Save Settings
      </button>
      {saved && <span className="text-sm text-green-600 font-medium mt-1">Saved successfully!</span>}
    </div>
  );
};

ReactDOM.render(<Popup />, document.getElementById('root'));
