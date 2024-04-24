import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
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
    const [filteredEntries, setFilteredEntries] = useState([]); // Initialize with an empty array
    const [editIndex, setEditIndex] = useState(-1);
    const [searchQuery, setSearchQuery] = useState('');

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
                                allEntries.push({ entries: modifiedArray, status: status, accountId: acct });
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

    useEffect(() => {
        const filterEntries = () => {
            if (!searchQuery) {
                setFilteredEntries([]);
                return;
            }

            const filtered = allJournalData
                .flatMap(entry => entry.entries)
                .filter(entry =>
                    (entry.debits && entry.debits.toString().includes(searchQuery)) ||
                    (entry.credits && entry.credits.toString().includes(searchQuery)) ||
                    (entry.date && entry.date.includes(searchQuery))
                );
            setFilteredEntries(filtered);
        };

        filterEntries();
    }, [searchQuery, allJournalData]);





    const handleButtonClick = () => {
        setButtonPopup(true);
        setCurrentPage(0);
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

            const acctRef =  doc(db, 'accts', journalEntry.account);

            await updateDoc(acctRef, {
                credit: journalEntry.credits,
                debits: journalEntry.debits,
            });

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
            window.location.reload();
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
                journalEntryStatus: 'Rejected',
                comment: 'Rejected'
            });

            const updatedJournalData = [...allJournalData];
            updatedJournalData[currentPage].entries[index].journalEntryStatus = 'Rejected';
            setAllJournalData(updatedJournalData);
            window.location.reload();

        } catch (error) {
            console.error('Error updating status:', error);
        }
    };


    const handleEditClick = (index) => {
        setEditIndex(index);
    };

    const handleSaveClick = async (index) => {
        setEditIndex(-1);
        try {
            const journalEntry = allJournalData[currentPage].entries[index];
            const docId = journalEntry.docId;
            const journalEntryRef = doc(db, 'accts', journalEntry.account, 'journalEntries', docId);
            console.log(journalEntry.account)

            // Fetch existing document data
            const docSnapshot = await getDoc(journalEntryRef);
            console.log(docSnapshot)
            if (docSnapshot.exists()) {
                const existingData = docSnapshot.data();

                // Update the specific entry within the array
                const updatedEntries = existingData.entries.map((entry, i) => {
                    if (i === index) {
                        // Update the variables within the map
                        return {
                            ...entry,
                            date: journalEntry.date,
                            credits: journalEntry.credits,
                            debits: journalEntry.debits,
                            creditParticulars: journalEntry.creditParticulars,
                            debitParticulars: journalEntry.debitParticulars,
                            adjusted: true
                        };
                    }
                    return entry;
                });

                // Merge the updated entries array with the existing data
                const newData = {
                    ...existingData,
                    entries: updatedEntries,
                };

                // Update the document with the merged data
                await setDoc(journalEntryRef, newData);
                console.log('Save successful');
            } else {
                console.log('Document does not exist');
            }
        } catch (error) {
            console.log(error);
            setError('Unable to adjust the journal entry. Try again later.' + error)
        }

    };

    const handleInputChange = (e, fieldName, index) => {
        const newValue = e.target.value;
        setAllJournalData(prevData => {
            const newData = [...prevData];
            newData[currentPage].entries[index][fieldName] = newValue;
            return newData;
        });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };


    return (
        <>
            <button className={"view-journal-btn"} onClick={handleButtonClick} title='View All Journal Entries'>
                View All Journal Entries
            </button>
            <div>
                {userData && (userData.selectedUserType === 'Accountant' || userData.selectedUserType === 'Admin' || userData.selectedUserType === 'Manager') ? (
                    <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                        <>
                            <input
                                type="text"
                                placeholder="Search by account name, amount, or date"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
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
                                            {(searchQuery ? filteredEntries : allJournalData[currentPage].entries).map((entry, index) => (
                                                <tr key={index}>
                                                    <td>{editIndex === index ? <input type="date" value={entry.date} onChange={(e) => handleInputChange(e, 'date', index)} /> : entry.date}</td>
                                                    <td>{editIndex === index ? <input type="text" value={entry.debitParticulars} onChange={(e) => handleInputChange(e, 'debitParticulars', index)} /> : entry.debitParticulars}</td>
                                                    <td>{editIndex === index ? <input type="number" value={parseFloat(entry.debits).toFixed(2)} onChange={(e) => handleInputChange(e, 'debits', index)} /> : parseFloat(entry.debits).toFixed(2)}</td>
                                                    <td>{editIndex === index ? <input type="text" value={entry.creditParticulars} onChange={(e) => handleInputChange(e, 'creditParticulars', index)} /> : entry.creditParticulars}</td>
                                                    <td>{editIndex === index ? <input type="number" value={parseFloat(entry.credits).toFixed(2)} onChange={(e) => handleInputChange(e, 'credits', index)} /> : parseFloat(entry.credits).toFixed(2)}</td>
                                                    <td>{allJournalData[currentPage].status} Adjusted: {entry.adjusted ? "true" : "false"}
                                                    </td>
                                                    {(userData.selectedUserType === 'Admin' || userData.selectedUserType === 'Manager') && (
                                                        <td>
                                                            {allJournalData[currentPage].status === 'Pending' && (
                                                                <>
                                                                    {editIndex === index ? (
                                                                        <button className={"journal-btn"} onClick={() => handleSaveClick(index)}>Save</button>
                                                                    ) : (
                                                                        <button className={"journal-btn"} onClick={() => handleEditClick(index)}>Edit</button>
                                                                    )}
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
                        </>
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
