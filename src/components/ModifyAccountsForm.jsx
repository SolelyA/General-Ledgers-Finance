import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from '../firebase';
import '../components/adminPage.css';
import './ModifyAccountsForm.css'

function ModifyAccountsForm() {
    const acctsCol = collection(db, "accts");
    const [selectedItems, setSelectedItems] = useState([]);
    const [allAccts, setAllAccts] = useState([]);
    const [modifiedAccounts, setModifiedAccounts] = useState({});
    const [error, setError] = useState('');

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
                } else {
                    newBal = parsedInitBalance + parsedDebit - parsedCredit;
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

    const handleCheckboxChange = (event, accountId) => {
        const { checked } = event.target;
        if (checked) {
            setSelectedItems(prevSelectedItems => [...prevSelectedItems, accountId]);
        } else {
            setSelectedItems(prevSelectedItems => prevSelectedItems.filter(item => item !== accountId));
        }
    };

    const handleInputChange = (event, accountId) => {
        const { name, value } = event.target;
        let parsedValue = value;
        if (name === 'initBalance' || name === 'debit' || name === 'credit') {
            const floatValue = parseFloat(value);
            if (!isNaN(floatValue)) {
                parsedValue = floatValue.toFixed(2);
            }
        }

        setModifiedAccounts(prevModifiedAccounts => ({
            ...prevModifiedAccounts,
            [accountId]: {
                ...prevModifiedAccounts[accountId],
                [name]: parsedValue
            }
        }));
    };


    const handleSaveChanges = async () => {
        try {
            await Promise.all(selectedItems.map(async (accountId) => {
                const modifiedAccount = modifiedAccounts[accountId];
                if (modifiedAccount) {
                    const acctsDoc = doc(db, "accts", accountId);
                    await updateDoc(acctsDoc, modifiedAccount);
                    console.log(`Successfully updated account with ID: ${accountId}`);

                    if (modifiedAccount.credit !== undefined && modifiedAccount.debit !== undefined) {
                        const creditTransactionData = {
                            type: 'credit',
                            value: modifiedAccount.credit,
                            date: new Date().toISOString(),
                            desc: 'Credit update'
                        }

                        const debitTransactionData = {
                            type: 'debit',
                            value: modifiedAccount.debit,
                            date: new Date().toISOString(),
                            desc: 'Debit update'
                        }

                        const transactionsCollectionRef = collection(acctsDoc, 'transactions');
                        await addDoc(transactionsCollectionRef, creditTransactionData);
                        console.log(`Credit transaction added for account with ID: ${accountId}`);
                        await addDoc(transactionsCollectionRef, debitTransactionData);
                        console.log(`Debit transaction added for account with ID: ${accountId}`);
                    }
                    else if (modifiedAccount.credit === undefined && modifiedAccount.debit !== undefined){
                        const debitTransactionData = {
                            type: 'debit',
                            value: modifiedAccount.debit,
                            date: new Date().toISOString(),
                            desc: 'Debit update'
                        }

                        const transactionsCollectionRef = collection(acctsDoc, 'transactions');
                        await addDoc(transactionsCollectionRef, debitTransactionData);
                        console.log(`Debit transaction added for account with ID: ${accountId}`);

                    }
                    else if(modifiedAccount.credit !== undefined && modifiedAccount.debit === undefined){
                        const creditTransactionData = {
                            type: 'credit',
                            value: modifiedAccount.credit,
                            date: new Date().toISOString(),
                            desc: 'Credit update'
                        }

                        const transactionsCollectionRef = collection(acctsDoc, 'transactions');
                        await addDoc(transactionsCollectionRef, creditTransactionData);
                        console.log(`Credit transaction added for account with ID: ${accountId}`);
                    }
                }
            }));
            await fetchAllAccts();
            setSelectedItems([]);
            setModifiedAccounts({});

        } catch (error) {
            console.error('Error updating account:', error);
            setError('An error occurred while updating account. Please try again later.');
        }
    };

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

                await allAcctsData.forEach(account => {
                    calculateBalance(account.acctNumber);
                });
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.error("Error fetching account state", error);
        }
    }

    return (
        <div>

            <div className={"login-header"}>
                <div className={"login-title"}>Modify Accounts</div>
                <div className={"mod-underline"}></div>
            </div>

            <div className={"admin-container"}>

                <div className={"admin-subheader"}>
                    <div className={"admin-subtitle"}>Edit Accounts</div>
                    <div className={"mod-subUnderline"}></div>
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

                                {selectedItems.includes(account.id) && (
                                    <div>
                                        <div className={"modAcc-inputs"}>
                                            <input
                                                type="number"
                                                name="acctNumber"
                                                placeholder="New Account Number"
                                                value={modifiedAccounts[account.id]?.acctNumber || ''}
                                                onChange={(event) => handleInputChange(event, account.id)}
                                            />
                                        </div>

                                        <div className={"modAcc-inputs"}>
                                            <input
                                                type="text"
                                                name="acctName"
                                                placeholder="New Account Name"
                                                value={modifiedAccounts[account.id]?.acctName || ''}
                                                onChange={(event) => handleInputChange(event, account.id)}
                                            />
                                        </div>

                                        <div className={"modAcc-select"}>
                                            <select
                                                name="acctCategory"
                                                value={modifiedAccounts[account.id]?.acctCategory || ''}
                                                onChange={(event) => handleInputChange(event, account.id)}
                                            >
                                                <option value="">Select Account Category</option>
                                                <option value="asset">Asset</option>
                                                <option value="liability">Liability</option>
                                                <option value="equity">Equity</option>
                                                <option value="revenue">Revenue</option>
                                                <option value="expense">Expense</option>
                                            </select>
                                        </div>

                                        <div className={"modAcc-inputs"}>
                                            <input
                                                type="text"
                                                name="acctSubCategory"
                                                placeholder="New Account Sub-Category"
                                                value={modifiedAccounts[account.id]?.acctSubCategory || ''}
                                                onChange={(event) => {
                                                    const newValue = parseFloat(event.target.value).toFixed(2);
                                                    handleInputChange(event, account.id, newValue);
                                                }}
                                            />
                                        </div>

                                        <div className={"modAcc-inputs"}>
                                            <input
                                                type="text"
                                                name="acctDesc"
                                                placeholder="New Account Description"
                                                value={modifiedAccounts[account.id]?.acctDesc || ''}
                                                onChange={(event) => handleInputChange(event, account.id)}
                                            />
                                        </div>

                                        <div className={"modAcc-inputs"}>
                                            <input
                                                type="number"
                                                name="credit"
                                                placeholder="New Account Credits"
                                                value={modifiedAccounts[account.id]?.credit || ''}
                                                onChange={(event) => {
                                                    const newValue = parseFloat(event.target.value).toFixed(2);
                                                    handleInputChange(event, account.id, newValue);
                                                }}
                                            />
                                        </div>

                                        <div className={"modAcc-inputs"}>
                                            <input
                                                type="number"
                                                name="debit"
                                                placeholder="New Account Debits"
                                                value={modifiedAccounts[account.id]?.debit || ''}
                                                onChange={(event) => {
                                                    const newValue = parseFloat(event.target.value).toFixed(2);
                                                    handleInputChange(event, account.id, newValue);
                                                }}
                                            />
                                        </div>

                                        <div className={"modAcc-inputs"}>
                                            <input
                                                type="number"
                                                name="initBalance"
                                                placeholder="New Account Inital Balance"
                                                value={modifiedAccounts[account.id]?.initBalance || ''}
                                                onChange={(event) => {
                                                    const newValue = parseFloat(event.target.value).toFixed(2);
                                                    handleInputChange(event, account.id, newValue);
                                                }}
                                            />
                                        </div>

                                        <div className={"modAcc-inputs"}>
                                            <input
                                                type="number"
                                                name="order"
                                                placeholder="New Account Order"
                                                value={modifiedAccounts[account.id]?.order || ''}
                                                onChange={(event) => handleInputChange(event, account.id)}
                                            />
                                        </div>

                                        <div className={"modAcc-select"}>
                                            <select
                                                name="normalSide"
                                                value={modifiedAccounts[account.id]?.normalSide || ''}
                                                onChange={(event) => handleInputChange(event, account.id)}
                                            >
                                                <option value="">Select Normal Side</option>
                                                <option value="debit">Debit</option>
                                                <option value="credit">Credit</option>
                                            </select>
                                        </div>


                                        <div className={"modAcc-inputs"}>
                                            <input
                                                type="text"
                                                name="comment"
                                                placeholder="New Account Comments"
                                                value={modifiedAccounts[account.id]?.comment || ''}
                                                onChange={(event) => handleInputChange(event, account.id)}
                                            />
                                        </div>

                                        <div className={"modAcc-select"}>
                                            <select
                                                name="statement"
                                                value={modifiedAccounts[account.id]?.statement || ''}
                                                onChange={(event) => handleInputChange(event, account.id)}
                                            >
                                                <option value="">Select Statement</option>
                                                <option value="IS">Income Statement</option>
                                                <option value="BS">Balance Sheet</option>
                                                <option value="RE">Retired Earnings Statement</option>
                                            </select>
                                        </div>

                                        <button className={"save"} onClick={handleSaveChanges}>Save Changes</button>
                                        {error && <div>{error}</div>}

                                    </div>
                                )}

                            </tr>

                        )
                    })}

                </table>
            </div>


        </div>
    );
}

export default ModifyAccountsForm;
