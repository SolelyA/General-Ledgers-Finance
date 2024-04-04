import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from '../firebase';
import Popup from './Popup';
import AddToErrorDB from './AddToErrorDB';
import './Popup.css'; 
import './JournalEntry.css'; 

export default function JournalEntry({ accountName, accountId }) {
    const [buttonPopup, setButtonPopup] = useState(false);
    const [data, setData] = useState([
        { id: 1, date: '', debitParticulars: '', debits: 0, creditParticulars: '', credits: 0, journalEntryStatus: 'Pending', account: accountId,}
    ]);
    const [nextId, setNextId] = useState(2);
    const [error, setError] = useState('');
    const [totalDebits, setTotalDebits] = useState(0);
    const [totalCredits, setTotalCredits] = useState(0);
    const [message, setMessage] = useState('');

   

    useEffect(() => {
        const debits = data.reduce((acc, entry) => acc + parseFloat(entry.debits || 0), 0);
        const credits = data.reduce((acc, entry) => acc + parseFloat(entry.credits || 0), 0);
        setTotalDebits(debits);
        setTotalCredits(credits);
    }, [data]); 

    const handleInputChange = (id, fieldName, value) => {
        setData(prevData => {
            return prevData.map(item => {
                if (item.id === id) {
                    return { ...item, [fieldName]: value };
                }
                return item;
            });
        });
    };
    
    const handleClearInput = (id) => {
        setData(prevData => {
            return prevData.map(item => {
                if (item.id === id) {
                    return { ...item, date: '', debitParticulars: '', debits: 0, creditParticulars: '', credits: 0 };
                }
                return item;
            });
        });
    };

    const clearAllInput = () => {
        setData(prevData => {
            return prevData.map( item => {
                return {...item, date:'', debitParticulars:'', debits: 0, creditParticulars: '', credits: 0, }
            });
        });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('')
        if (totalDebits !== totalCredits) {
            setError('Error: Total debits must equal total credits.');
            AddToErrorDB(error);
            return;
        }
        try{
            console.log(`account id:  ${accountId}`)
            const acctsDoc = doc(db, "accts", accountId);
            const jounralEntryCollectionsRef = collection(acctsDoc, 'journalEntries');

            console.log('data: ', data)
            await addDoc(jounralEntryCollectionsRef,{journalEntryStatus: 'Pending', account: accountId, entries: data})
            console.log('Journal entry added successfully')
            setMessage('Success! Jounral Entry added successfully')

            clearAllInput();

        }catch(error){
            console.log('An error occured when trying to add a new journal entry', error)
            setError('An error has occured when trying to create a new journal entry. Try again later.')
            AddToErrorDB(error);
        }
    };

    const addRow = () => {
        setData(prevData => {
            return [...prevData, { id: nextId, date: '', debitParticulars: '', debits: 0, creditParticulars: '', credits: 0,  }];
        });
        setNextId(prevId => prevId + 1);
    };

    const delRow = (idToRemove) => {
        setData(prevData => {
            const updatedData = prevData.filter(row => row.id !== idToRemove);
            return updatedData;
        });
    };
    

    return (
        <>
            <button onClick={() => setButtonPopup(true)} title='Create a new journal entry'>
                {`Create New Journal Entry for ${accountName}`}
            </button>

            <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                <div>
                    <table className="journal-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Debit Particulars</th>
                                <th>Debits</th>
                                <th>Credit Particulars</th>
                                <th>Credits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(row => (
                                <tr key={row.id}>
                                    <td><input type="date" value={row.date} onChange={e => handleInputChange(row.id, 'date', e.target.value)} required /></td>
                                    <td><input type="text" value={row.debitParticulars} onChange={e => handleInputChange(row.id, 'debitParticulars', e.target.value)} /></td>
                                    <td><input type="number" value={row.debits} onChange={e => handleInputChange(row.id, 'debits', parseFloat(e.target.value).toFixed(2))} required /></td>
                                    <td><input type="text" value={row.creditParticulars} onChange={e => handleInputChange(row.id, 'creditParticulars', e.target.value)} /></td>
                                    <td><input type="number" value={row.credits} onChange={e => handleInputChange(row.id, 'credits', parseFloat(e.target.value).toFixed(2))} required /></td>
                                    <td><button onClick={() => handleClearInput(row.id)}>Reset</button></td>
                                    <td><button onClick={() => delRow(row.id)}>Delete Row</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="button-container">
                        <button onClick={addRow} title='Add another row'>Add Row</button>
                        <button onClick={handleSubmit} title='Submit the information'>Submit</button>
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {message && <p style ={{ color: 'green'}}>{message}</p>}
                </div>
            </Popup>
        </>
    );
}
