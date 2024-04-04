import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase';

const AddLedgerEntry = async (account, credit, debit, creditDesc, debitDesc, journalID) => {
    try {
        const accountRef = doc(db, "accts", account);
        const transactionsCollectionRef = collection(accountRef, 'transactions');
        console.log(accountRef)

        await addDoc(transactionsCollectionRef, {
            type: credit,
            value: parseFloat(credit).toFixed(2),
            date: new Date().toISOString().split('T')[0],
            desc: creditDesc,
            journal: journalID
        });

        await addDoc(transactionsCollectionRef, {
            type: debit,
            value: parseFloat(debit).toFixed(2),
            date: new Date().toISOString().split('T')[0],
            desc: debitDesc,
            journal: journalID
        });

        console.log('Account added successfully');
    } catch (error) {
        console.log(error)
    }

}
export default AddLedgerEntry