import React from 'react';
import logo from './assets/logo.svg';
import settings from './assets/settings.svg';
import './stylesheets/App.css';

function App({ showSettings }: { showSettings: (access_token: string, canvas_url: string) => void}) {
    const handleSettings = () => {
    	// Get existing settings
    	chrome.storage.sync.get(['access_token', 'canvas_url'], (items) => {
    	  	showSettings(items['access_token'], items['canvas_url']);
    	});
  	}

  	return (
  	  	<div className="App">
  	  	  	<img src={settings} className="settings" onClick={handleSettings} alt="settings" />
  	  	  	App
  	  	</div>
  	);
}

export default App;
