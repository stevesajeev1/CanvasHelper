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
    	<App />
  	);
}

export const showSettings = () => {
  	root.render(
		<Settings />
  	);
}

// Check validity of accounts
chrome.storage.sync.get(['accounts'], async (items) => {
	const accounts = items['accounts'];
	if (!accounts) {
		showSettings();
		return;
	}
	let i = 0;
	while (i < accounts.length) {
		const account = accounts[i];
		const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://${account['canvas_url']}/api/v1/users/self?access_token=${account['access_token']}`)}`);
		if (response.status === 401 || response.status === 530) {
			accounts.splice(i, 1);
		} else {
			i++;
		}
	}
	showApp();
});