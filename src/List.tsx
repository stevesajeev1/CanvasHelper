import { useEffect } from 'react';
import Navigation from './Navigation'
import Clock from './Clock'
import './stylesheets/shared.css';
import './stylesheets/List.css';

function List() {
	const fetchAssignments = async (canvas_url: string, access_token: string) => {
		const response = await chrome.runtime.sendMessage({query: "todo", canvas_url: canvas_url, access_token: access_token});
		return response;
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
  	  	<div className="List">
			<div className="list-container">
				<Clock />
				<div className="items">

				</div>
				<div className="createNew"></div>
			</div>
  	  	  	<Navigation currentPage="list"/>
  	  	</div>
  	);
}

export default List;