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
    const [searchStatus, SetSearchStatus] = useState("")
    const [showModal, setShowModal] = useState(false);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(0);

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



    return (
        <div>
            <Navbar />
            <HelpButton
                title="Account's Ledger Page"
                welcome="Welcome to the Ledger page!"
                text="Here you able to view the selected account's ledger."
            />

            <h1>Ledger Page</h1>
            <div className="w-full maxw-xl flex mx-auto p-20 text-xl">
                <form>
                    <input
                        type="text"
                        className="w-full placeholder-gray-400 text-gray-900 p-4"
                        placeholder="Account Name"
                        onChange={(e) => { SetSearchJournalName(e.target.value) }}
                        value={searchJournalName}
                    />
                </form>

                <form onSubmit={(e) => { SearchEntryDate(e) }}>
                    <input
                        type="text"
                        className="w-full placeholder-gray-400 text-gray-900 p-4"
                        placeholder="Start Date"
                        onChange={(e) => { SetSearchJournalDate1(e.target.value) }}
                        value={searchJournalDate1}
                    />
                    <input
                        type="text"
                        className="w-full placeholder-gray-400 text-gray-900 p-4"
                        placeholder="End Date"
                        onChange={(e) => { SetSearchJournalDate2(e.target.value) }}
                        value={searchJournalDate2}
                    />
                </form>
                <form onSubmit={(e) => { SearchJournalsByAmount(e) }}>
                    <input
                        type="text"
                        className="w-full placeholder-gray-400 text-gray-900 p-4"
                        placeholder="Amount"
                        onChange={(e) => { SetSearchJournalAmount(e.target.value) }}
                        value={searchJournalAmount}
                    />
                </form>
                <button type="submit" onClick={handleSubmitFunc}>Search</button>
            </div>

            <h3>Filter by:</h3>
            <div className="StatusFilter">

                <input
                    type="checkbox"
                    onChange={(event) => handleCheckboxChange(event, "Approved")}
                />
                <label>
                    {`Approved`}
                </label>

                <input
                    type="checkbox"
                    onChange={(event) => handleCheckboxChange(event, "rejected")}
                />
                <label>
                    {`Rejected`}
                </label>

                <input
                    type="checkbox"
                    onChange={(event) => handleCheckboxChange(event, "pending")}
                />
                <label>
                    {`Pending Approval`}
                </label>

            </div>

            <button onClick={FindPostReference}>PR</button>

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
                                    <button className={"coa-viewJournal"} onClick={() => handleButtonClick(entry.journal, entry.accountID)}
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
