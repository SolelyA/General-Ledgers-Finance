import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { sendApprovalNotification } from '../emailUtils'; 
import { auth } from '../firebase'; // Import Firebase configuration
import Logo from '../logo';
import photo from "./image.png";
import './adminPage.css'

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
                //await sendApprovalNotification(userRef.userName, userRef.email);
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
                //await sendApprovalNotification(userRef.userName, userRef.email);
                console.log(`Successfully updated account state to "Rejected" for user with ID: ${userId}`);
            }));

            await fetchPendingUsers();
            window.location.reload();

            setSelectedItems([]);
        } catch (error) {
            console.error('Error updating account states:', error);
        }
    };

    const makeStyle=(accountState)=>{
        if(accountState === 'Active')
        {
            return {
                background: 'rgb(145 254 159 / 47%)',
                color: '#086210',
                paddingRight:'72px',
                paddingLeft:'72px'
            }
        }
        else if(accountState === 'Rejected')
        {
            return{
                background: '#ffadad8f',
                color: '#880808',
                paddingRight:'63px',
                paddingLeft:'63px'
            }
        }
        else if(accountState === 'Deactived')
        {
            return{
                background: '#A8A8A8',
                color: 'black',
                paddingRight:'58px',
                paddingLeft:'58px'
            }
        }
        else{
            return{
                background: 'rgba(97, 179, 213, 0.8)',
                color: '#073c89',
            }
        }
    }

    return (
        <div>

            <img className={"signup-logo"} src={photo}/>

            <div className={"login-header"}>
                <div className={"login-title"}>Admin Home Page</div>
                <div className={"admin-underline"}></div>
            </div>

            <div className={"adminApproval"}>

                <div className={"admin-subheader"}>
                    <div className={"admin-subtitle"}>Users List</div>
                    <div className={"admin-subUnderline"}></div>
                </div>

                <table className={"admin-table"}>
                    <tr className={"headers"}>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>DOB</th>
                        <th>Address</th>
                        <th>User Type</th>
                        <th>Account State</th>
                    </tr>

                    {users.map((user, key) => {
                        return (
                            <tr key={user}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.userName} </td>
                                <td>{user.dob}</td>
                                <td>{user.address} <br/></td>
                                <td>{user.userType}</td>
                                {/*<td>{user.accountState}</td>*/}
                                <td className={"acc-stat"}>
                                    <span className={"status"} style={makeStyle(user.accountState)}>{user.accountState}</span>
                                </td>
                            </tr>
                        )
                    })}
                </table>

                {/*<tr>*/}
                {/*    {users.map((user, index) => (*/}
                {/*        <React.Fragment key={index}>*/}
                {/*        <td key={index} className={"admin-list"}>*/}
                {/*                <strong>Name:</strong> {user.firstName} {user.lastName}*/}
                {/*                <strong>Email:</strong> {user.email}*/}
                {/*                <br/>*/}
                {/*                <strong>Username:</strong> {user.userName} <strong>DOB:</strong> {user.dob}*/}
                {/*                <strong>Address:</strong> {user.address} <br/>*/}
                {/*                <strong>User Type:</strong> {user.userType} <strong>Account*/}
                {/*                State:</strong> {user.accountState}*/}
                {/*                {index !== user.length - 1 && <hr/>}*/}
                {/*        </td>*/}
                {/*        </React.Fragment>*/}
                {/*    ))}*/}
                {/*</tr>*/}
            </div>

            <div className={"adminPending"}>

                <div className={"admin-subheader"}>
                    <div className={"admin-subtitle"}>Users List with Pending Admin Approval</div>
                    <div className={"admin-subUnderline2"}></div>
                </div>

                <table className={"admin-table"}>

                    <tr className={"headers"}>
                        <th>Select</th>
                        <th>Name</th>
                        <th>Username</th>
                    </tr>

                    {pendingUsers.map((user, key) => {
                        return (
                            <tr key={user.id}>
                                <td>
                                    <input
                                        className={"pending-input"}
                                        type="checkbox"
                                        id={user.id}
                                        checked={selectedItems.includes(user.id)}
                                        onChange={(event) => handleCheckboxChange(event, user.id)}
                                    />
                                </td>

                                <td>
                                    <label className={"pending-userID"} htmlFor={user.id}>
                                        {`${user.firstName} ${user.lastName}`}
                                    </label>
                                </td>

                                <td>
                                    <label className={"pending-userID"} htmlFor={user.id}>
                                        {`${user.userName}`}
                                    </label>
                                </td>

                            </tr>
                        )
                    })}
                </table>

                {/*<ul>*/}
                {/*    {pendingUsers.map((user) => (*/}
                {/*        <React.Fragment key={user.id}>*/}
                {/*            <li key={user.id}>*/}
                {/*                <input*/}
                {/*                    type="checkbox"*/}
                {/*                    id={user.id}*/}
                {/*                    checked={selectedItems.includes(user.id)}*/}
                {/*                    onChange={(event) => handleCheckboxChange(event, user.id)}*/}
                {/*                />*/}
                {/*                <label htmlFor={user.id}>*/}
                {/*                    {`${user.firstName} ${user.lastName} (Username: ${user.userName})`}*/}
                {/*                </label>*/}
                {/*            </li>*/}
                {/*            {user.id !== user.length - 1 && <hr/>}*/}
                {/*        </React.Fragment>*/}
                {/*    ))}*/}
                {/*</ul>*/}

                <div className={"admin-buttons"}>
                    <button className={"select-activate"} onClick={setSelectedUsersToActiveHandler}>Set Selected Users to Active</button>
                    {'      '}
                    <button className={"select-reject"} onClick={setSelectedUsersToRejectedHandler}>Set Selected Users to Reject</button>
                </div>

                <Link className={"admin-link"} to="/manage-users">Manage Users</Link>

            </div>

        </div>
    );
};

export default AdminPage;
