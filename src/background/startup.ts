import logo from '../assets/logo.png'

// If development, set global chrome variable
if (process.env.NODE_ENV === "development") {
    (global as any).chrome = {
		...chrome,
        runtime: {
            onStartup: {
                addListener: (callback: () => void) => {
                    callback();
                }
            }
        },
        notifications: {
            create: (options: NotificationOptions) => {
                alert("Creating notification:\n" + JSON.stringify(options));
            }
        }
	};
}

chrome.runtime.onStartup.addListener(() => {
    chrome.notifications.create({
        iconUrl: logo,
        type: 'basic',
        title: 'Notification Title',
        message: 'Notification Body'
    });
});