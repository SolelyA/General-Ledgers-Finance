import { doc, addDoc } from "firebase/firestore";
import { db } from '../firebase';

//a function that adds errors to the database
async function addToErrorDB(err) {
    try {
        const errorMessageDoc = doc(db, "errors");

        await addDoc(errorMessageDoc, {
            errors: err,
            timestamp: new Date().toISOString().split('T')[0],
        });
    } catch (error) {
        console.log('Error adding an error to database', error);
    }
}

export default addToErrorDB;
