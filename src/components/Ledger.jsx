import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton/HelpButton';
import Popup from './HelpButton/Popup.jsx';
import './HelpButton/Popup.css'
import '../components/ChartOfAccounts.css'
import './adminPage.css'


const Ledger = () => {
    const { accountId } = useParams();
    const [ledgerData, setLedgerData] = useState([]);
    const [buttonPopup, setButtonPopup] = useState(false);
    const [error, setError] = useState('');
    const [journalData, setJournalData] = useState([]);
    const [docId, setDocId] = useState('');
    const [searchJournalName, SetSearchJournalName] = useState("")
    const [searchJournalDate1, SetSearchJournalDate1] = useState("")
    const [searchJournalDate2, SetSearchJournalDate2] = useState("")
    const [searchJournalAmount, SetSearchJournalAmount] = useState("")
    const [file, setFile] = useState(null);

    //Fetches the ledger data from the database
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

    //Fetches all the journal entries to make them viewable
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

    const handleCheckboxChange = async (e, searchStatus) => {
        e.preventDefault();
    
        if (ledgerData && searchStatus) {
            setLedgerData(ledgerData.filter((ledgerEntry) =>
                ledgerEntry.status && ledgerEntry.status.includes(searchStatus.toLowerCase())
            ));
        } else {
            console.error("handleCheckboxChange: Missing ledgerData or searchStatus");
        }
    };
    
    //From line 92 - 157, these handle the search and filter functions in the ledger page
    const SearchJournalsByName = async (e) => { //Method for searching journal by name
        e.preventDefault();
        if (searchJournalName !== "") {
            setLedgerData(ledgerData.filter((ledgerData) =>
                ledgerData.acctName.includes(searchJournalName.toLowerCase())
            ))
        }
    }
    const SearchJournalsByAmount = async (e) => { //Method for searching entries by name
        e.preventDefault();
        if (searchJournalAmount) {
            setLedgerData(ledgerData.filter((ledgerData) =>
                ledgerData.value.includes(searchJournalAmount.toLowerCase())
            ))
        }
    }

    const FindPostReference = async (e) => { //Method for searching entries by name
        e.preventDefault();
        setLedgerData(ledgerData.filter((ledgerData) =>
            ledgerData.postReference.includes("true")
        ))
    }

    const SearchEntryDate = async (e) => { //Method for searching account by date
        e.preventDefault();
        try {
            if (searchJournalDate1 !== "" || searchJournalDate2 !== "") {

                const datef1 = new Date(searchJournalDate1)
                const datef2 = new Date(searchJournalDate2)
                var data = []

                if (isNaN(datef2.getDate())) //If Date 2 left blank
                {
                    setLedgerData(ledgerData.map((item) => {
                        var compareDate = new Date(item.date)
                        if (compareDate.getUTCDate() >= datef1.getDate()) {
                            data.push(item);
                        }
                    }))
                    setLedgerData(data)
                }
                else if (isNaN(datef1.getDate())) { //If date 1 left blank
                    ledgerData.map((item) => {
                        var compareDate = new Date(item.date)
                        if (compareDate.getUTCDate() <= datef2.getDate()) {
                            data.push(item);
                        }
                    })
                    setLedgerData(data)
                } else {
                    ledgerData.map((item) => { //Both dates have data
                        var compareDate = new Date(item.date)
                        if (compareDate.getUTCDate() >= datef1.getDate() && compareDate.getUTCDate() <= datef2.getDate()) {
                            data.push(item);
                        }
                    })
                    setLedgerData(data)
                }
            }

        } catch (error) {
            console.error('Error fetching ledger data:', error);
        }
    }

    const uploadFile = (event) => { //Uploads file to accounts corresponding "Documents" folder
        if (file === null) {
            alert("Please select a file to upload")
            return
        }
        const fileType = file.name
        const fileExtension = fileType.split('.').pop()
        if (file === null) {
            return
        }
        //else if(allowedExtensions.exec(file.type)){
        else if (fileExtension !== "png" && fileExtension !== "jpg" && fileExtension !== "docx" && fileExtension !== "xlsx" && fileExtension !== "csv" && fileExtension !== "pdf") { //How to reference document types in this scenario
            alert("Please submit a .jpg, .png, PDF, Word, Excel, PDF, or .csv file")
            setFile(null)
            return
        }
        else {
            addDoc(collection(db, `accts/${accountId}/transactions/Documents/source`), {
                filename: file.name
            })
        }

    }

    const handleSubmitFunc = (e) => {
        SearchJournalsByName(e)
        SearchEntryDate(e)
        SearchJournalsByAmount(e)

    }


    // LEDGER CSS IS IN COA CSS FILE AT THE BOTTOM
    return (
        <div>
            <Navbar/>
            <HelpButton
                title="Account's Ledger Page"
                welcome="Welcome to the Ledger page!"
                text="Here you able to view the selected account's ledger."
            />
            <h1>Ledger Page</h1>

            <div className={"tester"}>
                <div >
                    <form className={"coa-inputs"}>
                        <input
                            type="text"
                            placeholder="Account Name"
                            onChange={(e) => {
                                SetSearchJournalName(e.target.value)
                            }}
                            value={searchJournalName}
                        />
                    </form>

                    <form onSubmit={(e) => {
                        SearchEntryDate(e)
                    }} >
                        <div className={"coa-inputs"}>
                            <input
                                type="text"
                                placeholder="Start Date"
                                onChange={(e) => {
                                    SetSearchJournalDate1(e.target.value)
                                }}
                                value={searchJournalDate1}
                            />
                        </div>

                        <div className={"coa-inputs"}>
                            <input
                                type="text"
                                placeholder="End Date"
                                onChange={(e) => {
                                    SetSearchJournalDate2(e.target.value)
                                }}
                                value={searchJournalDate2}
                            />
                        </div>

                    </form>
                    <form onSubmit={(e) => {
                        SearchJournalsByAmount(e)
                    }} className={"coa-inputs"}>
                        <input
                            type="text"
                            placeholder="Amount"
                            onChange={(e) => {
                                SetSearchJournalAmount(e.target.value)
                            }}
                            value={searchJournalAmount}
                        />
                    </form>
                    <button className={"coa-search-btn"} type="submit" onClick={handleSubmitFunc}>Search</button>
                </div>

                <div className="StatusFilter">
                    <div className={"ledger-filter"}>Filter by:</div>

                    <table>
                        <tr className={"ledger-label"}>
                            <td>
                                <input
                                    className={"ledger-checkbox"}
                                    type="checkbox"
                                    onChange={(event) => handleCheckboxChange(event, "Approved")}
                                />
                            </td>
                            <td>
                                <label >
                                    {`Approved`}
                                </label>
                            </td>
                        </tr>

                        <tr className={"ledger-label"}>
                            <td >
                                <input
                                    className={"ledger-checkbox"}
                                    type="checkbox"
                                    onChange={(event) => handleCheckboxChange(event, "rejected")}
                                />
                            </td>
                            <td >
                                <label >
                                    {`Rejected`}
                                </label>
                            </td>
                        </tr>

                        <tr className={"ledger-label"}>
                            <td>
                                <input
                                    className={"ledger-checkbox"}
                                    type="checkbox"
                                    onChange={(event) => handleCheckboxChange(event, "pending")}
                                />
                            </td>
                            <td>
                                <label >
                                    {`Pending Approval`}
                                </label>
                            </td>
                        </tr>
                    </table>
                    <button className={"coa-search-btn"} onClick={FindPostReference}>PR</button>
                </div>
            </div>


            <div className={"admin-container"}>
                <table className={"admin-table"}>
                <thead>
                    <tr className={"headers"}>
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
                            <td className={"coa-table-btn"}>
                                <button className={"coa-viewJournal"}
                                        onClick={() => handleButtonClick(entry.journal, entry.accountID)}
                                        title='View All Journal Entries'>
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


        </div>
    );
};

export default Ledger;
