import { useState, useEffect } from 'react';
import { showApp } from './index'
import './stylesheets/shared.css';
import './stylesheets/Settings.css';
import Account from './Account';
import Loading from './Loading';

function Settings() {
    // State for showing/hiding help div
    const [help, setHelp] = useState(false);

    // State for accounts in system
    const [accounts, setAccounts] = useState<JSX.Element[]>([]);

    // State for loading accounts
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const deleteAccount = (newAccounts: {[key: string]: string}[]) => {
            const accountsCopy: JSX.Element[] = [];
            for (let i = 0; i < newAccounts.length; i++) {
                const account = newAccounts[i];
                accountsCopy.push(<Account key={i} access_token={account['access_token']} canvas_url={account['canvas_url']} index={i} handleDelete={deleteAccount}></Account>);
            }
            setAccounts(accountsCopy);
        }

        // Create existing account elements
        chrome.storage.sync.get(['accounts'], items => {
            if (!items['accounts']) {
                setLoading(false);
                return;
            }
            const accountsCopy: JSX.Element[] = [];
            for (let i = 0; i < items['accounts'].length; i++) {
                const account = items['accounts'][i];
                accountsCopy.push(<Account key={i} access_token={account['access_token']} canvas_url={account['canvas_url']} index={i} handleDelete={deleteAccount}></Account>);
            }
            setAccounts(accountsCopy);
            setLoading(false);
        });
    }, []);

    const toggleHelp = () => {
        setHelp(!help);
    }

    const validateInput = (canvas_url: string, access_token: string) => {
        return new Promise<number>((resolve, reject) => {
            chrome.storage.sync.get(['accounts'], async (items) => {
                if (!items['accounts']) {
                    resolve(0);
                    return;
                }
                for (const account of items['accounts']) {
                    if (account['canvas_url'] === canvas_url && account['access_token'] === access_token) {
                        resolve(-1);
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
        if (!accessTokenInput.value && !canvasURLInput.value && accounts.length !== 0) {
            showApp();
        }
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
            if (status === 401) {
                accessTokenInput.setCustomValidity("This access token does not exist!");
                accessTokenInput.reportValidity();
            } else if (status === 530) {
                canvasURLInput.setCustomValidity("This canvas URL does not exist!");
                canvasURLInput.reportValidity();
            } else if (status === -1) {
                accessTokenInput.setCustomValidity("This account is already in the system!");
                accessTokenInput.reportValidity();
            } else {
                chrome.storage.sync.get(['accounts'], async items => {
                    let accounts: {}[] = items['accounts'];
                    if (!accounts) {
                        accounts = [];
                    }
                    accounts.push({
                        'access_token': accessTokenInput.value,
                        'canvas_url': canvasURLInput.value
                    });
                    chrome.storage.sync.set({'accounts': accounts}, () => {
                        showApp();
                    });
                });
            }
        })();
    }

    return (
        <div className="Settings">
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
                />
            </div>
            <div className="inputContainer">
                <label htmlFor="canvasURL">Canvas URL:</label>
                <input
                    type="text"
                    id="canvasURL"
                    placeholder="scps.instructure.com"
                />
            </div>
            <button className="save" onClick={handleSave}>Save</button>
        </div>
    );
}

export default Settings;
