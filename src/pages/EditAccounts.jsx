import React, { useState } from 'react';
import AddAccountsForm from '../components/AddAccountsForm';
import ModifyAccountsForm from '../components/ModifyAccountsForm';
import DeactivateAccountsForm from '../components/DeactivateAccountsForm';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton/HelpButton';
import './EditAccounts.css'
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';

function EditAccounts() {
    const [activeForm, setActiveForm] = useState('form1');

    const handleFormChange = (formName) => {
        setActiveForm(formName);
    };

    return (
        <div>
            <Navbar />
            <HelpButton
                title="Edit Accounts Page"
                welcome="Welcome to the Edit Accounts page!"
                text="Here you able to add, modify, and deactivate accounts."
            />
            <PopupCalendar /> {/*Render the PopupCalendar component*/}
            <div >
                <div className={"edit-btns"}>
                    <button onClick={() => handleFormChange('add')}
                            title='Add additonal accounts to database'>Add Accounts
                    </button>
                    <button onClick={() => handleFormChange('modify')}
                            title='Modify accounts within the database'>Modify Accounts
                    </button>
                    <button className={"edit-deactivate"} onClick={() => handleFormChange('deactivate')} title='Deactivate accounts'>Deactivate
                        Accounts
                    </button>
                </div>


                {activeForm === 'add' && <AddAccountsForm/>}
                {activeForm === 'modify' && <ModifyAccountsForm/>}
                {activeForm === 'deactivate' && <DeactivateAccountsForm/>}
            </div>
        </div>
    );
}

export default EditAccounts;
