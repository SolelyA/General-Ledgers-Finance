import { useNavigate } from 'react-router-dom';
import './App.css'
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserData } from './firestoreUtils'
import { useState, useEffect } from "react";
import './App.css'
import 'react-calendar/dist/Calendar.css';


function Navbar() {
    const navigate = useNavigate();

    const [userData, setUserData] = useState('')
    // Parse the retrieved data if necessary
    useEffect(() => {
        const fetchData = async () => {
            const userDataString = localStorage.getItem("userData");
            if (userDataString) {
                const userEmail = JSON.parse(userDataString);
                const userData = await getUserData(userEmail);
                setUserData(userData);
            }
        };

        fetchData(); // Fetch user data when component mounts
    }, []); // Empty dependency array to run effect only once


    return (
        <div>
            <div className='navbar'>
            <div className='floatLeft libutton'> Journalizing</div>
                <div>
                    {userData ?(
                        <div className='floatLeft libutton' onClick={() => navigate("/view-accounts")}> View Accounts</div>
                    ):(
                        <div className='floatLeft libutton' onClick={() => navigate("/login")}> View Accounts</div>
                    )}
                </div>
                <div>
                    {userData ?(
                        <div className='floatLeft libutton' onClick={() => navigate("/admin-page")}> Admin Page</div>
                    ):(
                        <div className='floatLeft libutton' onClick={() => navigate("/login")}> Admin Page</div>
                    )}
                </div>
                <div>
                    {userData ?(
                        <div className='floatLeft libutton' onClick={() => navigate("/edit-accounts")}> Edit Accounts</div>
                    ):(
                        <div className='floatLeft libutton' onClick={() => navigate("/login")}> Edit Accounts</div>
                    )}
                </div>
                <div>
                    {userData ? (
                        <div className='floatRight libutton' onClick={() => { localStorage.clear(); signOut(auth); navigate("/login"); }}> Sign Out</div>
                    ) : (
                        <div className='floatRight libutton' onClick={() => { localStorage.clear(); signOut(auth); navigate("/login"); }}> Sign In </div>
                    )}
                </div>
                <div className='floatRight libutton'>
                    {userData ? (
                        userData.firstName
                    ) : (
                        'Profile'
                    )}
                </div>
            </div>
        </div>

    )
}
export default Navbar;