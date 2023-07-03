import React, { useEffect, useState } from 'react';
import discussion from './assets/discussion.svg';
import assignment from './assets/assignment.svg';
import quiz from './assets/quiz.svg';
import note from './assets/note.svg';
import link from './assets/link.svg';
import deleteIcon from './assets/deleteBold.svg';
import expand_item from './assets/expand_dropdown.svg';
import './stylesheets/shared.css';
import './stylesheets/Items.css';

function Items({ classes, items, filter }: { classes: { [key: string]: any }[], items: { [key: string]: any }[], filter: string[] }) {
    const [sortedItems, setSortedItems] = useState<{ [key: string]: any }[]>([]);

    const getColor = (classID: number) => {
        if (classID === -1) { // Personal
            return `#9897A9`;
        }
        const index = classes.findIndex(course => course['id'] === classID);
        const hue = index * (360 / classes.length);
        return `hsl(${hue}, 100%, 65%)`;
    }

    const getImage = (type: string) => {
        switch (type) {
            case 'discussion_topic': {
                return <img src={discussion} alt="discussion" />
            }
            case 'quiz': {
                return <img src={quiz} alt="quiz" />
            }
            case 'assignment': {
                return <img src={assignment} alt="assignment" />
            }
            case 'planner_note': {
                return <img src={note} alt="personal note" />
            }
        }
    }

    const getDate = (item: { [key: string]: any }, type: string) => {
        const date = new Date(item['plannable']['due_at']);
        switch (type) {
            case 'month': {
                return ("0" + (date.getMonth() + 1)).slice(-2);
            }
            case 'day': {
                return ("0" + date.getDate()).slice(-2);
            }
            case 'time': {
                return date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            }
        }
    }

    const showItem = async (event: React.MouseEvent, index: number) => {
        const item = event.currentTarget;
        if (!item.classList.contains('complete')) {
            return;
        }
        const itemsCopy = [...sortedItems];
        if (itemsCopy[index]['planner_override'] === null) { // Create override
            await chrome.runtime.sendMessage({query: "create_override", canvas_url: itemsCopy[index].account, access_token: itemsCopy[index].token, plannable_type: itemsCopy[index].plannable_type, plannable_id: itemsCopy[index].plannable_id, marked_complete: false});
        } else { // Update override
            await chrome.runtime.sendMessage({query: "update_override", canvas_url: itemsCopy[index].account, access_token: itemsCopy[index].token, plannable_id: itemsCopy[index].planner_override.id, marked_complete: false});
        }
        itemsCopy[index].marked_complete = false;
        setSortedItems(itemsCopy);
    }

    const hideItem = async (event: React.MouseEvent, index: number) => {
        const item = event.currentTarget.parentElement?.parentElement?.parentElement;
        if (!item) {
            return;
        }
        const itemsCopy = [...sortedItems];
        if (itemsCopy[index]['planner_override'] === null) { // Create override
            await chrome.runtime.sendMessage({query: "create_override", canvas_url: itemsCopy[index].account, access_token: itemsCopy[index].token, plannable_type: itemsCopy[index].plannable_type, plannable_id: itemsCopy[index].plannable_id, marked_complete: true});
        } else { // Update override
            await chrome.runtime.sendMessage({query: "update_override", canvas_url: itemsCopy[index].account, access_token: itemsCopy[index].token, plannable_id: itemsCopy[index].planner_override.id, marked_complete: true});
        }
        itemsCopy[index].marked_complete = true;
        setSortedItems(itemsCopy);
    }

    const deleteItem = async (event: React.MouseEvent, index: number) => {
        const item = event.currentTarget.parentElement?.parentElement?.parentElement;
        if (!item) {
            return;
        }
        const itemsCopy = [...sortedItems];
        await chrome.runtime.sendMessage({query: "delete_personal", canvas_url: itemsCopy[index].account, access_token: itemsCopy[index].token, plannable_id: itemsCopy[index].plannable_id});
        itemsCopy.splice(index, 1);
        setSortedItems(itemsCopy);
    }

    useEffect(() => {
        items.sort((a, b) => {
            if (a['plannable']['due_at'] === null) {
                if (b['plannable']['due_at'] === null) {
                    return 0;
                }
                return 1;
            }
            if (b['plannable']['due_at'] === null) {
                return -1;
            }
            const aDate = new Date(a['plannable']['due_at']);
            const bDate = new Date(b['plannable']['due_at']);
            return aDate.getTime() - bDate.getTime();
        });
        setSortedItems(items);
    }, [items]);

    return (
        <div className="items">
            {sortedItems.map((item, index) => {
                return (
                    !filter.includes(item['course_id'].toString()) &&
                    <div className={"item" + (item['marked_complete'] ? ' complete' : '')} style={{backgroundColor: getColor(item['course_id'])}} onClick={event => showItem(event, index)} key={index}>
                        {item['marked_complete'] ? 
                            <>
                                <div className="complete-course">{(item['course_id'] === -1 ? 'Personal' : item['context_name']) + " - Completed Item"}</div>
                                <img src={expand_item} alt="expand item" />
                            </> :
                            <>
                                <hr className="border-top"></hr>
                                <div className="color-line" style={{backgroundColor: getColor(item['course_id'])}}></div>
                                {getImage(item['plannable_type'])}
                                <div className={"item-content" + (item['plannable_type'] === 'planner_note' ? " personal" : '')}>
                                    <div className="assignment-course" style={{color: getColor(item['course_id'])}}>{item['course_id'] === -1 ? 'Personal' : item['context_name']}</div>
                                    <div className="assignment-title">
                                        {item['html_url'] ? 
                                            <>
                                                <a href={`https://${item['account']}${item['html_url']}`} target="_blank" rel="noopener noreferrer">{item['plannable']['title']}</a>
                                                <img src={link} alt="link" />
                                            </> :
                                            item['plannable']['title']
                                        }
                                    </div>
                                    <div className="assignment-options">
                                        <input type="checkbox" onClick={event => hideItem(event, index)}></input>
                                        {item['plannable_type'] === 'planner_note' &&
                                            <img src={deleteIcon} onClick={event => deleteItem(event, index)} alt="delete" />
                                        }
                                    </div>
                                </div>
                                <div className="due-date" style={{color: getColor(item['course_id'])}}>
                                    {item['plannable']['due_at'] === null ?
                                        <div className="no-date">No Due Date</div> :
                                        <>
                                            <div className="date">
                                                <div className="due-month">{getDate(item, 'month')}</div>
                                                <div className="slash" style={{backgroundColor: getColor(item['course_id'])}}></div>
                                                <div className="due-day">{getDate(item, 'day')}</div>
                                            </div>
                                            <div className="due-time">{getDate(item, 'time')}</div>
                                        </>
                                    }
                                </div>
                            </>
                        }
                    </div>
                )
            })}
        </div>
    );
}

export default Items;