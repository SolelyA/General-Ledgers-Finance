import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from '../firebase';


const ViewAccounts = () => {
    const acctsCol = collection(db, "accts");
    const [allAccts, setAllAccts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

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

            <div className="accounts-list">
                <h2>Accounts List</h2>
                <div>
                    <button onClick={goToPreviousAccount}>Previous</button>
                    <button onClick={goToNextAccount}>Next</button>
                </div>
                <ul>
                    <li>
                        {currentAccount && (
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
                                    Account Comment: ${currentAccount.comment}`
                                }
                            </label>
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
