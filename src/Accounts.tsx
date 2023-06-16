import './stylesheets/shared.css';
import './stylesheets/Accounts.css';
import deleteIcon from './assets/delete.svg';

function Accounts({ accounts, deleteAccount }: { accounts: { [key: string]: string }[], deleteAccount: (index: number) => void }) {
    const handleDelete = (index: number) => {
        deleteAccount(index);
    }

    return (
        <>
            {accounts.map((account, index) => {
                return (
                    <div key={index} className="account">
                        <p><strong>canvas url: </strong>{account['canvas_url']}</p>
                        <p><strong>access token: </strong>{account['access_token']}</p>
                        <div className="border"></div>
                        <img src={deleteIcon} className="delete" alt="delete" onClick={() => handleDelete(index)}></img>
                    </div>
                );
            })}
        </>
    );
}

export default Accounts;