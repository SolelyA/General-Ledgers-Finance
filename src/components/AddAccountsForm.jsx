import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import '../components/adminPage.css';

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

    const getUserEmail = async () => {
        try {
            const userDocRef = doc(db, "users", userId);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                return userDocSnapshot.data().email;
            } else {
                console.log("User document does not exist");
                return '';
            }
        } catch (error) {
            console.error("Error fetching user email:", error);
            return '';
        }
    };

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
            const userEmail = await getUserEmail();

            const nameQuerySnapshot = await getDocs(query(collection(db, "accts"), where("acctName", "==", acctName)));
            const numQuerySnapshot = await getDocs(query(collection(db, "accts"), where("acctNumber", "==", generatedNum)));

            if (!nameQuerySnapshot.empty) {
                setError('Error: Account Name already exists. Try using a different name.');
            } else if (!numQuerySnapshot.empty) {
                setError('Error: Account Number already exists. Try using a different order.');
            } else {
                await addDoc(collection(db, "accts"), {
                    acctName,
                    acctCategory,
                    acctDesc,
                    acctNumber: generatedNum,
                    acctSubCategory,
                    balance: 0,
                    comment,
                    credit: parseFloat(credit).toFixed(2),
                    dateTimeAdded: new Date().toISOString(),
                    debit: parseFloat(debit).toFixed(2),
                    initBalance: parseFloat(initBalance).toFixed(2),
                    normalSide,
                    order,
                    statement,
                    acctStatus: 'Active',
                    //userID: userEmail
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
            <div className="login-title">
                <h2>Add Accounts</h2>
            </div>
            <div>
                <h2>Account Form</h2>
                {error && <div>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Account Name"
                        value={acctName}
                        onChange={(e) => setAccountName(e.target.value)}
                    />
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
                    <input
                        type="text"
                        placeholder="Sub-Category"
                        value={acctSubCategory}
                        onChange={(e) => setAccountSubCate(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={acctDesc}
                        onChange={(e) => setAccountDesc(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Debits"
                        value={debit}
                        onChange={(e) => setDebit(parseFloat(e.target.value).toFixed(2))}
                    />
                    <input
                        type="number"
                        placeholder="Credits"
                        value={credit}
                        onChange={(e) => setCredit(parseFloat(e.target.value).toFixed(2))}
                    />
                    <input
                        type="number"
                        placeholder="Initial Balance"
                        value={initBalance}
                        onChange={(e) => setInitBalance(parseFloat(e.target.value).toFixed(2))}
                    />
                    <select
                        value={normalSide}
                        onChange={(e) => setNormalSide(e.target.value)}
                    >
                        <option value="">Select Normal Side</option>
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Order"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                    />
                    <select
                        value={statement}
                        onChange={(e) => setStatement(e.target.value)}
                    >
                        <option value="">Select Statement</option>
                        <option value="IS">Income Statement</option>
                        <option value="BS">Balance Sheet</option>
                        <option value="RE">Retired Earnings Statement</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button type="submit">Create New Account</button>
                </form>
            </div>
        </div>
    );
}

export default AddAccountsForm;