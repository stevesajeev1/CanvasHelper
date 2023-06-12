import React, { useState, useEffect } from 'react';
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

    return (
        <div className="time">{date.toLocaleString().replace(',','')}</div>
    );
}

export default Clock;