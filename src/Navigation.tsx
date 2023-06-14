import { showSettings } from './index'
import settings from './assets/settings.svg';
import calendar from './assets/calendar.svg';
import notification from './assets/notification.svg'
import './stylesheets/shared.css';
import './stylesheets/Navigation.css';

function Navigation() {
    return (
        <div className="navPanel">
			<img src={settings} className="settings" onClick={showSettings} alt="settings" />
			<img src={calendar} alt="calendar"></img>
			<img src={notification} className="notification" alt="notification"></img>
		</div>
    );

}

export default Navigation;