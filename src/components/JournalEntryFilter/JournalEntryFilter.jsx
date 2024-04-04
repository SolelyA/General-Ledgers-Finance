import React, { useState } from 'react';

export default function JournalEntryFilter({ entries, onUpdateFilteredEntries }) {
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [accountName, setAccountName] = useState('');
    const [amount, setAmount] = useState('');

    const handleFilter = () => {
        const filteredEntries = entries.filter(entry => {
            let statusMatch = true;
            let dateMatch = true;
            let accountMatch = true;
            let amountMatch = true;

            // Filter by status
            if (status) {
                statusMatch = entry.journalEntryStatus === status;
            }

            // Filter by date range
            if (startDate && endDate) {
                dateMatch = entry.date >= startDate && entry.date <= endDate;
            }

            // Filter by account name
            if (accountName) {
                accountMatch = entry.account.toLowerCase().includes(accountName.toLowerCase());
            }

            // Filter by amount
            if (amount) {
                amountMatch = entry.debits === parseFloat(amount) || entry.credits === parseFloat(amount);
            }

            return statusMatch && dateMatch && accountMatch && amountMatch;
        });

        onUpdateFilteredEntries(filteredEntries);
    };

    return (
        <div>
            <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
            </select>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <input type="text" placeholder="Account Name" value={accountName} onChange={e => setAccountName(e.target.value)} />
            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
            <button onClick={handleFilter}>Apply Filter</button>
        </div>
    );
}
