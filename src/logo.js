// logo.js

import React from 'react';
import logoImage from '../../images/logo.png'; // Import your logo image

import './logo.css'; // Import the CSS file for logo styling

const Logo = () => {
    return (
        <img src={logoImage} alt="Software Logo" className="logo" /> {/* Add the class name */}
    );
};

export default logo;
