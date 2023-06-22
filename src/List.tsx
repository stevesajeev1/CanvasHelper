import { useEffect, useState } from 'react';
import Navigation from './Navigation'
import Loading from './Loading'
import Clock from './Clock'
import Filter from './Filter'
import add from './assets/add.svg';
import './stylesheets/shared.css';
import './stylesheets/List.css';

// Enums for response
enum Validity {
    INVALID_TOKEN = 401,
    INVALID_URL = 530,
    ALREADY_EXISTS = -1,
    OK = 0
}

enum ResponseType {
    ERROR = 2
}

function List() {
	// State for loading accounts
    const [loading, setLoading] = useState(true);

	// State for accounts
	const [accounts, setAccounts] = useState<{}[]>([]);

	// State for classes
	const [classes, setClasses] = useState<{}[][]>([[]]);

	// State for assignments

	// State for filter
	const [filter, setFilter] = useState<string[]>([]);

	// Check validity of accounts
    const checkAccountsValidity = () => {
        return new Promise<[]>((resolve, reject) => {
            chrome.storage.sync.get(['accounts'], async (items) => {
                const validAccounts = items['accounts'];
                if (!validAccounts || validAccounts.length === 0) {
                    resolve([]);
                    return;
                }
                let i = 0;
                while (i < validAccounts.length) {
                    const account = validAccounts[i];
                    const response = await chrome.runtime.sendMessage({query: "validate", canvas_url: account['canvas_url'], access_token: account['access_token']});
                    if (response === Validity.INVALID_TOKEN || response === Validity.INVALID_URL || response === ResponseType.ERROR) {
                        validAccounts.splice(i, 1);
                    } else {
                        i++;
                    }
                }
                chrome.storage.sync.set({'accounts': validAccounts});
                resolve(validAccounts);
            });
        });
    }

	const fetchAssignments = async (accounts: { [key: string]: string }[]) => {
		return new Promise<{}[]>(async (resolve, reject) => {
			const assignments = [];
			for (const account of accounts) {
				assignments.push(await chrome.runtime.sendMessage({query: "todo", canvas_url: account['canvas_url'], access_token: account['access_token']}));
			}
			resolve(assignments);
        });
	}

	const fetchCourses = async (accounts: { [key: string]: string }[]) => {
		return new Promise<{}[][]>(async (resolve, reject) => {
			const courses = [];
			for (const account of accounts) {
				courses.push(await chrome.runtime.sendMessage({query: "classes", canvas_url: account['canvas_url'], access_token: account['access_token']}));
			}
			resolve(courses);
		});
	}

	const getFilter = () => {
		return new Promise<string[]>(async (resolve, reject) => {
			chrome.storage.sync.get(['filter'], items => {
				if (items['filter']) {
					resolve(items['filter']);
				} else {
					resolve([]);
				}
			});
		});
	}

	const handleFilter = (newFilter: string[]) => {
		chrome.storage.sync.set({'filter': newFilter}, () => {
			setFilter(newFilter);
		});
	}

	useEffect(() => {
		// Check account validity
        checkAccountsValidity()
        .then(async validAccounts => {
			const filter = await getFilter();
			const courses = await fetchCourses(validAccounts);
            const assignmentsCopy = await fetchAssignments(validAccounts);
			setAccounts(validAccounts);
			setFilter(filter);
			setClasses(courses);
			setLoading(false);
        });
	}, []);

  	return (
  	  	<div className="List">
			<div className="list-container">
				<Clock />
				<div className="content-container">
					{loading ?
						<Loading size={100}/> :
						<>
							<Filter accounts={accounts} classes={classes} filter={filter} setFilter={handleFilter}/>
							<div className="items">
							</div>
							<div className="add-new">
								Add item
								<img src={add} className="add" alt="add"></img>
							</div>
						</>
					}
				</div>
			</div>
  	  	  	<Navigation currentPage="list"/>
  	  	</div>
  	);
}

export default List;