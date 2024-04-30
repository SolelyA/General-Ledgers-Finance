import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, addDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import { getUserData } from './firestoreUtils'
import '../components/adminPage.css';
import './AddAccountsForm.css'

function AddAccountsForm() {
    const [acctName, setAccountName] = useState('');
    const [acctCategory, setAccountCategory] = useState('');
    const [acctSubCategory, setAccountSubCate] = useState('');
    const [acctDesc, setAccountDesc] = useState('');
    const [initBalance, setInitBalance] = useState('');
    const [debit, setDebit] = useState('');
    const [credit, setCredit] = useState('');
    const [normalSide, setNormalSide] = useState('');
    const [order, setOrder] = useState('');
    const [statement, setStatement] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const userId = 'KhpL6woPSEB0zyq6e0b0'; //auth.currentUser.uid

    useEffect(() => {
    }, []);

    const [userData, setUserData] = useState('')
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

    const generateAccountNum = (category, order) => {
        const leadNum = {
            asset: 1,
            liability: 2,
            equity: 3,
            revenue: 4,
            expense: 5
        }[category.toLowerCase()];

        return `${leadNum}${order.toString().substring(0, 3).padStart(3, "0")}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const generatedNum = generateAccountNum(acctCategory, order);

            const nameQuerySnapshot = await getDocs(query(collection(db, "accts"), where("acctName", "==", acctName.toLowerCase())));
            const numQuerySnapshot = await getDocs(query(collection(db, "accts"), where("acctNumber", "==", generatedNum.toLowerCase())));
            
            if (!nameQuerySnapshot.empty) {
                setError('Error: Account Name already exists. Try using a different name.');
            } else if (!numQuerySnapshot.empty) {
                setError('Error: Account Number already exists. Try using a different order.');
            } else {
               const accountRef = await addDoc(collection(db, "accts"), {
                    acctName,
                    acctCategory,
                    acctDesc,
                    acctNumber: generatedNum,
                    acctSubCategory,
                    balance: 0,
                    comment,
                    credit: parseFloat(credit).toFixed(2),
                    dateTimeAdded: new Date().toISOString().split('T')[0],
                    debit: parseFloat(debit).toFixed(2),
                    initBalance: parseFloat(initBalance).toFixed(2),
                    normalSide,
                    order,
                    statement,
                    acctStatus: 'Active',
                    userID: userData.email
                });

                await addDoc(collection(accountRef, 'transactions'), {
                    type: 'credit',
                    value: parseFloat(credit).toFixed(2),
                    date: new Date().toISOString().split('T')[0],
                    desc: 'Initial commit'
                });

                await addDoc(collection(accountRef, 'transactions'), {
                    type: 'debit',
                    value: parseFloat(debit).toFixed(2),
                    date: new Date().toISOString().split('T')[0],
                    desc: 'Initial commit'
                });

                console.log('Account added successfully');
                setError('');
                clearFormFields();
            }
        } catch (error) {
            console.error('Error occurred while adding account:', error);
            setError('An error occurred during account addition. Please try again later.');
        }
    };

    const clearFormFields = () => {
        setAccountName('');
        setAccountCategory('');
        setAccountSubCate('');
        setAccountDesc('');
        setInitBalance('');
        setDebit('');
        setCredit('');
        setNormalSide('');
        setOrder('');
        setStatement('');
        setComment('');
    };

    return (
        <div>

            <div className={"login-header"}>
                <div className={"login-title"}>Add Accounts</div>
                <div className={"addAccounts-underline"}></div>
            </div>

            <div className={"signup-box"}>

                <div className={"admin-subheader"}>
                    <div className={"admin-subtitle"}>Account Form</div>
                    <div className={"addAccounts-subUnderline"}></div>
                </div>

                {error && <div>{error}</div>}
                <form onSubmit={handleSubmit}>

                    <div className={"signup-inputs"}>
                        <input
                            type="text"
                            placeholder="Account Name"
                            value={acctName}
                            onChange={(e) => setAccountName(e.target.value)}
                        />
                    </div>

                    <div className={"signup-select"}>
                        <select
                            value={acctCategory}
                            onChange={(e) => setAccountCategory(e.target.value)}
                        >
                            <option value="">Select Account Category</option>
                            <option value="asset">Asset</option>
                            <option value="liability">Liability</option>
                            <option value="equity">Equity</option>
                            <option value="revenue">Revenue</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>

                    <div className={"signup-inputs"}>
                        <input
                            type="text"
                            placeholder="Sub-Category"
                            value={acctSubCategory}
                            onChange={(e) => setAccountSubCate(e.target.value)}
                        />

                    </div>

                    <div className={"signup-inputs"}>
                        <input
                            type="text"
                            placeholder="Description"
                            value={acctDesc}
                            onChange={(e) => setAccountDesc(e.target.value)}
                        />
                    </div>

                    <div className={"signup-inputs"}>
                        <input
                            type="number"
                            placeholder="Debits"
                            value={debit}
                            onChange={(e) => setDebit(parseFloat(e.target.value).toFixed(2))}
                        />
                    </div>

                    <div className={"signup-inputs"}>
                        <input
                            type="number"
                            placeholder="Credits"
                            value={credit}
                            onChange={(e) => setCredit(parseFloat(e.target.value).toFixed(2))}
                        />
                    </div>

                    <div className={"signup-inputs"}>
                        <input
                            type="number"
                            placeholder="Initial Balance"
                            value={initBalance}
                            onChange={(e) => setInitBalance(parseFloat(e.target.value).toFixed(2))}
                        />
                    </div>

                    <div className={"signup-select"}>
                        <select
                            value={normalSide}
                            onChange={(e) => setNormalSide(e.target.value)}
                        >
                            <option value="">Select Normal Side</option>
                            <option value="debit">Debit</option>
                            <option value="credit">Credit</option>
                        </select>
                    </div>

                    <div className={"signup-inputs"}>
                        <input
                            type="number"
                            placeholder="Order"
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                        />
                    </div>

                    <div className={"signup-select"}>
                        <select
                            value={statement}
                            onChange={(e) => setStatement(e.target.value)}
                        >
                            <option value="">Select Statement</option>
                            <option value="IS">Income Statement</option>
                            <option value="BS">Balance Sheet</option>
                            <option value="RE">Retired Earnings Statement</option>
                        </select>
                    </div>

                    <div className={"signup-inputs"}>
                        <input
                            type="text"
                            placeholder="Comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <button className={"addAccount-submit"} type="submit">Create New Account</button>

                </form>
            </div>
        </div>
    );
}

export default AddAccountsForm;
