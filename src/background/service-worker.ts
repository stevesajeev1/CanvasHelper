import logo from '../assets/logo.png'

// Enums for ResponseType
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

const parseLinkHeader = (linkHeader: string, access_token: string) => {
    const relPortions = linkHeader.split(",");
    const output: { [key: string]: string } = {};
    for (const relPortion of relPortions) {
        const relDesc: string = relPortion.matchAll(/"(.*)"/gm).next().value[1];
        const relLinks: string = relPortion.matchAll(/<(.*)>/gm).next().value[1];
        output[relDesc] = relLinks + `&access_token=${access_token}`;
    }
    return output;
}

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
                const output = [];
                let json = await response.json();
                output.push(json);

                let linkHeader = response.headers.get('Link');
                if (linkHeader) {
                    let links = parseLinkHeader(linkHeader, request.access_token);
                    while ('next' in links) {
                        const newResponse = await fetch(links['next']);
                        json = await newResponse.json();
                        output.push(json);
                        linkHeader = newResponse.headers.get('Link');
                        if (linkHeader) {
                            links = parseLinkHeader(linkHeader, request.access_token);
                        } else {
                            break;
                        }
                    }
                }

                sendResponse(output.flat());
                break;
            }
        }
    })
    .catch(_error => sendResponse(ResponseType.ERROR));

    return true;
});