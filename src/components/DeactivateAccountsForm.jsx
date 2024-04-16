import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, updateDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import '../components/adminPage.css';
import './DeactivateAccountsForm.css'

function DeactivateAccountsForm() {
    const [selectedItems, setSelectedItems] = useState([]);
    const [allAccts, setAllAccts] = useState([]);
    const acctsCol = collection(db, "accts");

    const handleCheckboxChange = (event, accountId) => {
        const { checked } = event.target;
        setSelectedItems(prevSelectedItems => {
            if (checked) {
                return [...prevSelectedItems, accountId];
            } else {
                return prevSelectedItems.filter(item => item !== accountId);
            }
        });
    };

    const fetchAllAccts = async () => {
        try {
            const q = query(acctsCol);
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const filteredAcctsData = allAcctsData.filter(account => account.balance > 0);
                setAllAccts(filteredAcctsData);
                updateBalances(filteredAcctsData);
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.error("Error fetching account state", error)
        }
    }

    const updateBalances = async (accounts) => {
        try {
            await Promise.all(accounts.map(async (account) => {
                const { id, balance, debit, credit, initBalance, normalSide } = account;
                const acctRef = doc(db, "accts", id);
                let newBal = 0;
                const parsedInitBalance = parseFloat(initBalance);
                const parsedDebit = parseFloat(debit);
                const parsedCredit = parseFloat(credit);
                if (normalSide === 'credit' || normalSide === 'Credit') {
                    newBal = parsedInitBalance + parsedCredit - parsedDebit;
                } else {
                    newBal = parsedInitBalance + parsedDebit - parsedCredit;
                }
                await updateDoc(acctRef, { balance: newBal.toFixed(2) });
            }));
        } catch (error) {
            console.error("Error updating account balance", error);
        }
    };

    const setSelectedAccountsToDeactivatedHandler = async () => {
        try {
            await Promise.all(selectedItems.map(async (accountId) => {
                const acctsCol = doc(db, "accts", accountId);
                await updateDoc(acctsCol, { acctStatus: 'Deactivated' });
                console.log(`Successfully updated account status to "Deactivated" for user with ID: ${accountId}`);
            }));
            await fetchAllAccts();
            setSelectedItems([]);
        } catch (error) {
            console.error('Error updating account status:', error);
        }
    };

    useEffect(() => {
        fetchAllAccts();
    }, []);

    return (
        <div>

            <div className={"login-header"}>
                <div className={"login-title"}>Deactivate Accounts</div>
                <div className={"deactivate-underline"}></div>
            </div>

            <div className={"admin-container"}>

                <div className={"admin-subheader"}>
                    <div className={"admin-subtitle"}>Choose Accounts</div>
                    <div className={"deactivate-subUnderline"}></div>
                </div>

                <table className={"admin-table"}>

                    <tr className={"headers"}>
                        <th>Select</th>
                        <th>Account Name</th>
                        <th>Account Number</th>
                        <th>Account Balance</th>
                        <th>Category</th>
                        <th>Status</th>
                    </tr>

                    {allAccts.map((account, key) => {
                        return (
                            <tr key={account.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        id={account.id}
                                        checked={selectedItems.includes(account.id)}
                                        onChange={(event) => handleCheckboxChange(event, account.id)}
                                    />
                                </td>

                                <td>
                                    <label htmlFor={account.id}>
                                        {`${account.acctName}`}
                                    </label>
                                </td>

                                <td>
                                    <label htmlFor={account.id}>
                                        {`${account.acctNumber}`}
                                    </label>
                                </td>

                                <td>
                                    <label htmlFor={account.id}>
                                        {`$${account.balance}`}
                                    </label>
                                </td>

                                <td>
                                    <label htmlFor={account.id}>
                                        {`${account.acctCategory}`}
                                    </label>
                                </td>

                                <td>
                                    <label htmlFor={account.id}>
                                        {`${account.acctStatus}`}
                                    </label>
                                </td>

                            </tr>

                        )
                    })}

                </table>

                <button className={"deactivate"} onClick={setSelectedAccountsToDeactivatedHandler}>Set Selected Accounts to Deactivated</button>

            </div>

            {/*<ul>*/}
            {/*    {allAccts.map((account) => (*/}
            {/*        <React.Fragment key={account.id}>*/}
            {/*            <li key={account.id}>*/}
            {/*                <input*/}
            {/*                    type="checkbox"*/}
            {/*                    id={account.id}*/}
            {/*                    checked={selectedItems.includes(account.id)}*/}
            {/*                    onChange={(event) => handleCheckboxChange(event, account.id)}*/}
            {/*                />*/}
            {/*                <label htmlFor={account.id}>*/}
            {/*                    {`${account.acctNumber} ${account.acctName} (Balance: $${account.balance}) (Account Category: ${account.acctCategory}) (Account Status: ${account.acctStatus})`}*/}
            {/*                </label>*/}
            {/*            </li>*/}
            {/*            <hr/>*/}
            {/*        </React.Fragment>*/}
            {/*    ))}*/}
            {/*</ul>*/}

        </div>
    );
}

export default DeactivateAccountsForm;
