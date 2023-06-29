import { useEffect, useRef } from 'react';
import { showList, showSettings } from './index'
import settings from './assets/settings.svg';
import list from './assets/list.svg';
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
			<img src={settings} className="settings" onClick={showSettings} title="Settings" alt="settings" />
			<img src={list} className="list" onClick={showList} title="List" alt="list" />
			<img src={announcement} className="announcement" title="Announcements" alt="announcement" />
			<img src={notification} className="notification" title="Notifications" alt="notification" />
		</div>
    );

}

export default Navigation;