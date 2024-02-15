import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from '../firebase';

const AdminPage = () => {
    const userCol = collection(db, "users");
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchPendingUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(userCol);
            const userData = querySnapshot.docs.map(doc => doc.data());
            setUsers(userData);
        } catch (error) {
            console.error('Error fetching users: ', error);
        }
    };

    const fetchPendingUsers = async () => {
        try {
            const q = query(userCol, where('accountState', '==', 'Pending Admin Approval'));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const pendingUsersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPendingUsers(pendingUsersData);
            } else {
                console.log('No users with pending admin approval found');
            }
        } catch (error) {
            console.error("Error fetching account state", error)
        }
    }

    const handleCheckboxChange = (event, userId) => {
        const { checked } = event.target;
        if (checked) {
            setSelectedItems(prevSelectedItems => [...prevSelectedItems, userId]);
        } else {
            setSelectedItems(prevSelectedItems => prevSelectedItems.filter(item => item !== userId));
        }
    };

    const setSelectedUsersToActiveHandler = async () => {
        try {
            await Promise.all(selectedItems.map(async (userId) => {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    accountState: 'Active'
                });
                console.log(`Successfully updated account state to "Active" for user with ID: ${userId}`);
            }));

            await fetchPendingUsers();
            window.location.reload();

            setSelectedItems([]);
        } catch (error) {
            console.error('Error updating account states:', error);
        }
    };

    return (
        <div>
            <h1>Admin Home Page</h1>
            <h2>Users List</h2>
                <ul>
                    {users.map((user, index) => (
                        <li key={index}>
                            <strong>Name:</strong> {user.firstName} {user.lastName} <strong>Email:</strong> {user.email} <br />
                            <strong>Username:</strong> {user.userName} <strong>DOB:</strong> {user.dob} <strong>Address:</strong> {user.address} <br />
                            <strong>User Type:</strong> {user.userType} <strong>Account State:</strong> {user.accountState}
                        </li>
                    ))}
                </ul>

            <div>
                <h2>Users List with Pending Admin Approval</h2>
                <ul>
                    {pendingUsers.map((user) => (
                        <li key={user.id}>
                            <input
                                type="checkbox"
                                id={user.id}
                                checked={selectedItems.includes(user.id)}
                                onChange={(event) => handleCheckboxChange(event, user.id)}
                            />
                            <label htmlFor={user.id}>
                                {`${user.firstName} ${user.lastName} (Username: ${user.userName})`}
                            </label>
                        </li>
                    ))}
                </ul>
                <button onClick={setSelectedUsersToActiveHandler}>Set Selected Users to Active</button>
            </div>
        </div>
    );
};

export default AdminPage;
