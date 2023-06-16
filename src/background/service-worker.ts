import logo from '../assets/logo.png'

// Enums for response
enum Validity {
    INVALID_URL = 530
}

enum ResponseType {
    STATUS,
    JSON,
    ERROR
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
    let url = '';
    let responseType: ResponseType;

    switch (request.query) {
        case 'validate': {
            url = `https://${request.canvas_url}/api/v1/users/self?access_token=${request.access_token}`;
            responseType = ResponseType.STATUS;
            break;
        }
        case 'todo': {
            url = `https://${request.canvas_url}/api/v1/users/self/upcoming_events?access_token=${request.access_token}`;
            responseType = ResponseType.JSON;
            break;
        }
    }

    // If development, use a CORS proxy
    if (process.env.NODE_ENV === "development") {
        url = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }

    fetch(url)
    .then(async response => {
        switch (responseType) {
            case ResponseType.STATUS: {
                sendResponse(response.status);
                break;
            }
            case ResponseType.JSON: {
                const json = await response.json();
                sendResponse(json);
                break;
            }
        }
    })
    .catch(_error => sendResponse(ResponseType.ERROR));

    return true;
});