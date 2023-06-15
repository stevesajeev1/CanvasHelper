import ReactDOM from 'react-dom/client';
import './stylesheets/shared.css';
import List from './List';
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

export const showList = () => {
  	root.render(
    	<List />
  	);
}

export const showSettings = () => {
  	root.render(
		<Settings />
  	);
}

// Get existing accounts, if it exists
chrome.storage.sync.get('accounts', items => {
  	if (items['accounts']?.length !== 0) {
  	  	showList();
  	} else {
  	  	showSettings();
  	}
});