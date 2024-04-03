import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton/HelpButton';
import JournalEntry from '../components/JournalEntry';
import '../components/ChartOfAccounts.css'
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';


const ChartOfAccounts = () => {
    const acctsCol = collection(db, "accts");
    const [allAccts, setAllAccts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchAcctName, SetSearchAcctName] = useState("")
    const [searchAcctNum, SetSearchAcctNum] = useState("")


    const goToNextAccount = () => {
        setCurrentIndex((prevIndex) => (prevIndex === allAccts.length - 1 ? 0 : prevIndex + 1));
    };

    const goToPreviousAccount = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? allAccts.length - 1 : prevIndex - 1));
    };

    const currentAccount = allAccts[currentIndex];

    useEffect(() => {
        fetchAllAccts();
    }, []);

    const SearchAccountNumber = async (e) => { //Method for searching account by name
        e.preventDefault();
        const q = query(acctsCol);
        const querySnapshot = await getDocs(q);
        const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllAccts(allAcctsData.filter((allAcctsData) =>
            allAcctsData.acctNumber.toLowerCase().includes(searchAcctNum.toLowerCase())
        ))

        try {

        } catch (error) {
            console.error("Error:", error);
        }
    }

    const SearchAccountName = async (e) => { //Method for searching account by name
        e.preventDefault();
        const q = query(acctsCol);
        const querySnapshot = await getDocs(q);
        const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllAccts(allAcctsData.filter((allAcctsData) =>
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

                await allAcctsData.forEach(account => {
                    calculateBalance(account.acctNumber);
                });
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.error("Error fetching account state", error)
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
                    <form onSubmit={(e) => { SearchAccountName(e) }}>
                        <div className={"coa-inputs"}>
                            <input
                                type="text"
                                placeholder="Account Name"
                                onChange={(e) => {
                                    SetSearchAcctName(e.target.value)
                                }}
                                value={searchAcctName}
                            />
                        </div>

                        <button type="submit">Search</button>
                    </form>

                    <form onSubmit={(e) => {
                        SearchAccountNumber(e)
                    }}>

                        <div className={"coa-inputs"}>
                            <input
                                type="text"
                                className="w-full placeholder-gray-400 text-gray-900 p-4"
                                placeholder="Account Number"
                                onChange={(e) => {
                                    SetSearchAcctNum(e.target.value)
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
                        accountName = {currentAccount.acctName} />
                    </div>
                    )}

                    <div className={"coa-btns"}>
                        <button className={"prev"} onClick={goToPreviousAccount} title='Go to previous entry'>Previous
                        </button>
                        <button className={"next"} onClick={goToNextAccount} title='Go to next entry'>Next</button>
                    </div>

                </div>
            </div>

        </div>
    )

}


export default ChartOfAccounts;
