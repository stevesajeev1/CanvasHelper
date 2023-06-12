import React from 'react';
import ReactDOM from 'react-dom/client';
import './stylesheets/shared.css';
import App from './App';
import Settings from './Settings'

// If development, set global chrome variable
if (process.env.NODE_ENV === "development") {
	const chromeStorage = {} as {[key: string]: string};
    (global as any).chrome = {
		...chrome,
		storage: {
			sync: {
				set: (data: { [key: string]: string }, callback?: () => void) => {
					for (const [key, value] of Object.entries(data)) {
						chromeStorage[key] = value;
					}
					if (callback) {
						callback();
					}
				},
				get: (keys: string[], callback?: (result: { [key: string]: string }) => void) => {
					const output: { [key: string]: string } = {};
					for (const key of keys) {
					  	output[key] = chromeStorage[key];
					}
					if (callback) {
						callback(output);
					}
				}
			}
		}
	};
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

export const showApp = () => {
  	root.render(
    	<React.StrictMode>
      		<App />
    	</React.StrictMode>
  	);
}

export const showSettings = (access_token: string, canvas_url: string) => {
  	root.render(
  	  	<React.StrictMode>
  	    	<Settings access_token={access_token} canvas_url={canvas_url}/>
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