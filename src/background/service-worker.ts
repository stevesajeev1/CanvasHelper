import logo from '../assets/logo.png'

// Enums for ResponseType
enum ResponseType {
    STATUS,
    JSON,
    ERROR
}

// Enums for RequestMethod
enum RequestMethod {
    GET = "GET",
    PUT = "PUT",
    POST = "POST",
    DELETE = "DELETE"
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


/* ------------------------- API STUFF ------------------------- */

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

const paginate = async (response: Response, request: {[key: string]: any}) => {
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

    return output.flat();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let url = '';
    let responseType: ResponseType;
    let requestMethod: RequestMethod = RequestMethod.GET;

    switch (request.query) {
        case 'validate': {
            url = `https://${request.canvas_url}/api/v1/users/self?access_token=${request.access_token}`;
            requestMethod = RequestMethod.GET;
            responseType = ResponseType.STATUS;
            break;
        }
        case 'todo': {
            url = `https://${request.canvas_url}/api/v1/planner/items?start_date=${encodeURIComponent(new Date().toISOString())}&access_token=${request.access_token}`;
            requestMethod = RequestMethod.GET;
            responseType = ResponseType.JSON;
            break;
        }
        case 'classes': {
            url = `https://${request.canvas_url}/api/v1/dashboard/dashboard_cards?access_token=${request.access_token}`;
            requestMethod = RequestMethod.GET;
            responseType = ResponseType.JSON;
            break;
        }
        case 'create_override': {
            url = `https://${request.canvas_url}/api/v1/planner/overrides?plannable_type=${request.plannable_type}&plannable_id=${request.plannable_id}&marked_complete=${request.marked_complete}&access_token=${request.access_token}`;
            requestMethod = RequestMethod.POST;
            break;
        }
        case 'update_override': {
            url = `https://${request.canvas_url}/api/v1/planner/overrides/${request.plannable_id}?marked_complete=${request.marked_complete}&access_token=${request.access_token}`;
            requestMethod = RequestMethod.PUT;
            break;
        }
        case 'delete_personal': {
            url = `https://${request.canvas_url}/api/v1/planner_notes/${request.plannable_id}?access_token=${request.access_token}`;
            requestMethod = RequestMethod.DELETE;
            break;
        }
        case 'create_personal': {
            url = `https://${request.canvas_url}/api/v1/planner_notes?title=${request.title}&todo_date=${request.todo_date}${request.course_id ? `&course_id=${request.course_id}` : ''}&access_token=${request.access_token}`;
            requestMethod = RequestMethod.POST;
            break;
        }
        case 'announcements': {
            url = `https://${request.canvas_url}/api/v1/announcements?access_token=${request.access_token}`;
            requestMethod = RequestMethod.GET;
            responseType = ResponseType.JSON;
            break;
        }
    }

    // If development, use a CORS proxy
    if (process.env.NODE_ENV === "development") {
        url = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }

    fetch(url, {
        method: requestMethod
    }).then(async response => {
        switch (responseType) {
            case ResponseType.STATUS: {
                sendResponse(response.status);
                break;
            }
            case ResponseType.JSON: {
                const output = await paginate(response, request);
                sendResponse(output);
                break;
            }
            default: {
                sendResponse();
            }
        }
    })
    .catch(_error => sendResponse(ResponseType.ERROR));

    return true;
});