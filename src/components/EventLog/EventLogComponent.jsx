import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Import database

const EventLogComponent = ({ accountId }) => {
    // State to hold event logs
    const [eventLogs, setEventLogs] = useState([]);
    // State to hold account image URL
    const [accountImage, setAccountImage] = useState('');

    // Effect hook to fetch event logs when accountId changes
    useEffect(() => {
        const fetchEventLogs = async () => {
            try {
                // Reference to the 'eventLogs' collection in Firestore
                const eventLogCollectionRef = collection(db, 'eventLogs');
                // Get all documents from the 'eventLogs' collection
                const eventLogSnapshot = await getDocs(eventLogCollectionRef);
                // Map the document data to an array of event logs
                const logs = eventLogSnapshot.docs.map(doc => doc.data());
                // Update the eventLogs state with the fetched logs
                setEventLogs(logs);
            } catch (error) {
                console.error('Error fetching event logs:', error);
            }
        };

        // Call the fetchEventLogs function when the component mounts or when accountId changes
        fetchEventLogs();
    }, [accountId]);

    // Effect hook to fetch the account image when accountId changes
    useEffect(() => {
        const fetchAccountImage = async () => {
            try {
                // Check if accountId is valid
                if (!accountId) return;
                // Reference to the document in the 'accounts' collection with the provided accountId
                const accountDoc = await db.collection('accounts').doc(accountId).get();
                // Check if the account document exists
                if (accountDoc.exists) {
                    // Get the account data from the document
                    const accountData = accountDoc.data();
                    // Check if the account has an image URL
                    if (accountData.imageUrl) {
                        // Update the accountImage state with the fetched image URL
                        setAccountImage(accountData.imageUrl);
                    }
                }
            } catch (error) {
                console.error('Error fetching account image:', error);
            }
        };

        // Call the fetchAccountImage function when the component mounts or when accountId changes
        fetchAccountImage();
    }, [accountId]);

    // Render the component UI
    return (
        <div>
            {/* Display the account image if available */}
            {accountImage && <img src={accountImage} alt="Account" />}
            {/* Display the list of event logs */}
            <ul>
                {eventLogs.map((log, index) => (
                    <li key={index}>
                        {/* Display event log details */}
                        <p>Timestamp: {log.timestamp}</p>
                        <p>Event Type: {log.eventType}</p>
                        <p>User ID: {log.userId}</p>
                        <p>Before Image:</p>
                        <pre>{JSON.stringify(log.beforeImage, null, 2)}</pre>
                        <p>After Image:</p>
                        <pre>{JSON.stringify(log.afterImage, null, 2)}</pre>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventLogComponent;
