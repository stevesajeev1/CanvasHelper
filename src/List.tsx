import { useEffect } from 'react';
import Navigation from './Navigation'
import Clock from './Clock'
import add from './assets/add.svg';
import './stylesheets/shared.css';
import './stylesheets/List.css';

function List() {
	const fetchAssignments = async (accounts: { [key: string]: string }[]) => {
		return new Promise<{}[]>(async (resolve, reject) => {
			const assignments = [];
			for (const account of accounts) {
				assignments.push(await chrome.runtime.sendMessage({query: "todo", canvas_url: account['canvas_url'], access_token: account['access_token']}));
			}
			resolve(assignments);
        });
	}

	useEffect(() => {
		chrome.storage.sync.get(['accounts'], async items => {
			const accounts = items['accounts'];
			const assignmentsCopy = await fetchAssignments(accounts);
			console.log(assignmentsCopy);
	  	});
	}, []);

  	return (
  	  	<div className="List">
			<div className="list-container">
				<Clock />
				<div className="items">

				</div>
				<div className="add-new">
					Add item
					<img src={add} className="add" alt="add"></img>
				</div>
			</div>
  	  	  	<Navigation currentPage="list"/>
  	  	</div>
  	);
}

export default List;