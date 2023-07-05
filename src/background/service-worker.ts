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
                },
                removeListener: (listener: () => void) => {}
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
        },
        offscreen: {
            createDocument: () => {
                const offscreenDocument = new OffscreenCanvas(0, 0).getContext('2d');
                return {
                    getContext: (contextType: string) => {
                        if (contextType === '2d') {
                            return offscreenDocument;
                        }
                        return null;
                    }
                };
            },
            Reason: {
                BLOBS: 'BLOBS'
            }
        }
	};
}

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

const fetchAPI = (request: { [key: string]: any }) => {
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
            url = `https://${request.canvas_url}/api/v1/planner/items?start_date=${encodeURIComponent(new Date().toISOString())}${request.end_date ? `&end_date=${request.end_date}` : ''}&access_token=${request.access_token}`;
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

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: requestMethod
        }).then(async response => {
            switch (responseType) {
                case ResponseType.STATUS: {
                    resolve(response.status);
                    break;
                }
                case ResponseType.JSON: {
                    const output = await paginate(response, request);
                    resolve(output);
                    break;
                }
                default: {
                    resolve('');
                    break;
                }
            }
        }).catch(_error => {
            resolve(ResponseType.ERROR);
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    fetchAPI(request)?.then(result => {
        sendResponse(result);
    })
    return true;
});

/* ------------------------- NOTIFICATION STUFF ------------------------- */

const createOffscreen = async () => {
    console.log('created offscreen');
    await chrome.offscreen.createDocument({
        url: '../../../keepAlive.html',
        reasons: [chrome.offscreen.Reason.BLOBS],
        justification: 'keep service worker running',
    }).catch(() => {});
}

const formatMessage = (assignments: { [key: string]: any }[]) => {
    assignments.forEach(assignment => {
        assignment['plannable']['due_at'] = assignment['plannable']['due_at'] || assignment['plannable']['todo_date'];
    })
    assignments.sort((a, b) => {
        if (a['plannable']['due_at'] === null) {
            if (b['plannable']['due_at'] === null) {
                return 0;
            }
            return 1;
        }
        if (b['plannable']['due_at'] === null) {
            return -1;
        }
        const aDate = new Date(a['plannable']['due_at']);
        const bDate = new Date(b['plannable']['due_at']);
        return aDate.getTime() - bDate.getTime();
    });

    let message = "";
    assignments.forEach(assignment => {
        message += `${assignment['plannable']['title']} - ${new Date(assignment['plannable']['due_at']).toLocaleTimeString()}\n`
    });
    return message;
}

/* eslint-disable */
self.onmessage = e => {
    console.log(`kept alive: ${new Date().toLocaleTimeString()}`);
    chrome.storage.sync.get(['accounts', 'notifications', 'notified'], async items => {
        if (!items['accounts'] || items['accounts'].length === 0) {
            return;
        }
        if (items['notifications']) {
            // Check if it is time to notify
            if (items['notifications']['minutes'] !== false) {
                let upcomingAssignments: { [key: string]: any }[] = [];
                const delay = new Date(new Date().getTime() + (items['notifications']['minutes'] + 1) * 60 * 1000);
                for (const account of items['accounts']) {
                    upcomingAssignments.push(await fetchAPI({query: "todo", canvas_url: account['canvas_url'], access_token: account['access_token'], end_date: delay.toISOString()}) as {}[]);
                }

                upcomingAssignments = upcomingAssignments.flat();

                if (items['notified']) {
                    for (let i = 0; i < upcomingAssignments.length; i++) {
                        if (items['notified'].includes(upcomingAssignments[i]['plannable_id'])) {
                            upcomingAssignments.splice(i, 1);
                            i--;
                        }
                    }
                }

                if (upcomingAssignments.length !== 0) {
                    const message = formatMessage(upcomingAssignments);
                    chrome.notifications.create({
                        iconUrl: logo,
                        type: 'basic',
                        title: `Assignments due in <=${items['notifications']['minutes']} minutes`,
                        message: message
                    });
                }

                chrome.storage.sync.set({'notified': upcomingAssignments.map(upcomingAssignment => upcomingAssignment['plannable_id'])});
            }
        }
    });
};
/* eslint-enable */
createOffscreen();

const startup = () => {
    chrome.storage.sync.get(['notifications'], items => {
        if (items['notifications'] && items['notifications']['startup']) {
            startupNotification();
        }
    });
    createOffscreen();
}

const startupNotification = () => {
    chrome.storage.sync.get(['accounts'], async items => {
        if (!items['accounts'] || items['accounts'].length === 0) {
            return;
        }
        let todayAssignments: { [key: string]: any }[] = [];
        const tmrw = new Date();
        tmrw.setHours(0, 0, 0, 0);
        tmrw.setDate(tmrw.getDate() + 1);
        for (const account of items['accounts']) {
            todayAssignments.push(await fetchAPI({query: "todo", canvas_url: account['canvas_url'], access_token: account['access_token'], end_date: tmrw.toISOString()}) as {}[]);
        }

        todayAssignments = todayAssignments.flat();
        if (todayAssignments.length === 0) {
            return;
        }

        const message = formatMessage(todayAssignments);        
        
        chrome.notifications.create({
            iconUrl: logo,
            type: 'basic',
            title: 'Assignments for Today',
            message: message
        });
    });
}

chrome.runtime.onStartup.addListener(startup);