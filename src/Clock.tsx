import { useState, useEffect } from 'react';
import './stylesheets/shared.css';
import './stylesheets/Clock.css';

function Clock() {
    const [date, setDate] = useState(new Date());

	const updateClock = () => {
		setDate(new Date());
	}
	
	useEffect(() => {
		const timer = setInterval(updateClock, 1000);
		const cleanup = () => {
			clearInterval(timer);
		}
		return cleanup;
	});

	const day = () => {
		const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		return date.toLocaleDateString("en-US", options);
	}

	const time = () => {
		return date.toLocaleTimeString();
	}

    return (
        <div className="Clock">
			<div className="day">{day()}</div>
			<div className="time">{time()}</div>
		</div>
    );
}

export default Clock;