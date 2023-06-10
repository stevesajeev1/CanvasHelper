import React, { useState, useEffect } from 'react';
import './stylesheets/Settings.css';

function Settings({ showApp, access_token, canvas_url }: { showApp: () => void, access_token: string, canvas_url: string}) {
    // State for showing/hiding help div
    const [help, setHelp] = useState(false);

    useEffect(() => {
        // Set existing values of access token and canvas URL after page load
        const accessTokenInput = document.getElementById("accessToken") as HTMLInputElement;
        const canvasURLInput = document.getElementById("canvasURL") as HTMLInputElement;
        accessTokenInput.value = access_token;
        canvasURLInput.value = canvas_url;
    });

    const toggleHelp = () => {
        setHelp(!help);
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
        chrome.storage.sync.set({'access_token': accessTokenInput.value, 'canvas_url': canvasURLInput.value});
        showApp();
    }

    return (
        <div className="Settings">
            <h1 className="settingsHeader">Settings</h1>
            <p className="helpLine" onClick={toggleHelp}>How do I get this information?</p>
            {help ? 
                <div className="help">
                    <ol className="helpSteps">
                        <li className="helpStep">In Canvas, click the "profile" link in the top right menu bar, or navigate to <code className="url">/profile</code>. Then, click on Settings, or navigate to <code className="url">/profile/settings</code>.</li>
                        <li className="helpStep">Under the "Approved Integrations" section, click the button to generate a new access token. You can set anything for the purpose field, but <strong>leave the expires field blank</strong></li>
                        <li className="helpStep">Once the token is generated, enter it into the "Access Token" input field below. Enter the domain name of Canvas in the "Canvas URL" input field below.</li>
                    </ol>
                </div>
            : null}
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
