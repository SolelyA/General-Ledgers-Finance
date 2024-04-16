import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { getUserData } from './firestoreUtils'
import AddLedgerEntry from './AddLedgerEntry';
import Popup from './HelpButton/Popup';
import './HelpButton/Popup.css'
import './JournalEntry.css';

function ViewJournalEntries() {
    const [buttonPopup, setButtonPopup] = useState(false);
    const [error, setError] = useState('');
    const [allJournalData, setAllJournalData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [userData, setUserData] = useState('');
    const [jEntryId, setJEntryId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const userDataString = localStorage.getItem("userData");
            if (userDataString) {
                const userEmail = JSON.parse(userDataString);
                const userData = await getUserData(userEmail);
                setUserData(userData);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchAllJournalEntries = async () => {
            try {
                const allEntries = [];

                const acctsCollectionRef = collection(db, "accts");
                const acctsSnapshot = await getDocs(acctsCollectionRef);

                for (const docRef of acctsSnapshot.docs) {
                    const journalEntriesCollectionRef = collection(docRef.ref, 'journalEntries');
                    const journalEntriesSnapshot = await getDocs(journalEntriesCollectionRef);

                    journalEntriesSnapshot.forEach(doc => {
                        const journalData = doc.data();
                        const docId = doc.id;
                        const status = doc.data().journalEntryStatus;
                        const acct = doc.data().account;

                        for (const key in journalData) {
                            if (Array.isArray(journalData[key])) {
                                // Add docId to each entry within the array
                                const modifiedArray = journalData[key].map(entry => ({ ...entry, docId }));
                                allEntries.push({ entries: modifiedArray, status: status, accountId: acct }); // Push an object containing modified array and status
                            }
                        }
                    });
                }

                setAllJournalData(allEntries);
            } catch (error) {
                console.error('Error fetching journal entries:', error);
                setError('Error fetching journal entries. Please try again later.');
            }
        };

        fetchAllJournalEntries();
    }, []);

    const handleButtonClick = () => {
        setButtonPopup(true);
        setCurrentPage(0); // Resetting current page when the button is clicked
    };

    const handleNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage(prevPage => prevPage - 1);
    };

    const updateStatusToApproved = async (index) => {
        try {
            const journalEntry = allJournalData[currentPage].entries[index];
            const docId = journalEntry.docId;
            

            const journalEntriesCollectionRef = collection(db, 'accts', journalEntry.account, 'journalEntries');


            const journalEntryRef = doc(journalEntriesCollectionRef, docId);

            await updateDoc(journalEntryRef, {
                journalEntryStatus: 'Approved'
            });

            const updatedJournalData = [...allJournalData];
            updatedJournalData[currentPage].entries[index].journalEntryStatus = 'Approved';
            setAllJournalData(updatedJournalData);

            await AddLedgerEntry(
                journalEntry.account,
                journalEntry.credits,
                journalEntry.debits,
                journalEntry.creditParticulars,
                journalEntry.debitParticulars,
                journalEntry.docId
            );
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };


    const updateStatusToRejected = async (index) => {
        try {
            const journalEntry = allJournalData[currentPage].entries[index];
            const docId = journalEntry.docId;
            const journalEntryRef = doc(db, 'accts', journalEntry.account, 'journalEntries', docId);

            await updateDoc(journalEntryRef, {
                journalEntryStatus: 'Rejected'
            });

            const updatedJournalData = [...allJournalData];
            updatedJournalData[currentPage].entries[index].journalEntryStatus = 'Rejected';
            setAllJournalData(updatedJournalData);

        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <>
            <button className={"view-journal-btn"} onClick={handleButtonClick} title='View All Journal Entries'>
                View All Journal Entries
            </button>
            <div>
                {userData && (userData.selectedUserType === 'Accountant' || userData.selectedUserType === 'Admin' || userData.selectedUserType === 'Manager') ? (
                    <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                        {allJournalData.length > 0 && (
                            <>
                                <table className='journal-table'>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Debit Particulars</th>
                                            <th>Debits</th>
                                            <th>Credit Particulars</th>
                                            <th>Credits</th>
                                            <th>Status</th>
                                            {(userData.selectedUserType === 'Admin' || userData.selectedUserType === 'Manager') && (
                                                <th>Action</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allJournalData[currentPage].entries.map((entry, index) => (
                                            <tr key={index}>
                                                <td>{entry.date}</td>
                                                <td>{entry.debitParticulars}</td>
                                                <td>{entry.debits}</td>
                                                <td>{entry.creditParticulars}</td>
                                                <td>{entry.credits}</td>
                                                <td>{allJournalData[currentPage].status}</td>
                                                {(userData.selectedUserType === 'Admin' || userData.selectedUserType === 'Manager') && (
                                                    <td >
                                                        {allJournalData[currentPage].status === 'Pending' && (
                                                            <>
                                                                <button className={"journal-btn"} onClick={() => updateStatusToApproved(index)}>Approve</button>
                                                                <button className={"journal-btn"} onClick={() => updateStatusToRejected(index)}>Reject</button>
                                                            </>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className={"button-container"}>
                                    {currentPage > 0 && (
                                        <button onClick={handlePrevPage}>Previous</button>
                                    )}
                                    {currentPage < allJournalData.length - 1 && (
                                        <button onClick={handleNextPage}>Next</button>
                                    )}
                                </div>
                            </>
                        )}
                    </Popup>
                ) : (
                    <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                    </Popup>
                )}
            </div>
        </>
    );
}

export default ViewJournalEntries;
