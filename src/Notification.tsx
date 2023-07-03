import { useEffect, useRef } from 'react';
import Navigation from './Navigation';
import './stylesheets/shared.css';
import './stylesheets/Notification.css';

const Notification = () => {
    const minutesRef = useRef<HTMLDivElement>(null);
    const startupRef = useRef<HTMLInputElement>(null);
    const updateRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let minutesDiv = minutesRef.current; 
        let startupInput = startupRef.current;
        let updateInput = updateRef.current;
        
        chrome.storage.sync.get(['notifications'], items => {
            if (items['notifications']) {
                if (startupRef.current) {
                    startupRef.current.checked = items['notifications']['startup'];
                }
                if (updateRef.current) {
                    updateRef.current.checked = items['notifications']['update'];
                }
                if (minutesRef.current) {
                    minutesRef.current.textContent = items['notifications']['minutes'];
                }
            }
        });

        return () => {
            chrome.storage.sync.set({'notifications': {
                'startup': (startupInput?.checked ? true : false),
                'update': (updateInput?.checked ? true : false),
                'minutes': (minutesDiv?.textContent ? parseInt(minutesDiv.textContent): 0)
            }});
        }
    }, []);

    const scrollMinutes = (event: React.WheelEvent) => {
        let minutes = event.currentTarget.textContent;
        if (minutes) {
            const newMinutes = parseInt(minutes) - 10 * Math.sign(event.deltaY);
            if (newMinutes < 0 || newMinutes > 1440) return;
            event.currentTarget.textContent = newMinutes.toString();
        }
    }

    return (
        <div className="Notification">
            <div className="notification-container">
                <h1>Notifications</h1>
                <div className="notification-settings">
                    <div>
                        Notification on Startup:
                        <label className="switch">
                            <input type="checkbox" ref={startupRef}></input>
                            <span className="slider round"></span>
                        </label>
                        <div className="description">Notifies you of assignments due today when the browser is opened</div>
                    </div>
                    <div>
                        Notification on Update:
                        <label className="switch">
                            <input type="checkbox" ref={updateRef}></input>
                            <span className="slider round"></span>
                        </label>
                        <div className="description">Notifies you when a new assignment or announcement is created</div>
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
            </div>
            <Navigation currentPage='notification' />
        </div>
    )
}

export default Notification;