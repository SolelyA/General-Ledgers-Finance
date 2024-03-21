import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, getDoc, addDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { sendApprovalNotification } from '../emailUtils';
import Logo from '../logo';
import photo from "../components/image.png";
import AddAccountsForm from '../components/AddAccountsForm';
import ModifyAccountsForm from '../components/ModifyAccountsForm';
import DeactivateAccountsForm from '../components/DeactivateAccountsForm';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton';

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
                text="Welcome to the Edit Accounts page. Here you able to add, modify, and deactivate accounts."
            />
            <div>
                <button onClick={() => handleFormChange('add')} title='Add additonal accounts to database'>Add Accounts</button>
                <button onClick={() => handleFormChange('modify')} title='Modify accounts within the database'>Modify Accounts</button>
                <button onClick={() => handleFormChange('deactivate')} title='Deactivate accounts'>Deactivate Accounts</button>

                {activeForm === 'add' && <AddAccountsForm />}
                {activeForm === 'modify' && <ModifyAccountsForm />}
                {activeForm === 'deactivate' && <DeactivateAccountsForm />}
            </div>
        </div>
    );
}

export default EditAccounts;
