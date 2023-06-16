import logo from '../assets/logo.png'

// Enums for response
enum Validity {
    INVALID_TOKEN = 401,
    INVALID_URL = 530,
    OK = 0
}

// If development, set global chrome variable for runtime
if (process.env.NODE_ENV === "development") {
    (global as any).chrome = {
		...chrome,
        runtime: {
            onStartup: {
                addListener: (callback: () => void) => {
                    callback();
                }
            },
            onMessage: {
                addListener: (callback: (request: any, sender: any, sendResponse: (response: any) => void) => void) => {
                    (global as any).chrome.runtime.listener = callback;
                }
            },
            sendMessage: (request: any) => {
                return new Promise((resolve, reject) => {
                    const sendResponse = (response: any) => {
                        resolve(response);
                    };
                    (global as any).chrome.runtime.listener(request, 'sender', sendResponse);
                });
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.query === "validate") {
        let url = `https://${request.canvas_url}/api/v1/users/self?access_token=${request.access_token}`;

        // If development, use a CORS proxy
        if (process.env.NODE_ENV === "development") {
            url = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        }

        fetch(url)
        .then(response => sendResponse(response.status))
        .catch(_error => sendResponse(Validity.INVALID_URL));

        return true;
    }
});