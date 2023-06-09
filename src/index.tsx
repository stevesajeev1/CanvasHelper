import React from 'react';
import ReactDOM from 'react-dom/client';
import './stylesheets/index.css';
import App from './App';
import Settings from './Settings'

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const showApp = () => {
  	root.render(
    	<React.StrictMode>
      		<App showSettings={showSettings}/>
    	</React.StrictMode>
  	);
}

const showSettings = (access_token: string, canvas_url: string) => {
  	root.render(
  	  	<React.StrictMode>
  	    	<Settings showApp={showApp} access_token={access_token} canvas_url={canvas_url}/>
  	  	</React.StrictMode>
  	);
}

// Get existing settings, if it exists
chrome.storage.sync.get(['access_token', 'canvas_url'], (items) => {
  	if (items['access_token'] && items['canvas_url']) {
  	  	showApp();
  	} else {
  	  	showSettings('', '');
  	}
});