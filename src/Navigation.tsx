import { useEffect, useRef } from 'react';
import { showList, showSettings } from './index'
import settings from './assets/settings.svg';
import list from './assets/list.svg';
import calendar from './assets/calendar.svg';
import notification from './assets/notification.svg'
import announcement from './assets/announcement.svg';
import './stylesheets/shared.css';
import './stylesheets/Navigation.css';

function Navigation({ currentPage }: { currentPage: string }) {
	const navPanel = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (navPanel.current) {
			const images = Array.from(navPanel.current.children) as HTMLElement[];
			for (const image of images) {
				if (currentPage === image.className) {
					image.style.display = 'none';
				}
			}
		}
    });

    return (
        <div className="navPanel" ref={navPanel}>
			<img src={settings} className="settings" onClick={showSettings} alt="settings" />
			<img src={list} className="list" onClick={showList} alt="list" />
			<img src={calendar} alt="calendar" />
			<img src={notification} alt="notification" />
			<img src={announcement} alt="announcement" />
		</div>
    );

}

export default Navigation;