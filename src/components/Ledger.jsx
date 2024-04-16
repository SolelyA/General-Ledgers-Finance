import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton/HelpButton';
import Popup from './HelpButton/Popup.jsx';
import './HelpButton/Popup.css'
import '../components/ChartOfAccounts.css'


const Ledger = () => {
    const { accountId } = useParams();
    const [ledgerData, setLedgerData] = useState([]);
    const [buttonPopup, setButtonPopup] = useState(false);
    const [error, setError] = useState('');
    const [journalData, setJournalData] = useState([]);
    const [docId, setDocId] = useState('');

    useEffect(() => {
        const fetchLedgerData = async () => {
            try {
                const ledgerCollectionRef = collection(db, `accts/${accountId}/transactions`);
                console.log(accountId)
                const ledgerSnapshot = await getDocs(ledgerCollectionRef);
                const ledgerData = ledgerSnapshot.docs.map(doc => doc.data());
                setLedgerData(ledgerData);
            } catch (error) {
                console.error('Error fetching ledger data:', error);
            }
        };

        fetchLedgerData();
    }, [accountId]);

    const fetchJournalEntry = async (docID, accountID) => {
        try {
            const allEntries = [];

            const journalEntryDocRef = doc(db, "accts", accountID, "journalEntries", docID);
            const journalEntrySnapshot = await getDoc(journalEntryDocRef);

            if (journalEntrySnapshot.exists()) {
                const journalData = journalEntrySnapshot.data();
                const status = journalData.journalEntryStatus;
                const acct = journalData.account;

                for (const key in journalData) {
                    if (Array.isArray(journalData[key])) {
                        const modifiedArray = journalData[key].map(entry => ({ ...entry, docId }));
                        allEntries.push({ entries: modifiedArray, status: status, accountId: acct });
                    }
                }

                setJournalData(allEntries);
            } else {
                setError('Journal entry document does not exist.');
            }
        } catch (error) {
            console.error('Error fetching journal entries:', error);
            setError('Error fetching journal entries. Please try again later.');
        }
    };

    const handleButtonClick = async (docId, accountId) => {
        setButtonPopup(true);
        setJournalData([]);
        await fetchJournalEntry(docId, accountId);
    };



    return (
        <div>
            <Navbar />
            <HelpButton
                title="Account's Ledger Page"
                welcome="Welcome to the Ledger page!"
                text="Here you able to view the selected account's ledger."
            />
            <h1>Ledger Page</h1>
            <table className={"coa-table"}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Description</th>
                        <th>Journal Entry</th>
                    </tr>
                </thead>
                <tbody>
                    {ledgerData.map((entry, index) => (

                        <tr>
                            <td>{entry.date}</td>
                            <td>{entry.type}</td>
                            <td>{entry.value}</td>
                            <td>{entry.desc}</td>
                            <td>
                                <button onClick={() => handleButtonClick(entry.journal, entry.accountID)} title='View All Journal Entries'>
                                    View Journal Entry
                                </button>

                                <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                                    {journalData.length > 0 && (
                                        <div>
                                            <h2>Journal Entry</h2>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Debit Particulars</th>
                                                        <th>Debits</th>
                                                        <th>Credit Particulars</th>
                                                        <th>Credits</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {journalData[0].entries.map((entry, index) => (
                                                        <tr>
                                                            <td>{entry.date}</td>
                                                            <td>{entry.debitParticulars}</td>
                                                            <td>{entry.debits}</td>
                                                            <td>{entry.creditParticulars}</td>
                                                            <td>{entry.credits}</td>
                                                            <td>{journalData[0].status}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Popup>

                            </td>
                        </tr>

                    ))}
                </tbody>

            </table>
        </div>
    );
};

export default Ledger;
