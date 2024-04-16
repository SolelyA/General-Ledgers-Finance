import React, { useState } from 'react';
import { doc, addDoc } from "firebase/firestore";
import { db } from '../firebase';

export default async function AddToErrorDB(err) {
    const [error, setError] = useState('');
    try{
        const errorMessageDoc = doc(db,"errors");

    await addDoc(errorMessageDoc,{
        errors: err,
        timestamp: new Date().toISOString().split('T')[0],
    })
    }catch(error){
        console.log('Error adding an error to database')
    }
}
