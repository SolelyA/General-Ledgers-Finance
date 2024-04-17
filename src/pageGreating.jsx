import React from 'react';

const Page = ({ username }) => {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <h1>
        Hi,
        </h1>
         {username}</div>
      {/* Rest of your page content */}
    </div>
  );
};

export default Page;
