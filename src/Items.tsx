import { useEffect, useState } from 'react';
import discussion from './assets/discussion.svg';
import assignment from './assets/assignment.svg';
import quiz from './assets/quiz.svg';
import note from './assets/note.svg';
import './stylesheets/shared.css';
import './stylesheets/Items.css';

function Items({ classes, items, filter }: { classes: { [key: string]: any }[], items: { [key: string]: any }[], filter: string[] }) {
    const [sortedItems, setSortedItems] = useState<{ [key: string]: any }[]>([]);

    const getColor = (classID: number) => {
        if (classID === -1) { // Personal
            return `#979797`;
        }
        const index = classes.findIndex(course => course['id'] === classID);
        const hue = index * (360 / classes.length);
        return `hsl(${hue}, 100%, 65%)`;
    }

    const getCourse = (item: { [key: string]: any }) => {
        if (item['plannable_type'] === 'planner_note') {
            if (item['course_id'] === -1) {
                return 'Personal';
            } else {
                return classes.find(course => course['id'] === item['course_id'])?.['shortName'] + ' (Personal)';
            }
        } else {
            return item['context_name'];
        }
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
        console.log(items);
        setSortedItems(items);
    }, [items]);

    return (
        <div className="items">
            {sortedItems.map((item, index) => {
                return (
                    !filter.includes(item['course_id'].toString()) &&
                    <div className="item" key={index}>
                        <hr className="border-top"></hr>
                        <div className="color-line" style={{backgroundColor: getColor(item['course_id'])}}></div>
                        {getImage(item['plannable_type'])}
                        <div className="item-content">
                            {getCourse(item)}
                            <br></br>
                            {item['plannable']['title']}
                            <br></br>
                            {item['plannable']['due_at']}
                            <br></br>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

export default Items;