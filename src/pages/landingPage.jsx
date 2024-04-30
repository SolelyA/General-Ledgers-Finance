import { getUserData } from '../components/firestoreUtils'
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query } from "firebase/firestore";
import { db } from '../firebase';
import photo from "../Images/image.png";
import React from "react";
import Navbar from "../components/Navbar";
import HelpButton from '../components/HelpButton/HelpButton';
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';
import '../components/LandingPage.css'
import Popup from '../components/HelpButton/Popup'


const LandingPage = () => {
    const navigate = useNavigate();
    const acctsCol = collection(db, "accts");
    const [notifData, setNotifData] = useState('');
    const [userData, setUserData] = useState('');
    const [buttonPopup, setButtonPopup] = useState(false);
    const [allAcctsData, setAllAccts] = useState([]);
    const [currentRatio, setCurrentRatio] = useState();

    let assets = 0;
    let liabilities = 0;

    const fetchAllAccts = async () => {
        try {
            const q = query(acctsCol);
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllAccts(allAcctsData);
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.error("Error fetching account state", error)
        }
    }

    const getRatioData = async () => {
        for (const account of allAcctsData) {
            if (account.acctCategory === 'Asset' || account.acctCategory === 'asset'){
                assets += account.balance;
            }
            else if (account.acctCategory === 'Liability' || account.acctCategory === 'liability' ){
                liabilities += account.balance;
            }
        }
    };

    const calculateRatio = async () => {
        await getRatioData();
        if (liabilities !== 0) {
            setCurrentRatio(assets / liabilities);
        } else {
            setCurrentRatio("Cannot calculate ratio: liabilities are zero");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const userDataString = localStorage.getItem("userData");
            if (userDataString) {
                const userEmail = JSON.parse(userDataString);
                const userData = await getUserData(userEmail);
                setUserData(userData);
            }
        };

        fetchData();
        fetchAllAccts().then(() => {
            calculateRatio();
        });
    }, []);

    const fetchNotifications = async () => {
        try {
            const notifications = collection(db, `notifications`);
            const notifSnapshot = await getDocs(notifications);
            const notifData = notifSnapshot.docs.map(doc => doc.data());
            setNotifData(notifData);
        } catch (error) {
            console.error('Error fetching ledger data:', error);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div>
            <Navbar />
            <HelpButton
                title="Landing Page"
                welcome="Welcome to the Landing page!"
                text="This is the home page."
            />
            <PopupCalendar />
            <img className={"waiting-logo"} src={photo} />
            <div className={"waiting-text"}>
                <h1>Welcome To the Application Domain</h1>
            </div>
            <div>
                {userData ? (
                    <>
                        <h1>Dashboard</h1>
                        <table className="ratios-table">
                            <thead>
                                <tr>
                                    <th>Ratios</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Current</td>
                                    <td>{typeof currentRatio === 'undefined' ? 'Loading...' : parseFloat(currentRatio).toFixed(2)}</td>
                                </tr>
                                {/* Add other ratio rows here */}
                            </tbody>
                        </table>
                        <h2>Notifications</h2>
                        <button onClick={() => setButtonPopup(true)}>
                            {notifData.read ? "Click here to view notifications" : "Click here to view notifications"}
                        </button>
                        <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                            {notifData && (
                                <div>
                                    <h2>Notifications</h2>
                                    <table>
                                        <tbody>
                                            {notifData.map((entry, index) => (
                                                <tr key={index}>
                                                    <td>{entry.Message1} has made a new entry. Please review their table for approval</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Popup>

                        <div>
                            {isManager ?(
                                <button className='floatLeft libutton' onClick={() => navigate("/chart-of-accounts")}> Chart Of Accounts</button>
                                ):(<div>
                                    {isAccountant? (
                                        <div>
                                            <button className='floatLeft libutton' onClick={() => navigate("/chart-of-accounts")}> Chart Of Accounts</button>
                                        </div>
                                    ):(
                                        <p></p>
                                    )}
                
                                </div>)
                                }
                        </div>

                        <div>
                        {isManager ?(
                        <button className='floatLeft libutton' onClick={() => navigate("/manager-page")}> Manager Page</button>
                        ):(<div>
                            <p></p>
                        </div>)
                        }
                        </div>

                        <div>
                            {isAdmin ? (
                                <button className='floatLeft libutton' onClick={() => navigate("/admin-page")}> Admin Page</button>
                            ) : (<div>
                                <p></p>
                            </div>)} 
                        </div>
                        <div>
                            {isAdmin ? (
                                <button className='floatLeft libutton' onClick={() => navigate("/edit-accounts")}> Edit Accounts</button>
                            ) : (<div>
                                <p></p>
                            </div>)} 
                        </div>

                        
                    </>
                ) : (
                    <p>Please log in to view the dashboard</p>
                )}
            </div>
        </div>
    )
};

export default LandingPage;
