import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from '../firebase';



const ViewAccounts = () => {
    const acctsCol = collection(db, "accts");
    const [allAccts, setAllAccts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const[searchAcctName, SetSearchAcctName] = useState("")
    const[searchAcctNum, SetSearchAcctNum] = useState("")



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

    const fetchAllAccts = async () => {
        try {
            const q = query(acctsCol);
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllAccts(allAcctsData);
  
                allAcctsData.forEach(account => {
                    calculateBalance(account.acctNumber);
                });
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.error("Error fetching account state", error)
        }
    }

    const SearchAccountNumber = async (e) => { //Method for searching account by name
        e.preventDefault();
        const q = query(acctsCol);
        const querySnapshot = await getDocs(q);
        const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllAccts(allAcctsData.filter((allAcctsData)=>
            allAcctsData.acctNumber.toLowerCase().includes(searchAcctNum.toLowerCase())
        ))

        try{

        } catch (error) {
            console.error("Error:", error);
        }
    }

    const SearchAccountName = async (e) => { //Method for searching account by name
        e.preventDefault();
        const q = query(acctsCol);
        const querySnapshot = await getDocs(q);
        const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllAccts(allAcctsData.filter((allAcctsData)=>
            allAcctsData.acctName.toLowerCase().includes(searchAcctName.toLowerCase())
        ))

        try{

        } catch (error) {
            console.error("Error:", error);
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
    
                // Convert relevant fields to numbers
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
    
                console.log(parsedInitBalance + parsedDebit + parsedCredit);
                console.log(newBal);
    
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
            <div className={"login-header"}>
                <div className={"login-title"}>Accounts</div>
                <div className={"admin-underline"}></div>
            </div>
            <h1>Search by account name or number</h1>
            <div className="w-full maxw-xl flex mx-auto p-20 text-xl">
                <form onSubmit={(e)=>{SearchAccountName(e)}}>
                <input
                    type="text"
                    className="w-full placeholder-gray-400 text-gray-900 p-4"
                    placeholder="Account Name"
                    onChange={(e)=>{SetSearchAcctName(e.target.value)}}
                    value={searchAcctName}
                />
                <button type="submit">Search</button>
                </form>

                <form onSubmit={(e)=>{SearchAccountNumber(e)}}>
                <input
                    type="text"
                    className="w-full placeholder-gray-400 text-gray-900 p-4"
                    placeholder="Account Number"
                    onChange={(e)=>{SetSearchAcctNum(e.target.value)}}
                    value={searchAcctNum}
                />
                <button type="submit">Search</button>
                </form>
                
            </div>

        

            <div className="accounts-list">
                <h2>Accounts List</h2>
                <div>
                    <button onClick={goToPreviousAccount}>Previous</button>
                    <button onClick={goToNextAccount}>Next</button>
                </div>
                <ul>
                    <li>
                        {currentAccount && (
                            <a href="/ledgerDisplay">
                            <label htmlFor={currentAccount.id}>
                                {
                                    `Account Number: ${currentAccount.acctNumber} | 
                                    Account Name: ${currentAccount.acctName} |
                                    Account Category: ${currentAccount.acctCategory} | 
                                    Account Sub Category: ${currentAccount.acctSubCategory} |
                                    Account Description: ${currentAccount.acctDesc} |
                                    Account Type: ${currentAccount.normalSide} |
                                    Account Initial Balance: $${currentAccount.initBalance} | 
                                    Account Debits: $${currentAccount.debit} |
                                    Account Credits: $${currentAccount.credit} |
                                    Account Balance: $${currentAccount.balance} |
                                    Account Creation: ${currentAccount.dateTimeAdded} |
                                    User's ID: ${currentAccount.userID} |
                                    Account Order: ${currentAccount.order} |
                                    Account Statement: ${currentAccount.statement} |
                                    Account Comment: ${currentAccount.comment}|
                                    Account Ledger (Click to view)`
                                }
                            </label>
                            </a>
                        )}
                    </li>
                </ul>
                <div>
                    <button onClick={goToPreviousAccount}>Previous</button>
                    <button onClick={goToNextAccount}>Next</button>
                </div>
            </div>
  
  
        </div>
    )

}


export default ViewAccounts;
