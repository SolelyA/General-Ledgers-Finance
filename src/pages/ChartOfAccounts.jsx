import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton/HelpButton';
import JournalEntry from '../components/JournalEntry';
import ViewJournalEntries from '../components/ViewJournalEntries';
import '../components/ChartOfAccounts.css'
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';
import EventLogButton from '../components/EventLog/EventLogButton.jsx'
import EventLogComponent from '../components/EventLog/EventLogComponent.jsx';
import JournalEntryFilter from '../components/JournalEntryFilter/JournalEntryFilter.jsx';

const ChartOfAccounts = () => {
    // Firebase collection reference for 'accts'
    const acctsCol = collection(db, "accts");
    // State Variables
    const [allAccts, setAllAccts] = useState([]); // Array that holds all of the accounts
    const [currentIndex, setCurrentIndex] = useState(0); // Index of the current account displayed
    const [searchAcctName, SetSearchAcctName] = useState("") // State for searching accounts by name
    const [searchAcctNum, SetSearchAcctNum] = useState("") // State for searching accounts by number
    const [showEventLogs, setShowEventLogs] = useState(false); // State to toggle the visibility of event logs
    const [currentAccount, setCurrentAccount] = useState(null);

    // Function to toggle the visibility of event logs
    const toggleEventLogs = () => {
        setShowEventLogs(!showEventLogs);
      };

    const goToNextAccount = () => {
        setCurrentIndex((prevIndex) => (prevIndex === allAccts.length - 1 ? 0 : prevIndex + 1));
    };

    const goToPreviousAccount = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? allAccts.length - 1 : prevIndex - 1));
    };

    //const currentAccount = allAccts[currentIndex];

    useEffect(() => {
        fetchAllAccts();
        fetchCurrentAccount();
    }, []);

    const SearchAccountNumber = async (e) => {
        e.preventDefault();
        
        try {
            const q = query(acctsCol);
            const querySnapshot = await getDocs(q);
            const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter accounts by account number
            const filteredAccts = allAcctsData.filter(acct =>
                acct.acctNumber.toLowerCase().includes(searchAcctNum.toLowerCase())
            );
    
            await setAllAccts(filteredAccts);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const SearchAccountName = async (e) => { //Method for searching account by name
        e.preventDefault();
        const q = query(acctsCol);
        const querySnapshot = await getDocs(q);
        const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        await setAllAccts(allAcctsData.filter((allAcctsData) =>
            allAcctsData.acctName.toLowerCase().includes(searchAcctName.toLowerCase())
        ))

        try {

        } catch (error) {
            console.error("Error:", error);
        }
    }

    const fetchAllAccts = async () => {
        try {
            const q = query(acctsCol);
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllAccts(allAcctsData);
    
                for (const account of allAcctsData) {
                    await calculateBalance(account.acctNumber);
                }
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.error("Error fetching account state", error)
        }
    }

    const fetchCurrentAccount = async () => {
        try {
            // Determine the current account ID from the currentAccount state variable
            const currentAccountId = currentAccount ? currentAccount.id : null;

            // Fetch the document corresponding to the current account ID from Firestore
            const accountDoc = await db.collection('accounts').doc(currentAccountId).get();

            // Check if the document exists
            if (accountDoc.exists) {
                // Extract the data from the document
                const currentAccountData = accountDoc.data();

                // Set the current account state with the fetched data
                setCurrentAccount(currentAccountData);
            } else {
                // Log a message if no document exists for the current account ID
                console.log('No such document!');
            }
        } catch (error) {
            // Log an error message if there's an error fetching the current account
            console.error('Error fetching current account:', error);
        }
    }

    const calculateBalance = async (accountNum) => {
        try {
            const q = query(acctsCol, where('acctNumber', '==', accountNum));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const acctDoc = querySnapshot.docs[0];
                const { balance, debit, credit, initBalance, normalSide } = acctDoc.data();

                let newBal = 0;

                const parsedInitBalance = parseFloat(initBalance);
                const parsedDebit = parseFloat(debit);
                const parsedCredit = parseFloat(credit);

                if (normalSide === 'credit' || normalSide === 'Credit') {
                    newBal = parsedInitBalance + parsedCredit - parsedDebit;
                    console.log('credit');
                } else {
                    newBal = parsedInitBalance + parsedDebit - parsedCredit;
                    console.log('debit');
                    console.log(newBal)
                }

                await updateDoc(acctDoc.ref, { balance: newBal.toFixed(2) });
                newBal = 0;
            } else {
                console.log('Account not found');
            }
        } catch (error) {
            console.error("Error updating account balance", error);
        }
    };

    return (
        <div>
            <Navbar />

            <HelpButton
                title="View Accounts Page"
                welcome="Welcome to the View Accounts page!"
                text="Here you able to view all active accounts."
            />

            <PopupCalendar /> {/*Render the PopupCalendar component*/}

            <div className={"login-header"}>
                <div className={"login-title"}>Accounts</div>
                <div className={"coa-underline"}></div>
            </div>

            <div className={"adminApproval"}>
                <div className={"admin-subheader"}>
                    <div className={"admin-subtitle"}>Search By Name or Number</div>
                    <div className={"coaSearch-subUnderline"}></div>
                </div>

                <div className="w-full maxw-xl flex mx-auto p-20 text-xl">
                    <form onSubmit={async (e) => { await SearchAccountName(e) }}>
                        <div className={"coa-inputs"}>
                            <input
                                type="text"
                                placeholder="Account Name"
                                onChange={async (e) => {
                                    await SetSearchAcctName(e.target.value)
                                }}
                                value={searchAcctName}
                            />
                        </div>

                        <button type="submit">Search</button>
                    </form>

                    <form onSubmit={async (e) => {
                       await SearchAccountNumber(e)
                    }}>

                        <div className={"coa-inputs"}>
                            <input
                                type="text"
                                className="w-full placeholder-gray-400 text-gray-900 p-4"
                                placeholder="Account Number"
                                onChange={async (e) => {
                                    await SetSearchAcctNum(e.target.value)
                                }}
                                value={searchAcctNum}
                            />
                        </div>

                        <button type="submit">Search</button>
                    </form>

                </div>

                <div className="accounts-list">

                    <div className={"admin-subheader"}>
                        <div className={"admin-subtitle"}>Accounts List</div>
                        <div className={"coa-subUnderline"}></div>
                    </div>

                    <div className={"coa-btns"}>
                        <button className={"prev"} onClick={goToPreviousAccount} title='Go to previous entry'>Previous
                        </button>
                        <button className={"next"} onClick={goToNextAccount} title='Go to next entry'>Next</button>
                    </div>

                    {currentAccount && (

                        <a href={`/ledger/${currentAccount.id}`} className="coa-table-link">
                            <table className={"coa-table"}>

                                <tr>
                                    <td>Account Number:</td>
                                    <td>{`  ${currentAccount.acctNumber}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Name:</td>
                                    <td>{` ${currentAccount.acctName}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Category:</td>
                                    <td>{` ${currentAccount.acctCategory}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Sub Category:</td>
                                    <td>{` ${currentAccount.acctSubCategory}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Description:</td>
                                    <td>{` ${currentAccount.acctDesc}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Type:</td>
                                    <td>{` ${currentAccount.normalSide}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Initial Balance:</td>
                                    <td>{` $${currentAccount.initBalance}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Debits:</td>
                                    <td>{` $${currentAccount.debit}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Credits:</td>
                                    <td>{` $${currentAccount.credit}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Balance:</td>
                                    <td>{`  $${currentAccount.balance}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Creation:</td>
                                    <td>{` ${currentAccount.dateTimeAdded}`}</td>
                                </tr>

                                <tr>
                                    <td>User's ID:</td>
                                    <td>{` ${currentAccount.userID}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Order:</td>
                                    <td>{` ${currentAccount.order}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Statement:</td>
                                    <td>{` ${currentAccount.statement}`}</td>
                                </tr>

                                <tr>
                                    <td>Account Comment:</td>
                                    <td>{` ${currentAccount.comment}`}</td>
                                </tr>

                            </table>
                        </a>
                    )}
                    
                    {currentAccount &&(
                        <div className={"coa-btns"}>
                        <JournalEntry
                        accountName = {currentAccount.acctName}
                        accountId={currentAccount.id}
                         />
                    </div>
                    )}

                    <div className={"coa-btns"}>
                        <button className={"prev"} onClick={goToPreviousAccount} title='Go to previous entry'>Previous</button>
                        <button className={"next"} onClick={goToNextAccount} title='Go to next entry'>Next</button>
                    </div>

                    <div className={'coa-btns'}>
                        <ViewJournalEntries
                        />
                    </div>

                     {/* Render the EventLogButton component and pass the toggleEventLogs function as a prop */}
                     <EventLogButton onClick={toggleEventLogs} />

                     {/* Conditionally render the EventLogComponent based on showEventLogs state */}
                     {showEventLogs && <EventLogComponent />}

                     {/* Render the EventLogComponent and pass the accountId as a prop*/}
                     <EventLogComponent accountId={currentAccount ? currentAccount.id : null} />

                     {currentAccount && (
                       <div className={"coa-btns"}>
                        {/* Pass accountId to EventLogButton */}
                        <EventLogButton accountId={currentAccount.id} onClick={toggleEventLogs} />
                      </div>
                     )}

                </div>
            </div>
        </div>
    )
}

export default ChartOfAccounts;
