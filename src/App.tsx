import { useEffect } from 'react';
import Navigation from './Navigation'
import Clock from './Clock'
import './stylesheets/shared.css';
import './stylesheets/App.css';

function App() {
	const fetchAssignments = async (canvas_url: string, access_token: string) => {
		const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://${canvas_url}/api/v1/users/self/upcoming_events?access_token=${access_token}`)}`)
		const data = await response.json();
		return data;
	}
	useEffect(() => {
		chrome.storage.sync.get(['accounts'], items => {
			const accounts = items['accounts'];
			for (const account of accounts) {
				(async () => {
					const assignments = await fetchAssignments(account['canvas_url'], account['access_token']);
					console.log(assignments);
				})();
			}
	  	});
	});

  	return (
  	  	<div className="App">
			<div className="container">
				<Clock />
			</div>
  	  	  	<Navigation currentPage="list"/>
  	  	</div>
  	);
}

export default App;