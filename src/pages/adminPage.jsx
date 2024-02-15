import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { sendApprovalNotification } from '../emailUtils'; 
import { auth } from '../firebase'; // Import Firebase configuration

const AdminPage = () => {
    const userCol = collection(db, "users");
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);


    const navigate = useNavigate();

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
                await sendApprovalNotification(userRef.userName, userRef.email);
                console.log(`Successfully updated account state to "Active" for user with ID: ${userId}`);
            }));

            await fetchPendingUsers();
            window.location.reload();

            setSelectedItems([]);
        } catch (error) {
            console.error('Error updating account states:', error);
        }
    };

    const setSelectedUsersToRejectedHandler = async () => {
        try {
            await Promise.all(selectedItems.map(async (userId) => {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    accountState: 'Rejected'
                });
                await sendApprovalNotification(userRef.userName, userRef.email);
                console.log(`Successfully updated account state to "Rejected" for user with ID: ${userId}`);
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
                        <React.Fragment key={index}>
                        <li key={index}>
                            <strong>Name:</strong> {user.firstName} {user.lastName} <strong>Email:</strong> {user.email} <br />
                            <strong>Username:</strong> {user.userName} <strong>DOB:</strong> {user.dob} <strong>Address:</strong> {user.address} <br />
                            <strong>User Type:</strong> {user.userType} <strong>Account State:</strong> {user.accountState}
                            {index !== user.length - 1 && <hr />}
                        </li>
                        </React.Fragment>
                    ))}
                </ul>

            <div>
                <h2>Users List with Pending Admin Approval</h2>
                <ul>
                    {pendingUsers.map((user) => (
                        <React.Fragment key={user.id}>
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
                        {user.id !== user.length - 1 && <hr />}
                        </React.Fragment>
                    ))}
                </ul>
                <button onClick={setSelectedUsersToActiveHandler}>Set Selected Users to Active</button>
                {'      '}
                <button onClick={setSelectedUsersToRejectedHandler}>Set Selected Users to Rejected</button>
            </div>
            <div>
                <Link to ="/manage-users">Manage Users</Link>
            </div>
        </div>
    );
};

export default AdminPage;
