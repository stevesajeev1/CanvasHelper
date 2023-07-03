import { useEffect, useState, useRef } from 'react';
import Navigation from './Navigation'
import Loading from './Loading'
import Clock from './Clock'
import Filter from './Filter'
import Items from './Items'
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
	const [accounts, setAccounts] = useState<{ [key: string]: any }[]>([]);

	// State for classes
	const [classes, setClasses] = useState<{}[][]>([[]]);

	// State for items
	const [items, setItems] = useState<{}[]>([]);

	// State for filter
	const [filter, setFilter] = useState<string[]>([]);

	// State for adding item
	const [adding, setAdding] = useState(false);

	// State for class select
	const [addingClass, setAddingClass] = useState(false);

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

	const fetchItems = async (accounts: { [key: string]: string }[]) => {
		return new Promise<{}[]>(async (resolve, reject) => {
			const assignments: {}[] = [];
			for (const account of accounts) {
				const accountItems: { [key: string]: any }[] = await chrome.runtime.sendMessage({query: "todo", canvas_url: account['canvas_url'], access_token: account['access_token']});
				accountItems.forEach(accountItem => {
					if (accountItem['submissions'] !== false || accountItem['plannable_type'] === 'planner_note') {
						accountItem['account'] = account['canvas_url'];
						accountItem['token'] = account['access_token'];
						accountItem['course_id'] = accountItem['course_id'] ?? accountItem['plannable']['course_id'] ?? -1;
						if (accountItem['planner_override']) {
							accountItem['marked_complete'] = accountItem['planner_override']['marked_complete'];
						} else if (accountItem['submissions'] !== false) {
							accountItem['marked_complete'] = accountItem['submissions']['submitted'];
						} else {
							accountItem['marked_complete'] = false;
						}
						accountItem['plannable']['due_at'] = accountItem['plannable']['due_at'] || accountItem['plannable']['todo_date'];
						assignments.push(accountItem);
					}
				});
			}
			resolve(assignments);
        });
	}

	const fetchCourses = async (accounts: { [key: string]: string }[]) => {
		return new Promise<{}[][]>(async (resolve, reject) => {
			const courses = [];
			for (const account of accounts) {
				const accountClasses: { [key: string]: any }[] = await chrome.runtime.sendMessage({query: "classes", canvas_url: account['canvas_url'], access_token: account['access_token']});
				accountClasses.forEach(accountClass => {
					accountClass['account'] = account['canvas_url'];
					accountClass['token'] = account['access_token'];
				})
				courses.push(accountClasses);
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

	const addRef = useRef<HTMLDivElement>(null);

	const handleAdd = () => {
		if (!adding) {
			setAdding(true);
		}
	}

	const handleClickOutside = (event: MouseEvent) => {
        if (addRef.current && !addRef.current.contains(event.target as Node)) {
			setAdding(false);
        }
    }

	const handleAddClass = () => {
		setAddingClass(!addingClass);
	}

	const handleDateInputClick = (event: React.MouseEvent) => {
		(event.target as HTMLInputElement).showPicker();
	}

	const handleAddSubmit = async (event: React.MouseEvent) => {
		const classContainer = event.currentTarget.previousElementSibling;
		const dueDateContainer = classContainer?.previousElementSibling;
		const titleContainer = dueDateContainer?.previousElementSibling;

		const titleInput = titleContainer?.firstElementChild as HTMLInputElement;
		const dueDateInput = dueDateContainer?.firstElementChild as HTMLInputElement;
		const classSelect = classContainer?.lastElementChild as HTMLSelectElement;

		if (!titleInput.value) {
			titleInput.setCustomValidity('Input a title!');
			titleInput.reportValidity();
			return;
		}
		if (!dueDateInput.value || new Date(dueDateInput.value) <= new Date()) {
			dueDateInput.setCustomValidity('Input a date/time that is after the current time!');
			dueDateInput.reportValidity();
			return;
		}

		if (addingClass) {
			const info = JSON.parse(classSelect.selectedOptions[0].value);
			await chrome.runtime.sendMessage({query: "create_personal", canvas_url: info['account'], access_token: info['token'], title: titleInput.value, todo_date: `${new Date(dueDateInput.value).toISOString()}`, course_id: info['id']});
		} else {
			await chrome.runtime.sendMessage({query: "create_personal", canvas_url: accounts[0]['canvas_url'], access_token: accounts[0]['access_token'], title: titleInput.value, todo_date: `${new Date(dueDateInput.value).toISOString()}`});
		}

		const newItems = await fetchItems(accounts);
		setAdding(false);
		setItems(newItems);
	}

	useEffect(() => {
		// Check account validity
        checkAccountsValidity()
        .then(async validAccounts => {
			const filter = await getFilter();
			const courses = await fetchCourses(validAccounts);
            const assignments = await fetchItems(validAccounts);
			setAccounts(validAccounts);
			setFilter(filter);
			setClasses(courses);
			console.log(courses);
			setItems(assignments);
			setLoading(false);
        });
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	}, []);

  	return (
  	  	<div className="List">
			<div className="list-container">
				<Clock />
				<Filter accounts={accounts} classes={classes} loading={loading} filter={filter} setFilter={handleFilter}/>
				<div className="items-wrapper">
					{loading ? 
						<Loading size={100} /> :
						<Items classes={classes.flat()} items={items} filter={filter}/>
					}
				</div>
				<div className="add-new" onClick={handleAdd} ref={addRef}>
					{adding ? 
					<div className="add-new-input">
						<label className='personal-label'>Title: <input className='personal-input' type="text" maxLength={100}/></label>
						<label className='due-date-label'>Due Date: <input className='due-date-input' type="datetime-local" onClick={handleDateInputClick}/></label>
						<div className='class-input'>
							<label className='class-label'>Class?<input className='class-checkbox' type="checkbox" onChange={handleAddClass} /></label>
							{addingClass &&
								<select>
									{classes.flat().map((course: { [key: string]: any }, index) => {
										const courseInfo: { [key: string]: any } = {};
										courseInfo['id'] = course['id'];
										courseInfo['account'] = course['account'];
										courseInfo['token'] = course['token'];
										courseInfo['context_name'] = course['shortName'];
										return <option value={JSON.stringify(courseInfo)} key={index}>{course['shortName']}</option>
									})}
								</select>
							}
						</div>
						<div className='add-submit' onClick={handleAddSubmit}>Submit</div>
					</div> :
					<div className="add-new-title">
						Add item
						<img src={add} className="add" alt="add"></img>
					</div>}
				</div>
			</div>
  	  	  	<Navigation currentPage="list"/>
  	  	</div>
  	);
}

export default List;