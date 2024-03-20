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

function EditAccounts() {
    const [activeForm, setActiveForm] = useState('form1');

    const handleFormChange = (formName) => {
        setActiveForm(formName);
    };

    return (
        <div>
            <button onClick={() => handleFormChange('add')}>Add Accounts</button>
            <button onClick={() => handleFormChange('modify')}>Modify Accounts</button>
            <button onClick={() => handleFormChange('deactivate')}>Deactivate Accounts</button>

            {activeForm === 'add' && <AddAccountsForm />}
            {activeForm === 'modify' && <ModifyAccountsForm />}
            {activeForm === 'deactivate' && <DeactivateAccountsForm />}
        </div>
    );
}

export default EditAccounts;
