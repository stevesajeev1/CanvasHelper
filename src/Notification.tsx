import { useEffect, useRef } from 'react';
import Navigation from './Navigation';
import './stylesheets/shared.css';
import './stylesheets/Notification.css';

const Notification = () => {
    const minutesRef = useRef<HTMLDivElement>(null);
    const startupRef = useRef<HTMLInputElement>(null);

    let minutesDiv: HTMLDivElement | null; 
    let startupInput: HTMLInputElement | null;

    useEffect(() => {
        minutesDiv = minutesRef.current; 
        startupInput = startupRef.current;
    
        chrome.storage.sync.get(['notifications'], items => {
            if (items['notifications']) {
                if (startupRef.current) {
                    startupRef.current.checked = items['notifications']['startup'];
                }
                if (minutesRef.current) {
                    minutesRef.current.textContent = items['notifications']['minutes'] === false ? 'Off' : items['notifications']['minutes'];
                }
            }
        });
    }, []);

    const handleCheck = () => {
        chrome.storage.sync.set({'notifications': {
            'startup': (startupInput?.checked ? true : false),
            'minutes': (minutesDiv?.textContent ? parseInt(minutesDiv.textContent): 0)
        }});
    }

    const scrollMinutes = (event: React.WheelEvent) => {
        let minutes = event.currentTarget.textContent;
        if (minutes) {
            if (minutes === "Off") {
                minutes = "-10";
            }
            const newMinutes = parseInt(minutes) - 10 * Math.sign(event.deltaY);
            if (newMinutes < 0 || newMinutes > 1440) {
                event.currentTarget.textContent = "Off";
            } else {
                event.currentTarget.textContent = newMinutes.toString();
            }
        }
        chrome.storage.sync.set({'notifications': {
            'startup': (startupInput?.checked ? true : false),
            'minutes': (minutesDiv?.textContent ? (minutesDiv.textContent === 'Off' ? false : parseInt(minutesDiv.textContent)) : 0)
        }}, () => {
            chrome.runtime.sendMessage({query: "notificationUpdate"});
        });
    }

    return (
        <div className="Notification">
            <div className="notification-container">
                <h1>Notifications</h1>
                <div className="notification-settings">
                    <div>
                        Notification on Startup:
                        <label className="switch">
                            <input type="checkbox" onChange={handleCheck} ref={startupRef}></input>
                            <span className="slider round"></span>
                        </label>
                        <div className="description">Notifies you of assignments due today when the browser is opened</div>
                    </div>
                    <div>
                        <div className="minutesHeader">
                            Notification Delay:
                            <div id="minutes" onWheel={scrollMinutes} ref={minutesRef}>0</div>
                            minutes
                        </div>
                        <div className="description">Amount of time before a due date that triggers a notification</div>
                    </div>
                </div>
                <div className="disclaimer">*Note: Notifications only work if browser is open!*</div>
            </div>
            <Navigation currentPage='notification' />
        </div>
    )
}

export default Notification;