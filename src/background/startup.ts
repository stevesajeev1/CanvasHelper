import logo from '../assets/logo.png'

chrome.runtime.onStartup.addListener(() => {
    chrome.notifications.create({
        iconUrl: logo,
        type: 'basic',
        title: 'Notification Title',
        message: 'Notification Body'
    });
});