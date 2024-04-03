import React, { useState } from 'react';
import Popup from './HelpButton/Popup';
import './HelpButton/Popup.css'; // Import CSS for Popup component
import './JournalEntry.css'; // Import CSS for JournalEntry component

export default function JournalEntry({ accountName }) {
    const [buttonPopup, setButtonPopup] = useState(false);
    const [data, setData] = useState([
        { id: 1, value1: '', value2: '', value3: '', value4: '', value5: '' }
    ]);
    const [nextId, setNextId] = useState(2); 

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

    const handleSubmit = async(e) => {
        e.preventDefault();
    };

    const addRow = () => {
        setData(prevData => {
            return [...prevData, { id: nextId, value1: '', value2: '', value3: '', value4: '', value5: '' }];
        });
        setNextId(prevId => prevId + 1);
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
                                    <td><input type="date" value={row.value1} onChange={e => handleInputChange(row.id, 'value1', e.target.value)} /></td>
                                    <td><input type="text" value={row.value2} onChange={e => handleInputChange(row.id, 'value2', e.target.value)} /></td>
                                    <td><input type="number" value={row.value3} onChange={e => handleInputChange(row.id, 'value3', parseFloat(e.target.value).toFixed(2))} /></td>
                                    <td><input type="text" value={row.value4} onChange={e => handleInputChange(row.id, 'value4', e.target.value)} /></td>
                                    <td><input type="number" value={row.value5} onChange={e => handleInputChange(row.id, 'value5', parseFloat(e.target.value).toFixed(2))} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="button-container">
                        <button onClick={addRow} title='Add another row'>Add Row</button>
                        <button onClick={handleSubmit} title='Submit the information'>Submit</button>
                    </div>
                </div>
            </Popup>
        </>
    );
}
