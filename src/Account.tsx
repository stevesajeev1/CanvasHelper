import { Dispatch, SetStateAction } from 'react';
import './stylesheets/shared.css';
import './stylesheets/Account.css';
import deleteIcon from './assets/delete.svg';

function Account({ access_token, canvas_url, index, stateChanger }: { access_token: string, canvas_url: string, index: number, stateChanger: Dispatch<SetStateAction<string>> }) {
    const handleDelete = () => {
        chrome.storage.sync.get(['accounts'], items => {
            const accounts = items['accounts'];
            accounts.splice(index, 1);
            chrome.storage.sync.set({'accounts': accounts}, () => {
                stateChanger('redraw');
            });
        });
    }

    return (
        <div className="account">
            <p><strong>canvas url: </strong>{canvas_url}</p>
            <p><strong>access token: </strong>{access_token}</p>
            <div className="border"></div>
            <img src={deleteIcon} className="delete" alt="delete" onClick={handleDelete}></img>
        </div>
    )
}

export default Account;