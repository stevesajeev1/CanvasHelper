import { useState, useEffect } from 'react';
import './stylesheets/shared.css';
import './stylesheets/Settings.css';
import Account from './Account';
import Loading from './Loading';
import Navigation from './Navigation';

// Enums for response
enum Validity {
    INVALID_TOKEN = 401,
    INVALID_URL = 530,
    ALREADY_EXISTS = -1,
    OK = 0
}

function Settings() {
    // State for showing/hiding help div
    const [help, setHelp] = useState(false);

    // State for accounts in system
    const [accounts, setAccounts] = useState<JSX.Element[]>([]);

    // State for loading accounts
    const [loading, setLoading] = useState(true);

    // State for navigation panel
    const [navPanel, setNavPanel] = useState(false);

    // Check validity of accounts
    const checkAccountsValidity = () => {
        return new Promise<[]>((resolve, reject) => {
            chrome.storage.sync.get(['accounts'], async (items) => {
                const validAccounts = items['accounts'];
                if (!validAccounts || validAccounts.length === 0) {
                    resolve([]);
                    return;
                }
                setNavPanel(true);
                let i = 0;
                while (i < validAccounts.length) {
                    const account = validAccounts[i];
                    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://${account['canvas_url']}/api/v1/users/self?access_token=${account['access_token']}`)}`);
                    if (response.status === 401 || response.status === 530) {
                        validAccounts.splice(i, 1);
                    } else {
                        i++;
                    }
                }
                resolve(validAccounts);
            });
        });
    }

    const showAccounts = (newAccounts: {[key: string]: string}[]) => {
        if (newAccounts.length === 0) {
            setNavPanel(false);
        }
        const accountsCopy: JSX.Element[] = [];
        for (let i = 0; i < newAccounts.length; i++) {
            const account = newAccounts[i];
            accountsCopy.push(<Account key={i} access_token={account['access_token']} canvas_url={account['canvas_url']} index={i} handleDelete={showAccounts}></Account>);
        }
        setAccounts(accountsCopy);
    }

    useEffect(() => {
        // Check account validity
        checkAccountsValidity()
        .then((validAccounts) => {
            // Show valid accounts
            showAccounts(validAccounts);
            setLoading(false);
        });
    }, []);

    const toggleHelp = () => {
        setHelp(!help);
    }

    const validateInput = (canvas_url: string, access_token: string) => {
        return new Promise<number>((resolve, reject) => {
            chrome.storage.sync.get(['accounts'], async (items) => {
                if (!items['accounts'] || items['accounts'].length === 0) {
                    resolve(Validity.OK);
                    return;
                }
                for (const account of items['accounts']) {
                    if (account['canvas_url'] === canvas_url && account['access_token'] === access_token) {
                        resolve(Validity.ALREADY_EXISTS);
                        return;
                    }
                }
                const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://${canvas_url}/api/v1/users/self?access_token=${access_token}`)}`);
                resolve(response.status);
            });
        });
    }

    const handleSave = () => {
        const accessTokenInput = document.getElementById("accessToken") as HTMLInputElement;
        const canvasURLInput = document.getElementById("canvasURL") as HTMLInputElement;
        if (!/^\d{4}~[A-Za-z0-9]{64}$/.test(accessTokenInput.value)) { // Validate access token
            accessTokenInput.setCustomValidity("Enter a valid access token!");
            accessTokenInput.reportValidity();
            return;
        }
        if (!/^[a-zA-Z0-9.]+$/.test(canvasURLInput.value)) { // Validate canvas URL
            canvasURLInput.setCustomValidity("Enter a valid canvas URL!");
            canvasURLInput.reportValidity();
            return;
        }
        (async () => {
            const status = await validateInput(canvasURLInput.value, accessTokenInput.value);
            if (status === Validity.INVALID_TOKEN) {
                accessTokenInput.setCustomValidity("This access token does not exist!");
                accessTokenInput.reportValidity();
            } else if (status === Validity.INVALID_URL) {
                canvasURLInput.setCustomValidity("This canvas URL does not exist!");
                canvasURLInput.reportValidity();
            } else if (status === Validity.ALREADY_EXISTS) {
                accessTokenInput.setCustomValidity("This account is already in the system!");
                accessTokenInput.reportValidity();
            } else {
                chrome.storage.sync.get(['accounts'], async items => {
                    let accounts: {}[] = items['accounts'];
                    if (!accounts || accounts.length === 0) {
                        accounts = [];
                    }
                    accounts.push({
                        'access_token': accessTokenInput.value,
                        'canvas_url': canvasURLInput.value
                    });
                    chrome.storage.sync.set({'accounts': accounts}, () => {
                        showAccounts(accounts);
                        setNavPanel(true);
                        // Clear input
                        accessTokenInput.value = "";
                        canvasURLInput.value = "";
                    });
                });
            }
        })();
    }

    return (
        <div className="Settings">
            <div className="container">
                <h1 className="settingsHeader">Settings</h1>
                <p className="helpLine" onClick={toggleHelp}>How do I get this information?</p>
                {help &&
                    <div className="help">
                        <ol className="helpSteps">
                            <li className="helpStep">In Canvas, click the "profile" link in the top right menu bar, or navigate to <code className="url">/profile</code>. Then, click on Settings, or navigate to <code className="url">/profile/settings</code>.</li>
                            <li className="helpStep">Under the "Approved Integrations" section, click the button to generate a new access token. You can set anything for the purpose field, but <strong>leave the expires field blank</strong></li>
                            <li className="helpStep">Once the token is generated, enter it into the "Access Token" input field below. Enter the domain name of Canvas in the "Canvas URL" input field below.</li>
                        </ol>
                    </div>
                }
                {loading && <Loading size={20}/>}
                <div className="accounts">
                    {!help && accounts}
                </div>
                <div className="inputContainer">
                    <label htmlFor="accessToken">Access Token:</label>
                    <input
                        type="text"
                        id="accessToken"
                        placeholder="1234~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ab"
                        autoComplete="off"
                    />
                </div>
                <div className="inputContainer">
                    <label htmlFor="canvasURL">Canvas URL:</label>
                    <input
                        type="text"
                        id="canvasURL"
                        placeholder="scps.instructure.com"
                        autoComplete="off"
                    />
                </div>
                <button className="save" onClick={handleSave}>Save</button>
            </div>
            {navPanel && <Navigation currentPage="settings"/>}
        </div>
    );
}

export default Settings;
