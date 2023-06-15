import { showList, showSettings } from './index'
import settings from './assets/settings.svg';
import list from './assets/list.svg';
import calendar from './assets/calendar.svg';
import notification from './assets/notification.svg'
import './stylesheets/shared.css';
import './stylesheets/Navigation.css';

function Navigation({ currentPage }: { currentPage: string }) {
    return (
        <div className="navPanel">
			{currentPage !== "settings" && <img src={settings} className="settings" onClick={showSettings} alt="settings" />}
			{currentPage !== "list" && <img src={list} className="list" onClick={showList} alt="list" />}
			{currentPage !== "calendar" && <img src={calendar} alt="calendar"></img>}
			{currentPage !== "notification" && <img src={notification} className="notification" alt="notification"></img>}
		</div>
    );

}

export default Navigation;