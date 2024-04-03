import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton/HelpButton';
import '../components/ChartOfAccounts.css'


const Ledger = () => {
    const { accountId } = useParams();
    const [ledgerData, setLedgerData] = useState([]);

    useEffect(() => {
        const fetchLedgerData = async () => {
            try {
                const ledgerCollectionRef = collection(db, `accts/${accountId}/transactions`);
                console.log(accountId)
                const ledgerSnapshot = await getDocs(ledgerCollectionRef);
                const ledgerData = ledgerSnapshot.docs.map(doc => doc.data());
                setLedgerData(ledgerData);
            } catch (error) {
                console.error('Error fetching ledger data:', error);
            }
        };

        fetchLedgerData();
    }, [accountId]);

    return (
        <div>
            <Navbar />
            <HelpButton
                title="Account's Ledger Page"
                welcome="Welcome to the Ledger page!"
                text="Here you able to view the selected account's ledger."
            />
            <h1>Ledger Page</h1>
            <table className={"coa-table"}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {ledgerData.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.date}</td>
                            <td>{entry.type}</td>
                            <td>{entry.value}</td>
                            <td>{entry.desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Ledger;
