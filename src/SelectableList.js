import React from 'react';

const SelectableList = ({ items, selectedItems, handleCheckboxChange }) => {
    return (
        <div>
            <h2>Selectable List</h2>
            <ul>
                {items.map((user, index) => (
                    <li key={index}>
                        <input
                            type="checkbox"
                            id={`item${index}`}
                            value={user.email}
                            onChange={handleCheckboxChange}
                            checked={selectedItems.includes(user.email)}
                        />
                        <label htmlFor={`item${index}`}>{`${user.firstName} ${user.lastName} Username: ${user.userName} Account State: ${user.accountState}`}</label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SelectableList;
