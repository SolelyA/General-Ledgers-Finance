import React from 'react';
import logoImage from './Images/logo.png'; // Import the logo image

const Logo = () => {
    return (
        <img
            src={logoImage}
            alt="Logo"
            style={{
                width: '150px',    // Set the width of the image
                height: 'auto',    // Maintain the aspect ratio
                position: 'fixed', // Set the positioning to fixed so it's relative to the viewport
                top: '60px',       // Move the image 20 pixels from the top
                marginLeft: '-5%',     // Move the image 20 pixels from the right
                zIndex: '1000',    // Set a high z-index to ensure it's above other elements
            }}
        />
    );
};

export default Logo;
