import React, { useEffect, useState, useRef } from 'react';
import expand_dropdown from './assets/expand_dropdown.svg';
import close_dropdown from './assets/close_dropdown.svg';
import Loading from './Loading';
import './stylesheets/shared.css';
import './stylesheets/Filter.css';

function Filter({ accounts, classes, loading, filter, setFilter }: { accounts: { [key: string]: any }[], classes: { [key: string]: any }[][], filter: string[], loading: boolean, setFilter: (newFilter: string[]) => void }) {
    // Set state for dropdown visibility
    const [dropdown, setDropdown] = useState(false);

    const options = useRef<HTMLDivElement>(null);

    const toggleFilter = () => {
        if (dropdown && !loading && options.current) { // Save filter
            const newFilter: string[] = [];
            Array.from(options.current.children).forEach(child => {
                if (child.className === "course" && !(child.firstElementChild as HTMLInputElement).checked) {
                    const id = (child as HTMLElement).dataset.id;
                    if (id) {
                        newFilter.push(id);
                    }
                }
            });
            setFilter(newFilter);
        }
        setDropdown(!dropdown);
    }

    const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
        let label = event.currentTarget.parentElement;
        if (label?.className !== "course") {
            let nextLabel = label?.nextElementSibling;
            while (nextLabel?.className === "course") {
                (nextLabel.firstElementChild as HTMLInputElement).checked = event.currentTarget.checked;
                nextLabel = nextLabel.nextElementSibling;
            }
        } else {
            let allChecked = event.currentTarget.checked;
            let prevLabel = label?.previousElementSibling;
            while (prevLabel?.className === "course") {
                if (allChecked) {
                    allChecked = (prevLabel.firstElementChild as HTMLInputElement).checked;
                }
                prevLabel = prevLabel.previousElementSibling;
            }
            let nextLabel = label?.nextElementSibling;
            while (nextLabel?.className === "course") {
                if (allChecked) {
                    allChecked = (nextLabel.firstElementChild as HTMLInputElement).checked;
                }
                nextLabel = nextLabel.nextElementSibling;
            }
            if (prevLabel) {
                (prevLabel.firstElementChild as HTMLInputElement).checked = allChecked;
            }
        }
    }

    const ref = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdown && ref.current && !ref.current.contains(event.target as Node)) {
            toggleFilter();
        }
    }

    useEffect(() => {
        if (dropdown && !loading) {
            if (options.current) {
                let parent: Element | undefined;
                let allChecked = false;
                Array.from(options.current.children).forEach(child => {
                    if (child.className !== "course") {
                        if (allChecked && parent) {
                            (parent.firstElementChild as HTMLInputElement).checked = true;
                        }
                        parent = child;
                        allChecked = true;
                    } else if (child.className === "course") {
                        const id = (child as HTMLElement).dataset.id;
                        if (id && !filter.includes(id)) {
                            (child.firstElementChild as HTMLInputElement).checked = true;
                        } else {
                            allChecked = false;
                        }
                    }
                });
                if (allChecked && parent) {
                    (parent.firstElementChild as HTMLInputElement).checked = true;
                }
            }
        }
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    });

    return (
        <div className="filter" ref={ref}>
            <div className="dropdown-header" onClick={toggleFilter}>
                Filter by Class
                {dropdown ?
                    <img src={close_dropdown} className="dropdown-icon" alt="close dropdown" /> :
                    <img src={expand_dropdown} className="dropdown-icon" alt="expand dropdown" />
                }
            </div>
            {dropdown && 
            <div className="dropdown-content">
                <hr></hr>
                <div className="options" ref={options}>
                    {loading ? 
                    <Loading size={30}/> :
                    classes.map((account, accountIndex) => {
                        return (
                            <React.Fragment key={accountIndex}>
                                <label><input type="checkbox" onChange={handleCheck}/>{accounts[accountIndex]['canvas_url']}</label>
                                {account.map((course) => {
                                    return (
                                        <label className="course" key={course['id']} data-id={course['id']}><input type="checkbox" onChange={handleCheck}/>{course['shortName']}</label>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>}
        </div>
    )
}

export default Filter;