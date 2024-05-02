import { getUserData } from '../components/firestoreUtils';
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
import '../components/LandingPage.css';
import Popup from '../components/HelpButton/Popup';

const LandingPage = () => {
    const navigate = useNavigate();
    const acctsCol = collection(db, "accts");
    const [notifData, setNotifData] = useState('');
    const [userData, setUserData] = useState('');
    const [buttonPopup, setButtonPopup] = useState(false);
    const [allAcctsData, setAllAccts] = useState([]);
    const [assets, setAssets] = useState(0);
    const [liabilities, setLiabilities] = useState(0);
    const [equity, setEquity] = useState(0);
    const [currentRatio, setCurrentRatio] = useState(null);
    const [debtRatio, setDebtRatio] = useState(null);
    const [debtToEquityRatio, setDebtToEquityRatio] = useState(null);
    const [cash, setCash] = useState(null);

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
    }, []);

    useEffect(() => {
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
        };

        fetchAllAccts();
    }, []);

    useEffect(() => {
        const getRatioData = () => {
            let assetsTotal = 0;
            let liabilitiesTotal = 0;
            let equityTotal = 0;

            for (const account of allAcctsData) {
                if (account.acctCategory === 'Asset' || account.acctCategory === 'asset') {
                    assetsTotal += parseFloat(account.balance);
                } else if (account.acctCategory === 'Liability' || account.acctCategory === 'liability') {
                    liabilitiesTotal += parseFloat(account.balance);
                } else if (account.acctCategory === 'Equity' || account.acctCategory === 'equity') {
                    equityTotal += parseFloat(account.balance);
                }
            }

            setAssets(assetsTotal);
            setLiabilities(liabilitiesTotal);
            setEquity(equityTotal);
        };

        getRatioData();
    }, [allAcctsData]);

    useEffect(() => {
        const calculateRatio = () => {
            if (liabilities !== 0) {
                setCurrentRatio(assets / liabilities);
                setCash(assets + liabilities + equity / liabilities);
            } else {
                setCurrentRatio("Cannot calculate ratio: liabilities are zero");
                setCash("Cannot calculate ratio: liabilities are zero")
            }
            if (assets !== 0) {
                setDebtRatio(liabilities / assets);
            } else {
                setDebtRatio("Cannot calculate ratio: assets are zero");
            }
            if (equity !== 0) {
                setDebtToEquityRatio(liabilities / equity);
            } else {
                setDebtToEquityRatio("Cannot calculate ratio: equity is zero");
            }
        };

        calculateRatio();
    }, [assets, liabilities, equity]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const notifications = collection(db, `notifications`);
                const notifSnapshot = await getDocs(notifications);
                const notifData = notifSnapshot.docs.map(doc => doc.data());
                setNotifData(notifData);
            } catch (error) {
                console.error('Error fetching ledger data:', error);
            }
        };

        fetchNotifications();
    }, []);

    const getColor = (ratio) => {
        if (ratio === null) {
            return 'black'; // Default color for loading state
        } else if (ratio >= 1) {
            return 'green'; // Good ratio (e.g., >= 1 for Current Ratio)
        } else if (ratio < 1 && ratio > 0) {
            return 'yellow'; // Warning ratio (e.g., < 1 for Current Ratio)
        } else {
            return 'red'; // Bad ratio (e.g., < 0 for Debt to Equity Ratio)
        }
    };


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
                                    <td style={{ color: getColor(currentRatio) }}>
                                        {currentRatio === null ? 'Loading...' : parseFloat(currentRatio).toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Debt</td>
                                    <td style={{ color: getColor(debtRatio) }}>
                                        {debtRatio === null ? 'Loading...' : parseFloat(debtRatio).toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Debt to Equity</td>
                                    <td style={{ color: getColor(debtToEquityRatio) }}>
                                        {debtToEquityRatio === null ? 'Loading...' : parseFloat(debtToEquityRatio).toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Cash</td>
                                    <td style={{ color: getColor(cash) }}>
                                        {cash === null ? 'Loading...' : parseFloat(cash).toFixed(2)}
                                    </td>
                                </tr>

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
                    </>
                ) : (
                    <p>Please log in to view the dashboard</p>
                )}
            </div>
        </div>
    )
};

export default LandingPage;
