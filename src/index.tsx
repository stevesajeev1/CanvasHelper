import ReactDOM from 'react-dom/client';
import './stylesheets/shared.css';
import List from './List';
import Settings from './Settings'

// If development, set global chrome variable for storage
if (process.env.NODE_ENV === "development") {
    (global as any).chrome = {
		...chrome,
		storage: {
			sync: {
				set: (data: { [key: string]: string }, callback?: () => void) => {
					for (const [key, value] of Object.entries(data)) {
						localStorage.setItem(key, JSON.stringify(value));
					}
					if (callback) {
						callback();
					}
				},
				get: (keys: string[], callback?: (result: { [key: string]: any }) => void) => {
					const output: { [key: string]: any } = {};
					for (const key of keys) {
						const storedValue = localStorage.getItem(key);
						if (storedValue !== null) {
							output[key] = JSON.parse(storedValue);
						}
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
chrome.storage.sync.get(['accounts'], items => {
  	if (items['accounts'] && items['accounts'].length !== 0) {
  	  	showList();
  	} else {
  	  	showSettings();
  	}
});