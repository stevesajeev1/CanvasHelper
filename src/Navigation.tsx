import React from 'react';
import { showSettings } from './index'
import settings from './assets/settings.svg';
import calendar from './assets/calendar.svg';
import notification from './assets/notification.svg'
import './stylesheets/shared.css';
import './stylesheets/Navigation.css';

function Navigation() {
    const handleSettings = () => {
    	// Get existing settings
    	chrome.storage.sync.get(['access_token', 'canvas_url'], (items) => {
    	  	showSettings(items['access_token'], items['canvas_url']);
    	});
  	}

    return (
        <div className="navPanel">
			<img src={settings} className="settings" onClick={handleSettings} alt="settings" />
			<img src={calendar} alt="calendar"></img>
			<img src={notification} alt="notification"></img>
		</div>
    );

}

export default Navigation;